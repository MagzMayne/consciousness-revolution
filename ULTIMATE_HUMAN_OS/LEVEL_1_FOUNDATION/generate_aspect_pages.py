"""
Generate 49 HTML pages for the 7x7 Ultimate Human OS structure
Run: python generate_aspect_pages.py
"""

import os

# Define the complete 7x7 structure with human-friendly data
DOMAINS = {
    "1_CLARITY": {
        "name": "CLARITY",
        "icon": "&#128161;",
        "color": "#e74c3c",
        "tagline": "See the whole picture. Control your day.",
        "aspects": {
            "1_MORNING": {
                "name": "Morning Clarity",
                "question": "How do I start my day right?",
                "tool": "Daily Reset Protocol",
                "desc": "A structured morning routine that sets your intention and clears mental fog."
            },
            "2_DECISION": {
                "name": "Decision Making",
                "question": "I can't decide.",
                "tool": "Decision Matrix Tool",
                "desc": "A framework to cut through analysis paralysis and make confident choices."
            },
            "3_PRIORITY": {
                "name": "Priority Setting",
                "question": "Everything feels urgent.",
                "tool": "Priority Shuffler",
                "desc": "Sort what matters from what screams loudest."
            },
            "4_TIME": {
                "name": "Time Mastery",
                "question": "I never have enough time.",
                "tool": "Time Block System",
                "desc": "Protect your hours. Own your calendar."
            },
            "5_ENERGY": {
                "name": "Energy Management",
                "question": "I'm always tired.",
                "tool": "Energy Audit",
                "desc": "Find the drains. Plug the leaks. Recharge."
            },
            "6_PROGRESS": {
                "name": "Progress Tracking",
                "question": "Am I making progress?",
                "tool": "Progress Dashboard",
                "desc": "See how far you've come. Know where you're going."
            },
            "7_DASHBOARD": {
                "name": "Life Dashboard",
                "question": "I need to see everything.",
                "tool": "Command Center",
                "desc": "Your central hub for all 7 domains of life."
            }
        }
    },
    "2_CREATION": {
        "name": "CREATION",
        "icon": "&#128736;",
        "color": "#3498db",
        "tagline": "Turn ideas into reality.",
        "aspects": {
            "1_IDEAS": {
                "name": "Idea Capture",
                "question": "I have so many ideas.",
                "tool": "Idea Vault",
                "desc": "Never lose a spark of inspiration again."
            },
            "2_PROJECT": {
                "name": "Project Starting",
                "question": "I never start.",
                "tool": "First Steps Template",
                "desc": "The hardest part is starting. We make it easy."
            },
            "3_SKILLS": {
                "name": "Building Skills",
                "question": "I don't know how.",
                "tool": "Skill Builder Paths",
                "desc": "Learn what you need, when you need it."
            },
            "4_AI": {
                "name": "AI Partnership",
                "question": "How do I use AI?",
                "tool": "AI Assistant Setup",
                "desc": "Make AI your co-pilot, not your replacement."
            },
            "5_SYSTEMS": {
                "name": "Systems Design",
                "question": "It's always messy.",
                "tool": "Systems Blueprint",
                "desc": "Build once. Run forever."
            },
            "6_FINISHING": {
                "name": "Finishing Projects",
                "question": "I never finish.",
                "tool": "Completion Protocol",
                "desc": "Cross the finish line. Ship the thing."
            },
            "7_PORTFOLIO": {
                "name": "Portfolio Building",
                "question": "No one sees my work.",
                "tool": "Portfolio Generator",
                "desc": "Show the world what you've built."
            }
        }
    },
    "3_RELATIONSHIPS": {
        "name": "RELATIONSHIPS",
        "icon": "&#129309;",
        "color": "#2ecc71",
        "tagline": "Build your network. Never alone.",
        "aspects": {
            "1_INNER_CIRCLE": {
                "name": "Inner Circle",
                "question": "Who really matters?",
                "tool": "Circle Audit",
                "desc": "Identify your true allies. Invest in them."
            },
            "2_NEW_PEOPLE": {
                "name": "New Connections",
                "question": "How do I meet people?",
                "tool": "Outreach Templates",
                "desc": "Scripts and systems for authentic connection."
            },
            "3_COMMUNICATION": {
                "name": "Communication",
                "question": "I'm bad at talking.",
                "tool": "Communication Scripts",
                "desc": "Say what you mean. Be understood."
            },
            "4_CONFLICT": {
                "name": "Conflict Resolution",
                "question": "We keep fighting.",
                "tool": "Peace Protocol",
                "desc": "Navigate disagreements without destruction."
            },
            "5_BOUNDARIES": {
                "name": "Boundaries",
                "question": "People drain me.",
                "tool": "Boundary System",
                "desc": "Protect your energy. Say no with grace."
            },
            "6_COMMUNITY": {
                "name": "Community",
                "question": "I need my people.",
                "tool": "Community Finder",
                "desc": "Find your tribe. Build together."
            },
            "7_NETWORK": {
                "name": "Networking",
                "question": "How do I network?",
                "tool": "Network Map",
                "desc": "Strategic relationship building."
            }
        }
    },
    "4_PEACE": {
        "name": "PEACE OF MIND",
        "icon": "&#128737;",
        "color": "#9b59b6",
        "tagline": "Shield yourself. Sleep soundly.",
        "aspects": {
            "1_SHIELD": {
                "name": "Manipulation Shield",
                "question": "People manipulate me.",
                "tool": "Pattern Detectors",
                "desc": "Recognize manipulation. Become immune."
            },
            "2_DIGITAL": {
                "name": "Digital Security",
                "question": "Am I safe online?",
                "tool": "Security Checklist",
                "desc": "Lock down your digital life."
            },
            "3_LEGAL": {
                "name": "Legal Protection",
                "question": "What if they sue me?",
                "tool": "Legal Arsenal",
                "desc": "Know your rights. Protect yourself."
            },
            "4_FINANCIAL": {
                "name": "Financial Safety",
                "question": "What if I lose everything?",
                "tool": "Safety Net Plan",
                "desc": "Build your backup. Sleep peacefully."
            },
            "5_PHYSICAL": {
                "name": "Physical Safety",
                "question": "Am I safe?",
                "tool": "Safety Protocols",
                "desc": "Practical protection for real life."
            },
            "6_EMOTION": {
                "name": "Emotional Armor",
                "question": "They hurt me.",
                "tool": "Emotion Shield",
                "desc": "Process without drowning. Feel without breaking."
            },
            "7_PRACTICES": {
                "name": "Peace Practices",
                "question": "I can't relax.",
                "tool": "Peace Meditation",
                "desc": "Cultivate calm. Find your center."
            }
        }
    },
    "5_ABUNDANCE": {
        "name": "ABUNDANCE",
        "icon": "&#128176;",
        "color": "#f39c12",
        "tagline": "Multiply your resources.",
        "aspects": {
            "1_MONEY": {
                "name": "Money Clarity",
                "question": "Where does it all go?",
                "tool": "Money Map",
                "desc": "See your money flow. Plug the leaks."
            },
            "2_INCOME": {
                "name": "Income Streams",
                "question": "I need more income.",
                "tool": "Revenue Blueprint",
                "desc": "Multiple streams. Multiple paths."
            },
            "3_BUSINESS": {
                "name": "Business Building",
                "question": "I want my own thing.",
                "tool": "Business Starter",
                "desc": "From idea to income in 30 days."
            },
            "4_INVESTING": {
                "name": "Investing",
                "question": "How do I invest?",
                "tool": "Investment Basics",
                "desc": "Make your money work for you."
            },
            "5_SCALING": {
                "name": "Scaling",
                "question": "How do I grow?",
                "tool": "Scaling Playbook",
                "desc": "10x without 10x effort."
            },
            "6_PASSIVE": {
                "name": "Passive Income",
                "question": "Money while I sleep.",
                "tool": "Passive Streams",
                "desc": "Build once. Earn forever."
            },
            "7_MINDSET": {
                "name": "Wealth Mindset",
                "question": "I'm bad with money.",
                "tool": "Mindset Shift",
                "desc": "Change how you think. Change what you earn."
            }
        }
    },
    "6_WISDOM": {
        "name": "WISDOM",
        "icon": "&#128218;",
        "color": "#1abc9c",
        "tagline": "Know what others don't.",
        "aspects": {
            "1_PATTERNS": {
                "name": "Pattern Recognition",
                "question": "What am I missing?",
                "tool": "Pattern Library",
                "desc": "See what others can't. Predict what's coming."
            },
            "2_RESEARCH": {
                "name": "Research Skills",
                "question": "How do I find out?",
                "tool": "Research Protocol",
                "desc": "Find the truth in a sea of noise."
            },
            "3_CRITICAL": {
                "name": "Critical Thinking",
                "question": "Is this true?",
                "tool": "Truth Detector",
                "desc": "Cut through lies. Find facts."
            },
            "4_LEARNING": {
                "name": "Learning System",
                "question": "I forget everything.",
                "tool": "Knowledge Vault",
                "desc": "Learn once. Remember forever."
            },
            "5_MODELS": {
                "name": "Mental Models",
                "question": "How do smart people think?",
                "tool": "Mental Models",
                "desc": "Think like the masters. Decide like a genius."
            },
            "6_DECISIONS": {
                "name": "Decision Wisdom",
                "question": "I keep making mistakes.",
                "tool": "Decision Log",
                "desc": "Learn from every choice. Never repeat errors."
            },
            "7_TEACHING": {
                "name": "Teaching Others",
                "question": "How do I explain this?",
                "tool": "Teaching Templates",
                "desc": "Share what you know. Multiply your impact."
            }
        }
    },
    "7_PURPOSE": {
        "name": "PURPOSE",
        "icon": "&#10024;",
        "color": "#e91e63",
        "tagline": "Connect to something bigger.",
        "aspects": {
            "1_MORNING": {
                "name": "Morning Practice",
                "question": "How do I start?",
                "tool": "Sunrise Protocol",
                "desc": "Begin each day connected to your why."
            },
            "2_MEDITATION": {
                "name": "Meditation",
                "question": "My mind won't stop.",
                "tool": "Meditation Guide",
                "desc": "Find stillness. Hear yourself think."
            },
            "3_MEANING": {
                "name": "Meaning Finding",
                "question": "What's it all for?",
                "tool": "Purpose Finder",
                "desc": "Discover what makes your life matter."
            },
            "4_LEGACY": {
                "name": "Legacy Building",
                "question": "What do I leave behind?",
                "tool": "Legacy Map",
                "desc": "Build something that outlasts you."
            },
            "5_INTUITION": {
                "name": "Intuition",
                "question": "How do I trust myself?",
                "tool": "Intuition Training",
                "desc": "Develop your inner compass."
            },
            "6_SERVICE": {
                "name": "Service",
                "question": "How do I help others?",
                "tool": "Service Paths",
                "desc": "Give what you have. Get what you need."
            },
            "7_INTEGRATION": {
                "name": "Integration",
                "question": "How does it all fit?",
                "tool": "Life Integration",
                "desc": "Bring all 7 domains together. Become whole."
            }
        }
    }
}

