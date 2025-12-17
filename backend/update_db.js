const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "fitness.db");
const db = new sqlite3.Database(dbPath);

console.log("Updating database schema...");

db.serialize(() => {
  // Drop old workouts table if it exists
  db.run("DROP TABLE IF EXISTS workouts", (err) => {
    if (err) console.error("Error dropping table:", err);
    else console.log("✅ Old workouts table dropped");
  });

  // Create new workouts table with user_id
  db.run(
    `CREATE TABLE workouts (
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
      else console.log("✅ New workouts table created with user_id column");
    }
  );

  // Ensure users table exists
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) console.error("Error creating users table:", err);
      else console.log("✅ Users table verified");
    }
  );
});

db.close((err) => {
  if (err) console.error("Error closing database:", err);
  else console.log("✅ Database update complete!");
});
