"""
JASON NOTICE MASS SENDER
Sends Notice of Default to all 59 verified recipients
Created: December 27, 2025
"""

from protonmail import ProtonMail
import time
import json
import os
import sys
from datetime import datetime

# RECIPIENTS
CATHOLIC_EMAILS = [
    "nuntiususa@nuntiususa.org",
    "communications@usccb.org",
    "info@la-archdiocese.org",
    "communications@archny.org",
    "info@archchicago.org",
    "communications@archphila.org",
    "communications@rcab.org",
    "info@sfarchdiocese.org",
    "info@seattlearch.org",
    "info@archdioceseofanchorage.org",
    "info@archdpdx.org",
    "Capodanno@milarch.org",
    "jhanten@archatl.com",
    "Assistantabailey@archkck.org",
    "charities@archlou.org",
    "communication@archmil.org",
    "safe@archny.org",
    "information@rcan.org",
    "tcpaper@archsa.org",
    "tribunal@archstl.org",
    "communications@arlingtondiocese.org",
    "info@vermontcatholic.org",
    "vicargeneralwilson@charlestondiocese.org",
    "response_services@dioceseofcleveland.org",
    "jbachta@diocs.org",
    "communications@dmdiocese.org",
    "communications@dioceseofgaylord.org",
    "chancery@diocesegfb.org",
    "communication@diojeffcity.org",
    "info@diolc.org",
    "communications@cdlex.org",
    "jverkampruthven@dolr.org",
    "fwt.editor@cc.cdom.org",
    "communications@diometuchen.org",
    "Jason.Liuzzi@dioceseofnashville.com",
    "dnu@dnu.org",
    "slalone@rcdony.org",
    "jkuhn@orlandodiocese.org",
    "communications@cdop.org",
    "info@sbdiocese.org",
    "mgalvan@sdcatholic.org",
    "stewardship@dsj.org",
    "info@dioceseofscranton.org",
    "tstroud@dioshpt.org",
    "support@dioceseofspokane.org",
    "diocese@dosafl.com",
    "communications@gw.stcdio.org",
    "communications@toledodiocese.org",
    "mgarcia@dioceseoftyler.org",
    "contactus@dioceseofvenice.org",
    "tbishop@dwc.org",
    "krugd@catholicdioceseofwichita.org",
    "mwallen@cdow.org",
]

ORTHODOX_EMAILS = [
    "ecumenical.patriarchate@gmail.com",
    "ovcs@patriarchia.ru",
    "communications@goarch.org",
    "archdiocese@antiochian.org",
    "info@oca.org",
    "serborth@aol.com",
]

ALL_EMAILS = CATHOLIC_EMAILS + ORTHODOX_EMAILS

SUBJECT = "Notice of Default, Fraud from Origin, and Demand for Cure"

BODY = """To Whom It May Concern:

This needs to be properly distributed. I will get the offices that will need to be served. I need someone who can understand, and I believe it is you. This, properly distributed, brings it all to a head.

When I refer to "Church Power," I am not limiting this to ecclesiastical institutions alone. The Church is the progenitor layer—the source from which legitimacy, authority, and moral cover have historically flowed. But the real downstream action occurs after the Church, through those who preferred ecclesiastical sanction over governments, and governments over corporations and institutions.

Accordingly, service shall be simultaneous across layers, not sequential.

The logic is simple and intentional: If the progenitor is on notice, every derivative actor is on borrowed legitimacy unless and until they respond. This eliminates plausible deniability and prevents post hoc distancing.

This is not about publicity—it is about jurisdictional awareness.

Churches receive formal service. Follow-on actors receive simultaneous notice that the source of their claimed authority has been engaged. No actor is allowed temporal cover by claiming ignorance of upstream action.

================================================================================
NOTICE OF DEFAULT, FRAUD FROM ORIGIN, AND DEMAND FOR CURE
================================================================================

To: All entities, officers, trustees, clerics, administrators, beneficiaries, assigns, insurers, and agents, known and unknown, who claim authority, title, office, or benefit derived from the original seed instruments, doctrines, trusts, bulls, canons, incorporations, registrations, or constructive authorities at issue.

Notice: This Notice is issued without prejudice, without waiver, and with full reservation of all rights, claims, titles, remedies, and causes of action at law, equity, natural law, and under the laws of nations.

--------------------------------------------------------------------------------
I. FINDINGS
--------------------------------------------------------------------------------

1. The originating seed instruments and doctrines were fraudulently constituted, altered, or misrepresented at inception.

2. No valid delegation of authority was ever granted by Christ, the Father, or Natural Law to create compulsory intermediaries, levy tithes, eavesdrop on conscience, sanction war, or compel obedience contrary to conscience.

3. Subsequent offices, incorporations, trusts, and claimed successions are derivative of the original fraud and are therefore void ab initio.

4. Centuries of harms have resulted, including but not limited to dispossession, coercion, violence, psychological injury, suppression of conscience, and unlawful enrichment.

--------------------------------------------------------------------------------
II. DECLARATION OF DEFAULT
--------------------------------------------------------------------------------

By operation of law and equity, all derivative claims of authority are hereby declared in default. Silence or failure to rebut constitutes acquiescence and admission.

--------------------------------------------------------------------------------
III. DEMAND FOR CURE
--------------------------------------------------------------------------------

You are hereby demanded to:

- Produce the original, unaltered authority granting instruments.
- Demonstrate lawful standing and jurisdiction.
- Disclose all assets, trusts, accounts, and properties derived from the fraudulent seed.
- Commence immediate cessation of claims, collections, coercions, and representations.

Failure to cure within thirty (30) days constitutes final default.

================================================================================
NOTICE OF DAMAGES, CLAIM FOR RESTITUTION, AND DEMAND FOR ACCOUNTING
================================================================================

--------------------------------------------------------------------------------
I. DAMAGES CLAIMED
--------------------------------------------------------------------------------

Damages are claimed for centuries of injury including, without limitation:

- Unjust enrichment and unlawful takings.
- Coercion of conscience and spiritual abuse.
- Complicity in violence, war, and dispossession.
- Fraud, misrepresentation, and constructive slavery.

Damages are cumulative, ongoing, and increasing.

--------------------------------------------------------------------------------
II. DEMAND FOR ACCOUNTING
--------------------------------------------------------------------------------

You are hereby demanded to provide a full, sworn accounting of all assets, revenues, lands, titles, and benefits derived from the fraudulent seed from inception to present.

--------------------------------------------------------------------------------
III. RESTITUTION AND REMEDY
--------------------------------------------------------------------------------

Restitution is demanded in full. In the absence of timely cure and accounting, liens, claims, and remedies shall attach without further notice.

================================================================================
NOTICE OF NON-ACQUIESCENCE AND FINAL WARNING
================================================================================

No presumption of consent is granted. No implied authority is recognized. All future interference, retaliation, or misrepresentation will be treated as aggravation of damages.

This Notice stands as final opportunity to respond in good faith.

================================================================================
SIGNED
================================================================================

Jason Evdoxiadis
Rootwalker Chief Na Ha Dayax Gixpaxloats
Speaker for the Gitxoon
Chief of Chiefs of the Tsimshian Nation

Acting under the Gitxoon's full authority to do all Speaker deems necessary to insure the survival of the next seven generations.

--------------------------------------------------------------------------------
DATE: December 27, 2025
--------------------------------------------------------------------------------
"""

