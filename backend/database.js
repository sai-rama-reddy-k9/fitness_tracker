const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "fitness.db");
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Create users table
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) console.error("Error creating users table:", err);
      else console.log("✅ Users table ready");
    }
  );

  // Create workouts table with user_id
  db.run(
    `CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        exercise TEXT NOT NULL,
        duration INTEGER NOT NULL,
        calories INTEGER NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`,
    (err) => {
      if (err) console.error("Error creating workouts table:", err);
      else console.log("✅ Workouts table ready");
    }
  );
});

module.exports = db;