def generate_aspect_html(domain_key, aspect_key, domain_data, aspect_data, aspect_num):
    """Generate the HTML for a single aspect page"""

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{aspect_data["name"]} - {domain_data["name"]} - Ultimate Human OS</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}

        body {{
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            min-height: 100vh;
            color: #fff;
        }}

        .container {{
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
        }}

        .breadcrumb {{
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 30px;
        }}

        .breadcrumb a {{
            color: #888;
            text-decoration: none;
        }}

        .breadcrumb a:hover {{
            color: #fff;
        }}

        .header {{
            text-align: center;
            margin-bottom: 50px;
        }}

        .domain-badge {{
            display: inline-block;
            background: {domain_data["color"]};
            color: #fff;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-bottom: 15px;
        }}

        .aspect-number {{
            font-size: 4rem;
            font-weight: 900;
            color: {domain_data["color"]};
            opacity: 0.3;
            margin-bottom: -20px;
        }}

        .title {{
            font-size: 2.5rem;
            font-weight: 900;
            margin-bottom: 10px;
        }}

        .question {{
            font-size: 1.3rem;
            color: #888;
            font-style: italic;
            margin-bottom: 20px;
        }}

        .tool-card {{
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid {domain_data["color"]};
            border-radius: 20px;
            padding: 40px;
            margin: 40px 0;
            text-align: center;
        }}

        .tool-label {{
            font-size: 0.8rem;
            color: {domain_data["color"]};
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 10px;
        }}

        .tool-name {{
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 15px;
        }}

        .tool-desc {{
            color: #aaa;
            font-size: 1.1rem;
            line-height: 1.6;
        }}

        .cta-btn {{
            display: inline-block;
            margin-top: 30px;
            padding: 15px 40px;
            background: {domain_data["color"]};
            color: #fff;
            text-decoration: none;
            border-radius: 30px;
            font-weight: bold;
            font-size: 1.1rem;
            transition: all 0.3s;
        }}

        .cta-btn:hover {{
            transform: scale(1.05);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }}

        .navigation {{
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }}

        .nav-link {{
            color: #888;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 10px;
            transition: all 0.2s;
        }}

        .nav-link:hover {{
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
        }}

        .nav-link.disabled {{
            opacity: 0.3;
            pointer-events: none;
        }}

        .coming-soon {{
            background: rgba(255, 255, 255, 0.03);
            border-radius: 15px;
            padding: 30px;
            margin-top: 40px;
            text-align: center;
        }}

        .coming-soon h3 {{
            color: {domain_data["color"]};
            margin-bottom: 10px;
        }}

        .coming-soon p {{
            color: #666;
        }}

        .pattern-badge {{
            display: inline-block;
            background: rgba(46, 204, 113, 0.2);
            border: 1px solid #2ecc71;
            color: #2ecc71;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.8rem;
            margin-top: 20px;
        }}

        .footer {{
            text-align: center;
            margin-top: 60px;
            color: #444;
            font-size: 0.9rem;
        }}
    </style>
