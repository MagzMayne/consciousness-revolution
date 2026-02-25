#!/usr/bin/env python3
"""
OVERKORE License Key Generator
==============================
Generate, validate, and manage license keys for OVERKORE products.

Usage:
    python license_generator.py generate --tier PRO --email user@example.com
    python license_generator.py validate --key OVRK-XXXX-XXXX-XXXX-PRO
    python license_generator.py batch --tier FREE --count 10 --output keys.csv

Requirements:
    pip install supabase python-dotenv click
"""

import os
import sys
import secrets
import hashlib
import base64
import json
import csv
from datetime import datetime, timedelta
from typing import Optional, Tuple, List, Dict
import click

# Optional: Supabase integration
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


# =====================================================
# CONFIGURATION
# =====================================================

PRODUCT_PREFIX = "OVRK"
VALID_TIERS = ["FREE", "PRO", "ENT", "DEV"]

TIER_CONFIG = {
    "FREE": {
        "max_devices": 1,
        "expires_days": None,  # Never expires
        "features": {"max_messages": 100, "domains": ["1_command"]}
    },
    "PRO": {
        "max_devices": 3,
        "expires_days": 365,
        "features": {"max_messages": -1, "domains": "all", "api_access": False}
    },
    "ENT": {
        "max_devices": 10,
        "expires_days": 365,
        "features": {"max_messages": -1, "domains": "all", "api_access": True, "team_seats": 10}
    },
    "DEV": {
        "max_devices": 5,
        "expires_days": 365,
        "features": {"max_messages": -1, "domains": "all", "api_access": True, "white_label": True}
    }
}


# =====================================================
# CORE FUNCTIONS
# =====================================================

def generate_key(tier: str = "PRO") -> Tuple[str, str]:
    """
    Generate a license key and its hash.

    Returns:
        Tuple of (plain_key, key_hash)

    Key Format: OVRK-XXXX-XXXX-XXXX-TIER
    - OVRK: Product prefix
    - XXXX-XXXX-XXXX: 12 random alphanumeric chars (base32)
    - TIER: License tier
    """
    if tier not in VALID_TIERS:
        raise ValueError(f"Invalid tier. Must be one of: {VALID_TIERS}")

    # Generate 9 random bytes, encode as base32 (gives 15 chars, we use 12)
    random_bytes = secrets.token_bytes(9)
    encoded = base64.b32encode(random_bytes).decode('utf-8')[:12].upper()

    # Remove confusing characters (0, O, 1, I, L)
    translation = str.maketrans('01IL', 'WXYZ')
    encoded = encoded.translate(translation)

    # Format as XXXX-XXXX-XXXX
    parts = [encoded[i:i+4] for i in range(0, 12, 4)]
    key = f"{PRODUCT_PREFIX}-{'-'.join(parts)}-{tier}"

    # Generate SHA256 hash for storage
    key_hash = hashlib.sha256(key.encode('utf-8')).hexdigest()

    return key, key_hash


