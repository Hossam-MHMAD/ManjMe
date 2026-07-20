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
    questions TEXT NOT NULL,
    level_id INTEGER,
    FOREIGN KEY (level_id) REFERENCES levels (id)
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

@app.route("/levels")
def levels():
  return render_template("levels.html")

@app.route("/api/levels", methods=["GET"])
def get_levels():
  db = get_db()
  curs = db.cursor()

  rows = curs.execute("SELECT id, name FROM levels").fetchall()

  data = [dict(row) for row in rows]
  return jsonify(data)

@app.route("/api/levels", methods=["POST"])
def add_level():
  req = request.get_json()

  if not req["name"]:
    return jsonify({"error": "Level Name Is Required"}), 400

  db = get_db()
  curs = db.cursor()

  curs.execute("INSERT INTO levels(name) VALUES(?)", (req["name"],))
  db.commit()

  return jsonify({"level_id": curs.lastrowid}), 201

@app.route("/levels/<int:level_id>")
def level(level_id):
  return render_template("level.html")

@app.route("/api/<int:level_id>/sessions", methods=["POST"])
def add_lesson(level_id):
  req = request.get_json()

  if not req["number"] or not req["content"]:
    return {"error": "session title, content are required"}, 400
  
  db = get_db()
  curs = db.cursor()

  curs.execute("INSERT INTO lessons(number, questions, level_id) VALUES(?,?,?)", (req["number"], req["content"], level_id))

  db.commit()

  return jsonify({"lesson_id": curs.lastrowid}), 201

@app.route("/api/<int:level_id>/sessions")
def get_lessons(level_id):
  db = get_db()

  curs = db.cursor()
  level_name = curs.execute("SELECT name FROM levels WHERE id = ?", (level_id,)).fetchone()
  rows = curs.execute("SELECT * FROM lessons WHERE level_id = ?", (level_id,)).fetchall()

  data = [dict(row) for row in rows]

  return jsonify({"level_name": level_name["name"], "lessons": data}), 200

@app.route("/api/<int:lesson_id>/session")
def get_lesson(lesson_id):
  db = get_db()
  curs = db.cursor()
  row = curs.execute("SELECT * FROM lessons WHERE id = ?", (lesson_id,)).fetchone()
  return jsonify(dict(row))

if __name__ == "__main__":
  init_db()
  app.run()