</head>
<body>
    <div class="container">
        <nav class="breadcrumb">
            <a href="../../index.html">Ultimate Human OS</a> &rarr;
            <a href="../index.html">Level 1: Foundation</a> &rarr;
            <a href="index.html">{domain_data["name"]}</a> &rarr;
            {aspect_data["name"]}
        </nav>

        <header class="header">
            <span class="domain-badge">{domain_data["icon"]} {domain_data["name"]}</span>
            <div class="aspect-number">{aspect_num}</div>
            <h1 class="title">{aspect_data["name"]}</h1>
            <p class="question">"{aspect_data["question"]}"</p>
        </header>

        <div class="tool-card">
            <p class="tool-label">Your Tool for This</p>
            <h2 class="tool-name">{aspect_data["tool"]}</h2>
            <p class="tool-desc">{aspect_data["desc"]}</p>
            <a href="#" class="cta-btn">Access Tool</a>
            <div class="pattern-badge">Pattern Theory: 92.2% Accuracy</div>
        </div>

        <div class="coming-soon">
            <h3>Full Tool Coming Soon</h3>
            <p>This tool is being built as part of the Consciousness Revolution. Join the community to get early access.</p>
        </div>

        <nav class="navigation">
            <a href="#" class="nav-link" id="prevLink">&larr; Previous</a>
            <a href="index.html" class="nav-link">Back to {domain_data["name"]}</a>
            <a href="#" class="nav-link" id="nextLink">Next &rarr;</a>
        </nav>

        <footer class="footer">
            <p>Consciousness Revolution &copy; 2026 | consciousnessrevolution.io</p>
        </footer>
    </div>
