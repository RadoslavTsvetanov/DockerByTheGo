const express = require("express");
const { Client } = require("pg");
require("dotenv").config(); // Load environment variables

const app = express();
const port = 3000;

// PostgreSQL client configuration
const client = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

// Connect to PostgreSQL database
client
  .connect()
  .then(() => "Connected to PostgreSQL")
  .catch((err) => console.error("Connection error", err.stack));

// Endpoint to check connection
app.get("/check-connection", async (req, res) => {
  try {
    const result = await client.query("SELECT NOW()"); // Check connection
    res.status(200).json({ success: true, time: result.rows[0].now });
  } catch (error) {
    console.error("Query error", error.stack);
    res
      .status(500)
      .json({ success: false, message: "Database connection failed" });
  }
});

// Start the server
app.listen(port, () => {
  `Server running at http://localhost:${port}`;
});
