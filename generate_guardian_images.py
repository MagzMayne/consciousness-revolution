"""
DALL-E 3 Image Generator for GUARDIAN FORGE
Heart Chakra - Green - 639 Hz - The Protector
"""

import os
import requests
from openai import OpenAI
from pathlib import Path

# Load API key
with open(r"C:\Users\dwrek\.env.openai", "r") as f:
    api_key = f.read().strip().split("=")[1]

client = OpenAI(api_key=api_key)

# Output directory
OUTPUT_DIR = Path(r"C:\Users\dwrek\100X_DEPLOYMENT\images\guardian")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# GUARDIAN Forge Image Prompts (Heart Chakra - Green - 639 Hz)
GUARDIAN_PROMPTS = {
    "guardian-journey-unconscious": """A person with their heart completely encased in dark armor, isolating behind high stone walls. Green heart energy is dim and trapped, unable to reach outward. The person's posture is defensive, arms crossed, eyes suspicious. Around them, loved ones reach out but cannot penetrate the walls. Fear of connection and vulnerability visible in their body language. Dark environment with only faint traces of green light struggling to escape the armor. Isolation masking deep hurt. Digital art style with emotional symbolism, 16:9 aspect ratio.""",

    "guardian-journey-awakening": """A transformative moment - the armor around the heart is cracking with brilliant green light streaming through the cracks. The person is reaching out to protect a child or loved one, walls behind them crumbling into bridges. First acts of fierce protection expressed through love, not just fear. Green heart energy beginning to pulse visibly from chest, expanding outward. Expression shows both pain of opening and relief of connection. Dawn light mixing with emerald green. Emotional tension and hope. Digital art, 16:9 aspect ratio.""",

    "guardian-journey-conscious": """A fully heart-centered Protector standing in fierce compassion - open chest radiating brilliant green light while holding a protective shield that covers others behind them. They protect not from fear but from love. Green energy flows in an expansive network connecting them to community. Strong yet gentle stance. Children safe behind the guardian, justice scales balanced nearby. The shield has a heart emblem. Brilliant emerald and golden light. Powerful yet peaceful expression. Digital art style, 16:9 aspect ratio.""",

    "guardian-world-problem": """Split scene showing global protection crisis. Left side: Family court corruption with parents separated from children by cold judges, stacks of legal papers creating walls between families, "$300/hr" lawyer bills piling up. Children crying behind glass barriers. Right side: Domestic abuse hidden behind closed doors, vulnerable elderly being exploited, whistleblowers silenced, justice scales severely tilted toward those with money. Dark green-gray color palette with ominous undertones. Photorealistic with emotional impact showing justice system failures. Wide cinematic shot, 16:9 aspect ratio.""",

    "guardian-world-shift": """Hopeful transformation scene. Grassroots advocates organizing in community centers, teaching Pro Se legal strategies. Parent support groups forming circles. Domestic violence survivors helping new survivors escape. Young lawyers providing free legal aid in makeshift community offices. Whistleblowers being protected by citizen networks. Children being reunited with loving parents. Court reformers winning small victories. Dark institutional gray transitioning to warm green light. Community protection rising. Photorealistic showing guardian movement emerging. 16:9 aspect ratio.""",

    "guardian-world-vision": """A protected world vision. Family courts that work for families - judges who serve children's real best interests. Communities where everyone has access to legal protection regardless of income. Abuse survivors supported by visible networks of care. Whistleblowers celebrated as heroes. Children safe and thriving in intact families. Justice scales perfectly balanced. Diverse protectors standing together, hearts open, shields ready - protecting not just their own but all vulnerable. Brilliant emerald and golden sunlight. Compassionate utopian aesthetic. 16:9 aspect ratio."""
}

def generate_image(prompt: str, filename: str) -> str:
    """Generate an image using DALL-E 3 and save it."""
    print(f"\n Generating: {filename}")
    print(f"   Prompt: {prompt[:80]}...")

    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1792x1024",  # 16:9 HD
            quality="standard",
            n=1
        )

        image_url = response.data[0].url

        # Download and save
        img_response = requests.get(image_url)
        filepath = OUTPUT_DIR / f"{filename}.png"

        with open(filepath, "wb") as f:
            f.write(img_response.content)

        print(f"   Saved: {filepath}")
        return str(filepath)

    except Exception as e:
        print(f"   ERROR: {e}")
        return None

def main():
    print("=" * 60)
    print("DALL-E 3 IMAGE GENERATOR - GUARDIAN FORGE")
    print("Heart Chakra | Green | 639 Hz | The Protector")
    print("=" * 60)
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Images to generate: {len(GUARDIAN_PROMPTS)}")
    print("=" * 60)

    results = []
    for filename, prompt in GUARDIAN_PROMPTS.items():
        result = generate_image(prompt, filename)
        results.append((filename, result))

    print("\n" + "=" * 60)
    print("GENERATION COMPLETE")
    print("=" * 60)

    success = sum(1 for _, r in results if r)
    print(f"Success: {success}/{len(results)}")

    for filename, result in results:
        status = "OK" if result else "FAILED"
        print(f"  [{status}] {filename}")

    print("\nImages saved to:", OUTPUT_DIR)

if __name__ == "__main__":
    main()