</body>
</html>
'''
    return html


def generate_domain_index_html(domain_key, domain_data):
    """Generate the index.html for a domain folder"""

    aspects_html = ""
    for i, (aspect_key, aspect_data) in enumerate(domain_data["aspects"].items(), 1):
        aspects_html += f'''
            <div class="aspect-card" onclick="window.location.href='{aspect_key}/index.html'">
                <div class="aspect-number">{i}</div>
                <div class="aspect-info">
                    <h3>{aspect_data["name"]}</h3>
                    <p class="question">"{aspect_data["question"]}"</p>
                    <p class="tool">{aspect_data["tool"]}</p>
                </div>
            </div>
'''

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{domain_data["name"]} - Level 1 Foundation - Ultimate Human OS</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}

        body {{
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            min-height: 100vh;
            color: #fff;
        }}

        .container {{
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
        }}

        .back-link {{
            display: inline-block;
            color: #888;
            text-decoration: none;
            margin-bottom: 20px;
            font-size: 0.9rem;
        }}

        .back-link:hover {{
            color: #fff;
        }}

        .header {{
            text-align: center;
            margin-bottom: 50px;
        }}

        .domain-icon {{
            font-size: 4rem;
            margin-bottom: 15px;
        }}

        .domain-badge {{
            display: inline-block;
            background: {domain_data["color"]};
            color: #fff;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: bold;
            margin-bottom: 15px;
        }}

        .title {{
            font-size: 2.5rem;
            font-weight: 900;
            margin-bottom: 10px;
            color: {domain_data["color"]};
        }}

        .tagline {{
            color: #888;
            font-size: 1.2rem;
        }}

        .aspects-list {{
            display: flex;
            flex-direction: column;
            gap: 15px;
        }}

        .aspect-card {{
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 25px;
            display: flex;
            align-items: center;
            gap: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
        }}

        .aspect-card:hover {{
            transform: translateX(10px);
            border-color: {domain_data["color"]};
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }}

        .aspect-number {{
            font-size: 2rem;
            font-weight: 900;
            color: {domain_data["color"]};
            opacity: 0.5;
            min-width: 50px;
        }}

        .aspect-info h3 {{
            font-size: 1.3rem;
            margin-bottom: 5px;
        }}

        .aspect-info .question {{
            color: #888;
            font-style: italic;
            font-size: 0.9rem;
            margin-bottom: 5px;
        }}

        .aspect-info .tool {{
            color: {domain_data["color"]};
            font-size: 0.85rem;
        }}

        .progress-section {{
            background: rgba(255,255,255,0.05);
            border-radius: 15px;
            padding: 25px;
            margin-top: 40px;
            text-align: center;
        }}

        .progress-bar {{
            height: 10px;
            background: rgba(255,255,255,0.1);
            border-radius: 5px;
            overflow: hidden;
            margin: 15px 0;
        }}

        .progress-fill {{
            height: 100%;
            background: {domain_data["color"]};
            width: 0%;
            transition: width 0.5s;
        }}

        .progress-text {{
            color: #888;
            font-size: 0.9rem;
        }}

        .footer {{
            text-align: center;
            margin-top: 50px;
            color: #555;
        }}
    </style>
</head>
<body>
    <div class="container">
        <a href="../index.html" class="back-link">&larr; Back to All Domains</a>

        <header class="header">
            <div class="domain-icon">{domain_data["icon"]}</div>
            <span class="domain-badge">DOMAIN {domain_key[0]}</span>
            <h1 class="title">{domain_data["name"]}</h1>
            <p class="tagline">{domain_data["tagline"]}</p>
        </header>

        <div class="aspects-list">
{aspects_html}
        </div>

        <div class="progress-section">
            <h3>Domain Progress</h3>
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <p class="progress-text"><span id="completed">0</span>/7 Aspects Completed</p>
        </div>

        <footer class="footer">
            <p>Consciousness Revolution &copy; 2026</p>
        </footer>
    </div>

    <script>
        // Track progress
        function updateProgress() {{
            const key = 'uhos_{domain_key.lower()}_visited';
            const visited = JSON.parse(localStorage.getItem(key) || '[]');
            const completed = visited.length;
            const pct = Math.round((completed / 7) * 100);
            document.getElementById('progressFill').style.width = pct + '%';
            document.getElementById('completed').textContent = completed;
        }}
        updateProgress();
    </script>
</body>
</html>
'''
    return html


