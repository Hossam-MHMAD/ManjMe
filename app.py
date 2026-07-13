from flask import Flask, render_template, g, request, jsonify
import sqlite3

app = Flask(__name__)


# ---------------- Database Declaration
DB = "data.db"

def get_db():
  if "db" not in g:
    g.db = sqlite3.connect(DB)

    g.db.row_factory = sqlite3.Row

    g.db.execute("PRAGMA foreign_keys = ON")

    return g.db 


@app.teardown_appcontext            # Flask calls this automatically when a request finishes.
def close_db(exception):
  db = g.pop("db", None)          # take the connection out of `g` (or None if there wasn't one).
  if db is not None:
    db.close()   


def init_db():
  db = sqlite3.connect(DB)

  db.executescript("""
  
  CREATE TABLE IF NOT EXISTS sessions_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number INTEGER NOT NULL,
    level_id INTEGER,
    FOREIGN KEY (level_id) REFERENCES levels (id)
  );
  
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL,
    question_order INTEGER,
    lesson_id INTEGER,
    FOREIGN KEY (lesson_id) REFERENCES lessons (id)
  );
  
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    level_id INTEGER,
    next_lesson INTEGER NOT NULL,
    FOREIGN KEY (level_id) REFERENCES levels (id)
  );
  
  CREATE TABLE IF NOT EXISTS one_to_one_sessions_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    date TEXT,
    session_time REAL,
    given_lesson_id INTEGER,
    FOREIGN KEY (student_id) REFERENCES students (id)
    FOREIGN KEY (given_lesson_id) REFERENCES lessons (id)
  );
  
  """)
  
  db.commit()
  db.close()

@app.route("/")
def home():
  return render_template("index.html")

@app.route("/sessions-editor")
def sessions():
  return render_template("sessions.html")

@app.route("/api/sessions-types", methods=["GET"])
def get_sessions():
  db = get_db()

  curs = db.cursor()
  sessions_types = curs.execute("SELECT name, type FROM sessions_types").fetchall()

  data = [dict(row) for row in sessions_types]

  print("----------------------------------------- Get Sessions Done")

  return jsonify(data)

@app.route("/api/sessions-types", methods=["POST"])
def add_session():
  req = request.get_json()

  if not req["name"] or not req["type"]:
    return jsonify({"error": "Name and Type are Required"}), 400
  
  db = get_db()

  cur = db.cursor()

  cur.execute("INSERT INTO sessions_types(name, type) VALUES(?, ?)", (req["name"],req["type"]))
  db.commit()

  return jsonify({"session_type_id": cur.lastrowid}), 201

if __name__ == "__main__":
  init_db()
  app.run()