"""
DALL-E 3 Image Generator for INFINITY FORGE
Crown Chakra - Violet/White - 963 Hz - The Awakened One
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
OUTPUT_DIR = Path(r"C:\Users\dwrek\100X_DEPLOYMENT\images\infinity")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# INFINITY Forge Image Prompts (Crown Chakra - Violet/White - 963 Hz)
INFINITY_PROMPTS = {
    "infinity-journey-unconscious": """A person sitting in a gray room, completely disconnected from any sense of purpose or meaning. Their crown area shows no light - complete absence of violet or white energy. Expression of existential emptiness and spiritual disconnection. Surrounded by material possessions that bring no fulfillment. Looking upward but seeing only ceiling. No sense of connection to anything greater. Dark moody atmosphere with absent violet tones. Digital art style with symbolic realism showing spiritual disconnection made visible, 16:9 aspect ratio.""",

    "infinity-journey-awakening": """A person in the moment of spiritual breakthrough - their crown beginning to open with emerging violet and white light. First glimpses of cosmic connection. Expression of awe and wonder as they perceive something beyond the material. Behind them, the gray mundane world beginning to transform. Sacred geometry patterns faintly appearing around their head. Stars and galaxies glimpsed through cracks in ordinary reality. Warm violet and white energy spiraling upward. Digital art, 16:9 aspect ratio.""",

    "infinity-journey-conscious": """A fully awakened being with their crown chakra wide open, radiating brilliant violet and white light that connects them to the cosmos. Perfect alignment with universal consciousness. Floating or standing with serene expression of complete peace and understanding. Sacred geometry surrounding them - flower of life, metatron's cube. The boundary between self and universe dissolved. Brilliant violet, white, and golden light merging with cosmic backdrop. Digital art style showing enlightenment and cosmic unity, 16:9 aspect ratio.""",

    "infinity-world-problem": """Split scene showing global spiritual disconnection. Left side: People absorbed in screens, materialism, shallow pursuits - no connection to meaning or purpose visible. Spiritual traditions reduced to commercialized wellness products. Right side: Religious institutions divided and fighting, spiritual seekers lost in confusion, ancient wisdom forgotten or corrupted. Violet energy absent from humanity - replaced by gray disconnection. Somber gray-violet color palette. Photorealistic with emotional impact, 16:9 aspect ratio.""",

    "infinity-world-shift": """Hopeful transformation scene. People of all backgrounds sharing wisdom traditions. Meditation circles forming in parks and community centers. Ancient practices reviving alongside modern understanding - science and spirituality finding common ground. Near-death experience research opening minds. Psychedelic renaissance bringing healing. Children asking big questions about consciousness. Gray mundane world transitioning to violet-tinged awakening. Photorealistic showing spiritual renaissance emerging, 16:9 aspect ratio.""",

    "infinity-world-vision": """Fully awakened civilization where consciousness is understood as fundamental. Diverse people with visible violet and white crown energy, all connected to source and to each other. No more spiritual division - unity in diversity. Science and spirituality merged. Children taught meditation alongside mathematics. Death understood as transformation, not ending. Every person aware of their cosmic nature. Brilliant violet, white, and golden light connecting all beings. Transcendent utopian aesthetic. 16:9 aspect ratio."""
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
    print("DALL-E 3 IMAGE GENERATOR - INFINITY FORGE")
    print("Crown Chakra | Violet/White | 963 Hz | The Awakened One")
    print("=" * 60)
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Images to generate: {len(INFINITY_PROMPTS)}")
    print("=" * 60)

    results = []
    for filename, prompt in INFINITY_PROMPTS.items():
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
