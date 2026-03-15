"""
DALL-E 3 Image Generator for 7 Forges World Engine
Generates all images for Reality Forge (and can scale to all 7)
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
OUTPUT_DIR = Path(r"C:\Users\dwrek\100X_DEPLOYMENT\images\reality")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Reality Forge Image Prompts (Root Chakra - Red - 396 Hz)
REALITY_PROMPTS = {
    "reality-journey-unconscious": """A person in a modern apartment surrounded by comfort items, yet their energy field shows faint red roots reaching into empty space beneath them - no ground to grip. External stability masking internal groundlessness. The person sits in fetal position, surrounded by scattered eviction notices, bills, empty cupboards visible in background. Red energy dim and fragmented, trying to grip surfaces that have no depth. Dark moody lighting with deep red-brown shadows. Digital art style with symbolic realism, showing survival anxiety made visible. 16:9 aspect ratio.""",

    "reality-journey-awakening": """A person halfway emerged from quicksand of old patterns, one foot on solid earth, one still stuck. Their face shows both relief and grief - the cost of awakening. Behind them, false comforts they are releasing (material possessions fading away). Ahead, simple solid ground - less glamorous but real. Red energy now concentrated in their legs, stabilizing. Dawn breaking through darkness. Tension between chaos and order, hope mixed with struggle. Warm red-orange sunrise palette. Digital art, 16:9 aspect ratio.""",

    "reality-journey-conscious": """A grounded Warrior standing on foundation they built with their own hands, but their roots interweave with a community of grounded beings creating a foundation NETWORK not isolated fortress. They hold not a weapon but an open hand - strength expressed as capacity to help others find ground. Deep red energy flows as interconnected network, not just individual pillar. Brilliant warm red and golden light. Powerful yet peaceful posture. Digital art style, 16:9 aspect ratio.""",

    "reality-world-problem": """Split scene showing global foundation crisis. Left side: crumbling bridges and infrastructure, FORECLOSURE signs on houses, empty grocery store shelves, industrial wasteland with dead soil. Right side: disconnected people floating above ground, glued to phones, not touching earth, anxiety visible in body language. Dark red color palette with black shadows. Photorealistic with emotional impact showing housing crisis, food insecurity, and collective ungrounding. Wide cinematic shot, 16:9 aspect ratio.""",

    "reality-world-shift": """Hopeful transformation scene. People with hands in rich dark soil planting seeds in a community garden. Young builders constructing a tiny home with natural materials. Barefoot people practicing grounding in nature with visible connection to earth. Farmers market community gathering in background. Industrial gray landscape transitioning to vibrant regenerative green. Warm orange-red sunrise color palette. Photorealistic showing grassroots movement emerging. 16:9 aspect ratio.""",

    "reality-world-vision": """Fully grounded evolved civilization. Sustainable community with earthship-style homes integrated beautifully into natural landscape. Abundant food gardens and regenerative farms surrounding the community. Diverse people standing firmly grounded, feet on earth, confident and peaceful expressions. Children playing barefoot in healthy soil. Everyone's red root energy visible and interconnected in a vast underground network. Brilliant warm red and golden sunlight. Utopian yet achievable aesthetic. 16:9 aspect ratio."""
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
    print("DALL-E 3 IMAGE GENERATOR - REALITY FORGE")
    print("=" * 60)
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Images to generate: {len(REALITY_PROMPTS)}")
    print("=" * 60)

    results = []
    for filename, prompt in REALITY_PROMPTS.items():
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
