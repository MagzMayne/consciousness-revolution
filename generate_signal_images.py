"""
DALL-E 3 Image Generator for SIGNAL FORGE
Throat Chakra - Blue - 741 Hz - The Communicator
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
OUTPUT_DIR = Path(r"C:\Users\dwrek\100X_DEPLOYMENT\images\signal")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# SIGNAL Forge Image Prompts (Throat Chakra - Blue - 741 Hz)
SIGNAL_PROMPTS = {
    "signal-journey-unconscious": """A person with their throat wrapped in invisible chains, mouth open but no sound emerging. Blue energy completely blocked at the throat, stagnant and suffocating. Surrounded by crossed-out papers, deleted messages, unsent letters. Expression of frustration from being unable to express truth. Others talking over them, their words drowned out. A microphone with a muted symbol. Dark moody atmosphere with hints of muted blue-gray. Digital art style with symbolic realism showing communication block made visible, 16:9 aspect ratio.""",

    "signal-journey-awakening": """A person in the moment of voice discovery - their throat glowing with emerging blue light. First authentic words materializing as visible blue sound waves. Expression of relief and empowerment. Breaking free from silence. A microphone activating, an audience beginning to turn and listen. Behind them, the muted gray chains dissolving. Speaking their truth for the first time. Warm blue and cyan energy swirling upward. Digital art, 16:9 aspect ratio.""",

    "signal-journey-conscious": """A master communicator standing confident, their throat radiating brilliant blue light that transforms into visible frequencies. Voice projecting as pure signal - clear, authentic, impactful. Others receiving their message, understanding perfectly. Expression of calm power and truth. Multiple communication channels flowing from them - speaking, writing, broadcasting. Brilliant blue and white light illuminating the scene. Perfect alignment between thought, word, and impact. Digital art style, 16:9 aspect ratio.""",

    "signal-world-problem": """Split scene showing global communication crisis. Left side: Social media feeds of outrage and division, algorithms promoting conflict, voices drowned in noise. Echo chambers visualized as isolated bubbles. Right side: Journalists silenced, whistleblowers in shadows, important truths buried under entertainment. Blue energy scattered and fragmented across humanity - no clear signal, only noise. Corporate media megaphones drowning out authentic voices. Somber gray-blue color palette. Photorealistic with emotional impact, 16:9 aspect ratio.""",

    "signal-world-shift": """Hopeful transformation scene. Podcasters and independent creators building authentic audiences. Community radio stations and local journalism reviving. People learning to listen as well as speak. Truth-seeking conversations happening in living rooms. Decentralized platforms allowing genuine connection. Whistleblowers protected, important stories being told. Gray noise clearing to reveal blue signal emerging. Photorealistic showing authentic communication revolution, 16:9 aspect ratio.""",

    "signal-world-vision": """Fully connected civilization where authentic communication flows freely. Diverse people with visible blue throat energy, all speaking their truth and truly hearing others. No more noise - only signal. Media serving truth rather than engagement. Conversations bridging divides. Children learning both speaking and deep listening. Technology amplifying rather than distorting human voice. Brilliant blue and white light connecting everyone. Communication utopia aesthetic. 16:9 aspect ratio."""
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
    print("DALL-E 3 IMAGE GENERATOR - SIGNAL FORGE")
    print("Throat Chakra | Blue | 741 Hz | The Communicator")
    print("=" * 60)
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Images to generate: {len(SIGNAL_PROMPTS)}")
    print("=" * 60)

    results = []
    for filename, prompt in SIGNAL_PROMPTS.items():
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
