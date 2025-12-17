const express = require("express");
const cors = require("cors");
const db = require("./database");
const authRoutes = require("./routes/auth");
const app = express();
const PORT = 3000;

// CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Fitness Tracker API is working!",
    status: "success",
  });
});

// GET all workouts
app.get("/api/workouts", (req, res) => {
  db.all("SELECT * FROM workouts ORDER BY date DESC", (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching workouts",
      });
    }
    res.json({
      success: true,
      data: rows,
    });
  });
});

// POST new workout
app.post("/api/workouts", (req, res) => {
  const { exercise, duration, calories, user_id } = req.body;

  console.log("Received workout data:", req.body);

  // Validation
  if (!exercise || !duration || !calories || !user_id) {
    return res.status(400).json({
      success: false,
      message: "All fields are required including user_id",
    });
  }

  const date = new Date().toLocaleDateString();

  // First, check if user exists
  db.get("SELECT id FROM users WHERE id = ?", [user_id], (err, user) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error checking user",
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // User exists, save workout
    db.run(
      "INSERT INTO workouts (user_id, exercise, duration, calories, date) VALUES (?, ?, ?, ?, ?)",
      [user_id, exercise, duration, calories, date],
      function (err) {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            message: "Error saving workout: " + err.message,
          });
        }

        res.json({
          success: true,
          message: "Workout added successfully!",
          data: {
            id: this.lastID,
            user_id,
            exercise,
            duration,
            calories,
            date,
          },
        });
      }
    );
  });
});

// DELETE workout endpoint
app.delete("/api/workouts/:id", (req, res) => {
  const workoutId = req.params.id;

  db.run("DELETE FROM workouts WHERE id = ?", [workoutId], function (err) {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Error deleting workout",
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Workout not found",
      });
    }

    res.json({
      success: true,
      message: "Workout deleted successfully!",
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Database connected`);
});
// GET social feed - recent workouts from all users
// GET social feed - recent workouts from all users (LIMIT 10)
app.get('/api/feed', (req, res) => {
    db.all(`
        SELECT workouts.*, users.username 
        FROM workouts 
        JOIN users ON workouts.user_id = users.id 
        ORDER BY workouts.date DESC, workouts.id DESC 
        LIMIT 10
    `, (err, rows) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching feed' 
            });
        }
        res.json({ 
            success: true, 
            data: rows 
        });
    });
});

// GET user statistics
app.get('/api/stats/:user_id', (req, res) => {
    const userId = req.params.user_id;
    
    db.get(`
        SELECT 
            COUNT(*) as totalWorkouts,
            SUM(duration) as totalMinutes,
            SUM(calories) as totalCalories,
            MAX(date) as lastWorkout
        FROM workouts 
        WHERE user_id = ?
    `, [userId], (err, stats) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching stats' 
            });
        }
        
        res.json({ 
            success: true, 
            data: stats 
        });
    });
});
