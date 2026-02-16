#!/usr/bin/env python3
# ════════════════════════════════════════════════════════════════════════════════
# © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
# ════════════════════════════════════════════════════════════════════════════════
#
# PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
#
# This file contains proprietary intellectual property of Ryan Barbrick.
# All concepts, algorithms, implementations, and innovations are protected by
# copyright law and are considered trade secrets.
#
# PROVISIONAL PATENT NOTICE:
# The ideas, methods, systems, and code contained in this file are subject to
# provisional patent protection. Unauthorized use, reproduction, modification,
# or distribution is strictly prohibited.
#
# LEGAL WARNING:
# Unauthorized use of this intellectual property may result in:
# - Civil litigation for copyright infringement
# - Claims for actual and statutory damages ($750-$150,000 per work)
# - Injunctive relief and cease & desist orders
# - Criminal prosecution for willful infringement
# - Recovery of attorney fees and legal costs
#
# CREATOR INFORMATION:
# Author: Ryan Barbrick
# Business: Barbrick Design
# Contact: BarbrickDesign@gmail.com
# AI Assistant: Merlin AI
# Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
#
# PATENT DECLARATION:
# File: setup_tsx_api.py
# Declaration ID: IP-BF29285-MLL2902T
# Date: 2026-02-13
# Innovation Type: Software Implementation, Algorithm, System Design
#
# For licensing inquiries, contact: BarbrickDesign@gmail.com
# ════════════════════════════════════════════════════════════════════════════════

#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
TopStepX API Setup and Launcher Script

This script helps set up the TopStepX API bridge and launch the live data server.
"""

import os
import sys
import subprocess
import argparse

def install_dependencies():
    """Install required Python dependencies."""
    print("Installing Python dependencies...")
    
    # Install tsxapi4py dependencies
    tsx_requirements = os.path.join('tsxapi4py-main', 'requirements.txt')
    if os.path.exists(tsx_requirements):
        print(f"Installing TSX API dependencies from {tsx_requirements}")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', tsx_requirements])
    else:
        print(f"Warning: {tsx_requirements} not found. Installing basic dependencies...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'requests', 'pandas', 'python-dotenv'])
    
    # Install bridge dependencies
    bridge_requirements = 'bridge_requirements.txt'
    if os.path.exists(bridge_requirements):
        print(f"Installing bridge dependencies from {bridge_requirements}")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', bridge_requirements])
    else:
        print("Installing websockets for the bridge...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'websockets'])
    
    print("Dependencies installed successfully!")

def create_env_file():
    """Create a .env file template for TopStepX API credentials."""
    env_file = '.env'
    if not os.path.exists(env_file):
        print(f"Creating {env_file} template...")
        with open(env_file, 'w') as f:
            f.write("""# TopStepX API Configuration
# Fill in your TopStepX API credentials below

# Your TopStepX API Key
API_KEY=your_api_key_here

# Your TopStepX Username
USERNAME=your_username_here

# Environment (LIVE or DEMO)
ENVIRONMENT=DEMO

# Optional: Custom API URL (leave blank for default)
# API_URL=

# Optional: Custom WebSocket URL (leave blank for default)
# WS_URL=
""")
        print(f"{env_file} created. Please edit it with your TopStepX credentials.")
        return False
    else:
        print(f"{env_file} already exists.")
        return True

def launch_bridge(host='localhost', port=8765):
    """Launch the TopStepX API bridge server."""
    print(f"Launching TopStepX API bridge on {host}:{port}...")
    
    # Check if .env file has been configured
    env_file = '.env'
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            content = f.read()
            if 'your_api_key_here' in content or 'your_username_here' in content:
                print("Warning: .env file contains placeholder values.")
                print("Please edit the .env file with your actual TopStepX credentials.")
                return False
    
    # Launch the bridge server
    try:
        subprocess.run([
            sys.executable, 
            'tsx_live_data_bridge.py',
            '--host', host,
            '--port', str(port)
        ])
    except KeyboardInterrupt:
        print("\nBridge server stopped by user.")
    except Exception as e:
        print(f"Error launching bridge server: {e}")
        return False
    
    return True

def main():
    parser = argparse.ArgumentParser(description="TopStepX API Setup and Launcher")
    parser.add_argument('--setup', action='store_true', help='Install dependencies and create .env file')
    parser.add_argument('--launch', action='store_true', help='Launch the API bridge server')
    parser.add_argument('--host', default='localhost', help='Host for the bridge server (default: localhost)')
    parser.add_argument('--port', type=int, default=8765, help='Port for the bridge server (default: 8765)')
    
    args = parser.parse_args()
    
    if args.setup:
        print("=== TopStepX API Setup ===")
        install_dependencies()
        env_configured = create_env_file()
        
        if not env_configured:
            print("\n=== Next Steps ===")
            print("1. Edit the .env file with your TopStepX API credentials")
            print("2. Run: python setup_tsx_api.py --launch")
            print("3. Open FuturesByAgentR.html in your browser")
            print("4. Go to API Settings and select 'TopStepX API' as your data provider")
        else:
            print("\n=== Setup Complete ===")
            print("You can now launch the bridge server with: python setup_tsx_api.py --launch")
    
    elif args.launch:
        print("=== Launching TopStepX API Bridge ===")
        success = launch_bridge(args.host, args.port)
        if success:
            print("Bridge server launched successfully!")
        else:
            print("Failed to launch bridge server.")
            sys.exit(1)
    
    else:
        print("TopStepX API Setup and Launcher")
        print("")
        print("Usage:")
        print("  python setup_tsx_api.py --setup    # Install dependencies and create .env file")
        print("  python setup_tsx_api.py --launch   # Launch the API bridge server")
        print("")
        print("For help: python setup_tsx_api.py --help")

if __name__ == "__main__":
    main()
