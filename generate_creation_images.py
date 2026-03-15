"""
DALL-E 3 Image Generator for CREATION FORGE
Sacral Chakra - Orange - 417 Hz - The Creator
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
OUTPUT_DIR = Path(r"C:\Users\dwrek\100X_DEPLOYMENT\images\creation")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# CREATION Forge Image Prompts (Sacral Chakra - Orange - 417 Hz)
CREATION_PROMPTS = {
    "creation-journey-unconscious": """A person sitting in an empty, sterile studio surrounded by blank canvases and broken tools. Their sacral area (lower belly) completely dark and blocked - orange energy stagnant and absent. Expression of creative frustration and emptiness. Unfinished projects abandoned around them. A guitar with broken strings, dried paint tubes, half-written pages crumpled. The person staring at blank space, unable to create. Gray lifeless atmosphere with hints of faded orange. Digital art style with symbolic realism showing creative block made visible, 16:9 aspect ratio.""",

    "creation-journey-awakening": """A creator in the moment of breakthrough - hands moving, orange energy swirling from their sacral center into their work. Sparks flying from their fingertips. Half-finished creations coming to life around them. Expression of excitement and flow state emerging. Behind them, the gray sterile environment is cracking with orange light. Passion projects beginning to take shape. First code working, first song playing, first art forming. Warm orange-sunrise color palette. Digital art, 16:9 aspect ratio.""",

    "creation-journey-conscious": """A master creator surrounded by their completed works - vibrant, alive, impacting others. Orange fire flowing freely from their sacral center, radiating through everything they touch. Multiple creations in various mediums: digital, physical, artistic, technical. Others being inspired by their work. Confident, playful expression. Creating new worlds with each gesture. Brilliant orange and golden light filling the scene. Creator and creation in perfect flow. Digital art style, 16:9 aspect ratio.""",

    "creation-world-problem": """Split scene showing global creativity crisis. Left side: Cubicle farm of identical workers, soul-crushing repetitive tasks, creativity literally being extracted as gray smoke. "Creating for the algorithm" shown as forced content creation. AI replacing human artists with assembly line efficiency. Right side: Children's art programs cut, music rooms empty, maker spaces closed. Orange energy completely drained from workers, pooling as profit for faceless corporations. Somber gray-orange color palette. Photorealistic with emotional impact, 16:9 aspect ratio.""",

    "creation-world-shift": """Hopeful transformation scene. Maker spaces filled with people building, experimenting, creating together. Indie game developers shipping passion projects. Musicians recording in home studios. 3D printers and laser cutters humming. AI tools being used to enhance human creativity, not replace it. Creator economy flourishing - people monetizing their passions. Children in art classes, adults learning instruments. Gray corporate landscape transitioning to vibrant orange creativity. Photorealistic showing maker revolution emerging. 16:9 aspect ratio.""",

    "creation-world-vision": """Fully creative civilization where everyone creates. Diverse people with visible orange sacral energy, all making something unique. Streets filled with art and music. Every person a creator in some medium - code, craft, music, writing, design. AI as creative partner not replacement. Beautiful architecture reflecting human creativity. Children and adults creating side by side. No creative blocks, no gatekeepers, no "starving artists." Brilliant orange and warm golden sunlight. Creative utopian aesthetic. 16:9 aspect ratio."""
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
    print("DALL-E 3 IMAGE GENERATOR - CREATION FORGE")
    print("Sacral Chakra | Orange | 417 Hz | The Creator")
    print("=" * 60)
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Images to generate: {len(CREATION_PROMPTS)}")
    print("=" * 60)

    results = []
    for filename, prompt in CREATION_PROMPTS.items():
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