def main():
    base_path = os.path.dirname(os.path.abspath(__file__))

    created_count = 0

    for domain_key, domain_data in DOMAINS.items():
        domain_path = os.path.join(base_path, domain_key)

        # Create domain folder if needed
        if not os.path.exists(domain_path):
            os.makedirs(domain_path)
            print(f"Created domain folder: {domain_key}")

        # Create domain index.html
        domain_index = generate_domain_index_html(domain_key, domain_data)
        domain_index_path = os.path.join(domain_path, "index.html")
        with open(domain_index_path, 'w', encoding='utf-8') as f:
            f.write(domain_index)
        print(f"Created: {domain_key}/index.html")
        created_count += 1

        # Create each aspect folder and its index.html
        for i, (aspect_key, aspect_data) in enumerate(domain_data["aspects"].items(), 1):
            aspect_path = os.path.join(domain_path, aspect_key)

            # Create aspect folder if needed
            if not os.path.exists(aspect_path):
                os.makedirs(aspect_path)

            # Create aspect index.html
            aspect_html = generate_aspect_html(domain_key, aspect_key, domain_data, aspect_data, i)
            aspect_index_path = os.path.join(aspect_path, "index.html")
            with open(aspect_index_path, 'w', encoding='utf-8') as f:
                f.write(aspect_html)
            print(f"Created: {domain_key}/{aspect_key}/index.html")
            created_count += 1

    print(f"\n=== COMPLETE ===")
    print(f"Total files created: {created_count}")
    print(f"7 domain index pages + 49 aspect pages = 56 HTML files")


if __name__ == "__main__":
    main()
