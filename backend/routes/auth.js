const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../database");
const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE constraint failed")) {
            return res.status(400).json({
              success: false,
              message: "Username already exists",
            });
          }
          return res.status(500).json({
            success: false,
            message: "Error creating user",
          });
        }

        res.json({
          success: true,
          message: "User registered successfully!",
          user: { id: this.lastID, username },
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  try {
    // Find user
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, user) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Server error",
          });
        }

        if (!user) {
          return res.status(400).json({
            success: false,
            message: "Invalid username or password",
          });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(400).json({
            success: false,
            message: "Invalid username or password",
          });
        }

        res.json({
          success: true,
          message: "Login successful!",
          user: { id: user.id, username: user.username },
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