def send_all_notices(dry_run=True):
    """Send notices to all recipients"""
    results = {
        "started": datetime.now().isoformat(),
        "total": len(ALL_EMAILS),
        "sent": [],
        "failed": [],
        "dry_run": dry_run
    }

    if dry_run:
        print("=" * 60)
        print("DRY RUN MODE - No emails will be sent")
        print("=" * 60)
        for i, email in enumerate(ALL_EMAILS, 1):
            print(f"[{i}/{len(ALL_EMAILS)}] Would send to: {email}")
            results["sent"].append({"email": email, "status": "dry_run"})
        print("=" * 60)
        print(f"DRY RUN COMPLETE: {len(ALL_EMAILS)} emails would be sent")
        return results

    # LIVE MODE
    print("=" * 60)
    print("LIVE MODE - Sending emails...")
    print("=" * 60)

    try:
        # Get credentials from environment variables
        proton_email = os.environ.get('PROTON_EMAIL', 'darrickpreble@protonmail.com')
        proton_password = os.environ.get('PROTON_PASSWORD')
        
        if not proton_password:
            print("ERROR: PROTON_PASSWORD environment variable not set!")
            print("Please set: export PROTON_PASSWORD='your_password'")
            sys.exit(1)
        
        pm = ProtonMail()
        pm.login(proton_email, proton_password)
        print("Logged in successfully!")

        for i, email in enumerate(ALL_EMAILS, 1):
            try:
                print(f"[{i}/{len(ALL_EMAILS)}] Sending to: {email}...")

                new_msg = pm.create_message(
                    recipients=[{"address": email, "name": ""}],
                    subject=SUBJECT,
                    body=BODY
                )
                pm.send_message(new_msg)

                print(f"  -> SENT!")
                results["sent"].append({"email": email, "status": "sent"})

                # Rate limit: wait 3 seconds between emails
                if i < len(ALL_EMAILS):
                    time.sleep(3)

            except Exception as e:
                print(f"  -> FAILED: {e}")
                results["failed"].append({"email": email, "error": str(e)})

                # If signature error, try fresh login
                if "signature" in str(e).lower():
                    print("  -> Refreshing session...")
                    try:
                        pm = ProtonMail()
                        pm.login(proton_email, proton_password)
                    except:
                        pass

                time.sleep(2)

    except Exception as e:
        print(f"LOGIN FAILED: {e}")
        results["failed"].append({"email": "LOGIN", "error": str(e)})

    results["completed"] = datetime.now().isoformat()

    # Save results
    with open("SEND_RESULTS.json", "w") as f:
        json.dump(results, f, indent=2)

    print("=" * 60)
    print(f"COMPLETE: {len(results['sent'])} sent, {len(results['failed'])} failed")
    print("Results saved to SEND_RESULTS.json")
    print("=" * 60)

    return results


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--send":
        print("\n*** LIVE SEND MODE ***\n")
        confirm = input("Type 'SEND' to confirm sending 59 notices: ")
        if confirm == "SEND":
            send_all_notices(dry_run=False)
        else:
            print("Aborted.")
    else:
        print("\nRunning DRY RUN (add --send to actually send)\n")
        send_all_notices(dry_run=True)