def validate_key_format(key: str) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Validate key format (not database validation).

    Returns:
        Tuple of (is_valid, tier, error_message)
    """
    if not key:
        return False, None, "Key is empty"

    parts = key.upper().split('-')

    if len(parts) != 5:
        return False, None, "Invalid key format (expected 5 parts)"

    if parts[0] != PRODUCT_PREFIX:
        return False, None, f"Invalid prefix (expected {PRODUCT_PREFIX})"

    # Check middle parts are alphanumeric
    for i, part in enumerate(parts[1:4], 1):
        if len(part) != 4 or not part.isalnum():
            return False, None, f"Invalid key segment {i}"

    # Check tier
    tier = parts[4]
    if tier not in VALID_TIERS:
        return False, None, f"Invalid tier (expected one of {VALID_TIERS})"

    return True, tier, None


def hash_key(key: str) -> str:
    """Hash a license key for storage/lookup."""
    return hashlib.sha256(key.upper().encode('utf-8')).hexdigest()


def get_key_prefix(key: str) -> str:
    """Get the first 8 characters for quick lookup."""
    parts = key.upper().split('-')
    if len(parts) >= 2:
        return f"{parts[0]}-{parts[1]}"
    return key[:8]


# =====================================================
# SUPABASE INTEGRATION
# =====================================================

def get_supabase_client() -> Optional[Client]:
    """Get Supabase client if configured."""
    if not SUPABASE_AVAILABLE:
        return None

    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_KEY')

    if not url or not key:
        return None

    return create_client(url, key)


def store_license(
    key: str,
    email: str,
    tier: str,
    name: Optional[str] = None,
    organization: Optional[str] = None,
    expires_days: Optional[int] = None,
    notes: Optional[str] = None
) -> Dict:
    """Store a license in Supabase."""
    client = get_supabase_client()
    if not client:
        return {"error": "Supabase not configured", "key": key}

    key_hash = hash_key(key)
    key_prefix = get_key_prefix(key)
    config = TIER_CONFIG.get(tier, {})

    # Calculate expiration
    expires_at = None
    exp_days = expires_days or config.get('expires_days')
    if exp_days:
        expires_at = (datetime.utcnow() + timedelta(days=exp_days)).isoformat()

    data = {
        "key_hash": key_hash,
        "key_prefix": key_prefix,
        "email": email,
        "name": name,
        "organization": organization,
        "tier": tier,
        "product": "araya",
        "expires_at": expires_at,
        "max_devices": config.get('max_devices', 3),
        "metadata": {"features": config.get('features', {})},
        "notes": notes
    }

    try:
        result = client.table('licenses').insert(data).execute()
        return {"success": True, "id": result.data[0]['id'] if result.data else None}
    except Exception as e:
        return {"error": str(e)}


def validate_key_in_db(key: str, hardware_id: Optional[str] = None) -> Dict:
    """Validate a license key against the database."""
    client = get_supabase_client()
    if not client:
        return {"valid": False, "error": "Supabase not configured"}

    key_hash = hash_key(key)

    try:
        # Use the validate_license function we created
        result = client.rpc('validate_license', {
            'p_key_hash': key_hash,
            'p_hardware_id': hardware_id
        }).execute()

        if result.data and len(result.data) > 0:
            row = result.data[0]
            return {
                "valid": row.get('is_valid', False),
                "tier": row.get('tier'),
                "expires_at": row.get('expires_at'),
                "features": row.get('features'),
                "error": row.get('error_message')
            }

        return {"valid": False, "error": "Validation failed"}

    except Exception as e:
        return {"valid": False, "error": str(e)}


# =====================================================
# CLI COMMANDS
# =====================================================

@click.group()
def cli():
    """OVERKORE License Key Manager"""
    pass


@cli.command()
@click.option('--tier', '-t', type=click.Choice(VALID_TIERS), default='PRO', help='License tier')
@click.option('--email', '-e', required=True, help='Customer email')
@click.option('--name', '-n', help='Customer name')
@click.option('--org', '-o', help='Organization name')
@click.option('--expires', type=int, help='Days until expiration (overrides tier default)')
@click.option('--notes', help='Internal notes')
@click.option('--store/--no-store', default=True, help='Store in Supabase')
def generate(tier, email, name, org, expires, notes, store):
    """Generate a new license key."""
    key, key_hash = generate_key(tier)

    click.echo(f"\n{'='*50}")
    click.echo(f"  LICENSE KEY GENERATED")
    click.echo(f"{'='*50}")
    click.echo(f"  Key:    {click.style(key, fg='green', bold=True)}")
    click.echo(f"  Tier:   {tier}")
    click.echo(f"  Email:  {email}")
    click.echo(f"  Hash:   {key_hash[:16]}...")
    click.echo(f"{'='*50}\n")

    if store:
        result = store_license(
            key=key,
            email=email,
            tier=tier,
            name=name,
            organization=org,
            expires_days=expires,
            notes=notes
        )

        if result.get('success'):
            click.echo(click.style("  Stored in Supabase", fg='green'))
        elif result.get('error'):
            click.echo(click.style(f"  Storage error: {result['error']}", fg='yellow'))
        else:
            click.echo(click.style("  Not stored (Supabase not configured)", fg='yellow'))

    # Copy to clipboard if available
    try:
        import pyperclip
        pyperclip.copy(key)
        click.echo("  Copied to clipboard")
    except:
        pass


@cli.command()
@click.option('--key', '-k', required=True, help='License key to validate')
@click.option('--hardware', '-h', help='Hardware ID for activation')
def validate(key, hardware):
    """Validate a license key."""
    # First check format
    is_valid, tier, error = validate_key_format(key)

    if not is_valid:
        click.echo(click.style(f"  Invalid format: {error}", fg='red'))
        return

    click.echo(f"  Format: {click.style('Valid', fg='green')}")
    click.echo(f"  Tier:   {tier}")

    # Check database if available
    result = validate_key_in_db(key, hardware)

    if result.get('valid'):
        click.echo(click.style("  Database: Valid", fg='green'))
        click.echo(f"  Expires: {result.get('expires_at', 'Never')}")
        click.echo(f"  Features: {json.dumps(result.get('features', {}), indent=2)}")
    elif result.get('error') == "Supabase not configured":
        click.echo(click.style("  Database: Not checked (Supabase not configured)", fg='yellow'))
    else:
        click.echo(click.style(f"  Database: Invalid - {result.get('error')}", fg='red'))


@cli.command()
@click.option('--tier', '-t', type=click.Choice(VALID_TIERS), default='FREE', help='License tier')
@click.option('--count', '-c', type=int, default=10, help='Number of keys to generate')
@click.option('--output', '-o', default='licenses.csv', help='Output CSV file')
@click.option('--store/--no-store', default=False, help='Store in Supabase (requires --emails)')
@click.option('--emails', help='File with emails (one per line)')
def batch(tier, count, output, store, emails):
    """Generate multiple license keys."""
    email_list = []

    if emails:
        with open(emails, 'r') as f:
            email_list = [line.strip() for line in f if line.strip()]

        if len(email_list) < count:
            click.echo(click.style(f"Warning: Only {len(email_list)} emails provided for {count} keys", fg='yellow'))
            count = len(email_list)

    keys = []
    for i in range(count):
        key, key_hash = generate_key(tier)
        email = email_list[i] if i < len(email_list) else f"user{i+1}@example.com"

        keys.append({
            'key': key,
            'key_hash': key_hash,
            'tier': tier,
            'email': email,
            'created': datetime.utcnow().isoformat()
        })

        if store and emails:
            result = store_license(key=key, email=email, tier=tier)
            keys[-1]['stored'] = result.get('success', False)

    # Write to CSV
    with open(output, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['key', 'tier', 'email', 'created', 'key_hash'])
        writer.writeheader()
        for k in keys:
            writer.writerow({
                'key': k['key'],
                'tier': k['tier'],
                'email': k['email'],
                'created': k['created'],
                'key_hash': k['key_hash']
            })

    click.echo(f"\n  Generated {count} {tier} keys")
    click.echo(f"  Output: {output}")


@cli.command()
def tiers():
    """Show available license tiers."""
    click.echo("\n  OVERKORE License Tiers\n")

    for tier, config in TIER_CONFIG.items():
        click.echo(f"  {click.style(tier, fg='cyan', bold=True)}")
        click.echo(f"    Max Devices: {config['max_devices']}")
        click.echo(f"    Expires:     {config['expires_days'] or 'Never'} days")
        click.echo(f"    Features:    {json.dumps(config['features'])}")
        click.echo()


@cli.command()
def test():
    """Test key generation and validation."""
    click.echo("\n  Running tests...\n")

    for tier in VALID_TIERS:
        key, key_hash = generate_key(tier)
        is_valid, parsed_tier, error = validate_key_format(key)

        status = click.style("PASS", fg='green') if is_valid and parsed_tier == tier else click.style("FAIL", fg='red')
        click.echo(f"  {tier}: {key} - {status}")

    click.echo("\n  Done!\n")


# =====================================================
# MAIN
# =====================================================

if __name__ == '__main__':
    cli()
