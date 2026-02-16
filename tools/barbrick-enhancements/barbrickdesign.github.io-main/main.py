from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
conn = sqlite3.connect("route95.db", check_same_thread=False)
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    username TEXT,
    password TEXT,
    reputation INTEGER DEFAULT 0
)
""")
cursor.execute("""
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    repo_url TEXT,
    snapshot TEXT,
    task TEXT,
    bounty INTEGER,
    deadline TEXT,
    submitter TEXT
)
""")
conn.commit()

# Models
class User(BaseModel):
    email: str
    username: str
    password: str

class Project(BaseModel):
    name: str
    repo_url: str
    snapshot: str
    task: str
    bounty: int
    deadline: str
    submitter: str

# Routes
@app.post("/signup")
def signup(user: User):
    try:
        cursor.execute("INSERT INTO users (email, username, password) VALUES (?, ?, ?)",
                       (user.email, user.username, user.password))
        conn.commit()
        return {"message": "User signed up and added to waiting list"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already exists")

@app.post("/login")
def login(email: str = Form(...), password: str = Form(...)):
    cursor.execute("SELECT * FROM users WHERE email=? AND password=?", (email, password))
    user = cursor.fetchone()
    if user:
        return {"message": "Login successful", "username": user[2]}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/submit_project")
def submit_project(project: Project):
    cursor.execute("""
    INSERT INTO projects (name, repo_url, snapshot, task, bounty, deadline, submitter)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (project.name, project.repo_url, project.snapshot, project.task,
          project.bounty, project.deadline, project.submitter))
    conn.commit()
    return {"message": "Project submitted"}

@app.get("/projects")
def get_projects():
    cursor.execute("SELECT * FROM projects")
    rows = cursor.fetchall()
    return [{"id": r[0], "name": r[1], "task": r[4], "bounty": r[5], "deadline": r[6]} for r in rows]

@app.get("/activity")
def get_activity():
    return [
        {"event": "🛠️ Jane claimed 'Crypto Wallet UI' — $100 bounty"},
        {"event": "✅ DevBot completed 'AI Chatbot Polish' — $75 earned"},
        {"event": "🧪 Alex submitted review for 'NFT Gallery Fix'"}
    ]
