"""
DALL-E 3 Image Generator for CHARACTER FORGE
Third Eye Chakra - Indigo - 852 Hz - The Seer
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
OUTPUT_DIR = Path(r"C:\Users\dwrek\100X_DEPLOYMENT\images\character")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# CHARACTER Forge Image Prompts (Third Eye Chakra - Indigo - 852 Hz)
CHARACTER_PROMPTS = {
    "character-journey-unconscious": """A person sitting in a dark room, surrounded by invisible puppet strings controlling their movements - they cannot see the manipulation. Their third eye area (forehead center) is completely dark and blocked. Shadowy puppet master hands in background pulling strings attached to their limbs, emotions, decisions. The person looks confused, reactive, blaming others. Indigo energy completely absent, replaced by murky gray fog around the head. Dark moody atmosphere with hints of deep indigo-black shadows. Digital art style with symbolic realism, showing pattern blindness made visible. 16:9 aspect ratio.""",

    "character-journey-awakening": """A person in the moment of awakening - their third eye beginning to crack open with brilliant indigo light streaming through. They are looking at their hands and seeing the puppet strings for the first time - some strings dissolving as awareness grows. Expression shows both shock and relief - "I can finally SEE." Indigo energy swirling around their head, the puppet master hands retreating into shadows. Dawn breaking through darkness behind them. Tension between old manipulation and new clarity. Deep indigo and violet color palette with emerging light. Digital art, 16:9 aspect ratio.""",

    "character-journey-conscious": """A fully awakened Seer standing tall with their third eye wide open, radiating brilliant indigo light. They can see all patterns clearly - manipulation attempts visible as transparent arrows that they calmly deflect. No puppet strings remain. Around them, a network of visible patterns connecting people, events, and energies - they read reality like a book. Confident, serene expression. Deep indigo and violet energy flowing through crown and third eye. Behind them, others beginning their awakening journey. Powerful yet peaceful. Brilliant indigo and golden light. Digital art style, 16:9 aspect ratio.""",

    "character-world-problem": """Split scene showing global manipulation crisis. Left side: masses of people with closed third eyes, controlled by social media algorithms (glowing phone screens as puppeteer strings), political propaganda projected on giant screens, corporate logos as hypnotic patterns. Dark patterns in UI visible everywhere. Right side: news anchors with forked tongues, influencers with hollow eyes, advertising manipulating emotions. Murky indigo-gray color palette with ominous undertones. Photorealistic with emotional impact showing psychological warfare on humanity. Wide cinematic shot, 16:9 aspect ratio.""",

    "character-world-shift": """Hopeful transformation scene. People gathering in circles, teaching each other to see manipulation patterns - pointing them out, laughing at previously-effective tricks. Young person showing elderly person dark patterns on a screen, making them visible. Students in classroom learning critical thinking with "Pattern Detection" on whiteboard. Fact-checkers and whistleblowers celebrated as heroes in background. Industrial manipulation machinery rusting and abandoned. Gray propaganda landscape transitioning to clear indigo sky. Warm indigo-violet color palette. Photorealistic showing pattern literacy movement emerging. 16:9 aspect ratio.""",

    "character-world-vision": """Fully awakened civilization where manipulation has become obsolete. Diverse people with visible open third eyes (subtle indigo glow at forehead) communicating transparently. All information clearly labeled with truth scores. Children teaching parents about pattern recognition. Advertising boards now show only honest product information. Politicians speak with visible truth auras. Media presents multiple perspectives equally. Everyone's indigo third eye energy visible and interconnected in a vast awareness network. Brilliant indigo and golden sunlight. Clear-seeing utopian aesthetic. 16:9 aspect ratio."""
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
    print("DALL-E 3 IMAGE GENERATOR - CHARACTER FORGE")
    print("Third Eye Chakra | Indigo | 852 Hz | The Seer")
    print("=" * 60)
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Images to generate: {len(CHARACTER_PROMPTS)}")
    print("=" * 60)

    results = []
    for filename, prompt in CHARACTER_PROMPTS.items():
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
