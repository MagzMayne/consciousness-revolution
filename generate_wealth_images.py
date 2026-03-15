"""
DALL-E 3 Image Generator for WEALTH FORGE
Solar Plexus Chakra - Yellow - 528 Hz - The Sovereign
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
OUTPUT_DIR = Path(r"C:\Users\dwrek\100X_DEPLOYMENT\images\wealth")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# WEALTH Forge Image Prompts (Solar Plexus Chakra - Yellow - 528 Hz)
WEALTH_PROMPTS = {
    "wealth-journey-unconscious": """A person hunched over, depleted, their solar plexus area dark and hollow. Surrounded by bills, debt notices, empty wallet, scarcity everywhere. Yellow energy completely absent - replaced by gray anxiety. Expression of financial stress and powerlessness. Trapped in a cycle they cannot see how to escape. Chains made of dollar signs binding their wrists. Dark moody atmosphere with shadows of creditors looming. Digital art style with symbolic realism showing financial imprisonment, 16:9 aspect ratio.""",

    "wealth-journey-awakening": """A person beginning to stand taller, their solar plexus starting to glow with faint golden light. Breaking free from debt chains - one wrist already free. First wealth creation happening - small golden coins materializing around them. Expression shows dawning realization and returning power. Yellow energy swirling in their core, growing stronger. Behind them, scarcity thinking fading away. Dawn breaking through darkness. Hope mixed with determination. Warm golden-yellow palette. Digital art, 16:9 aspect ratio.""",

    "wealth-journey-conscious": """A fully empowered sovereign standing tall in abundance - their solar plexus radiating brilliant golden sun energy. Wealth flowing TO them and FROM them freely - generosity and receiving in perfect balance. Multiple streams of golden light flowing from their center. Confident, calm expression of financial mastery. No chains, no anxiety. Surrounded by symbols of sustainable wealth - not hoarding but flowing. Brilliant yellow and gold light illuminating everything. Powerful yet peaceful prosperity. Digital art style, 16:9 aspect ratio.""",

    "wealth-world-problem": """Split scene showing global wealth crisis. Left side: Debt numbers in red climbing on screens, credit card bills piling up, student loan trap visualized, people working multiple jobs still unable to get ahead. Right side: Wealth inequality visualized - tiny figures looking up at massive golden tower owned by few, middle class shrinking, financial literacy books locked behind paywalls. Yellow energy completely absent from the masses - concentrated in tiny elite. Somber gray-yellow color palette. Photorealistic with emotional impact, 16:9 aspect ratio.""",

    "wealth-world-shift": """Hopeful transformation scene. People teaching each other financial literacy in community centers. Cryptocurrency and decentralized finance symbols as alternative paths. Young entrepreneurs launching side hustles. Crowdfunding campaigns succeeding. Micro-investing apps on phones. Financial coaches sharing knowledge freely. "Debt free" celebrations. The hoarded gold tower cracking as wealth redistributes. Gray landscape transitioning to warm golden light. Photorealistic showing financial sovereignty movement emerging. 16:9 aspect ratio.""",

    "wealth-world-vision": """Fully abundant civilization where wealth flows freely. Diverse people with visible golden solar plexus energy, all standing in prosperity. Multiple currencies and value systems coexisting. Universal basic services ensuring no one lacks foundation. Entrepreneurs and creators thriving. Children learning money management in schools. No debt slavery - only conscious wealth creation. Everyone sovereign over their finances. Brilliant golden and warm sunlight. Abundant but not excessive - sustainable prosperity aesthetic. 16:9 aspect ratio."""
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
    print("DALL-E 3 IMAGE GENERATOR - WEALTH FORGE")
    print("Solar Plexus Chakra | Yellow | 528 Hz | The Sovereign")
    print("=" * 60)
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Images to generate: {len(WEALTH_PROMPTS)}")
    print("=" * 60)

    results = []
    for filename, prompt in WEALTH_PROMPTS.items():
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
