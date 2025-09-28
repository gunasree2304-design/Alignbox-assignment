const express = require("express");
const http = require("http");
const mysql = require("mysql2");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } 
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); 


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root", 
  database: "chat_app",
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ MySQL Connected");
});


app.get("/messages", (req, res) => {
  console.log("📥 Request for old messages"); 
  db.query("SELECT * FROM messages ORDER BY timestamp ASC", (err, results) => {
    if (err) {
      console.error("❌ DB fetch error:", err);
      return res.status(500).json({ error: "DB error" });
    }
    console.log(`📥 Fetched ${results.length} old messages`); 
    res.json(results);
  });
});


io.on("connection", (socket) => {
  console.log(`⚡ User connected: Socket ID ${socket.id}`); 
  console.log(`👥 Total connected clients: ${io.engine.clientsCount}`); 

  socket.on("sendMessage", (data) => {
    const { sender, message } = data;
    console.log(`📤 Received sendMessage from ${sender}: ${message} (Socket: ${socket.id})`); 
    if (!message || !sender) {
      console.log("❌ Invalid message data");
      return;
    }

  
    db.query(
      "INSERT INTO messages (sender, message) VALUES (?, ?)",
      [sender, message],
      (err, result) => {
        if (err) {
          console.error("❌ DB insert error:", err);
          socket.emit("error", { message: "Failed to save message" }); 
          return;
        }
        const payload = { id: result.insertId, sender, message, timestamp: new Date() };
        console.log(`🔄 Broadcasting to ${io.engine.clientsCount - 1} other clients: ${sender}: ${message}`); 
        socket.broadcast.emit("receiveMessage", payload);
      }
    );
  });

  socket.on("disconnect", (reason) => {
    console.log(`❌ User disconnected: Socket ID ${socket.id} (Reason: ${reason})`);
    console.log(`👥 Total connected clients now: ${io.engine.clientsCount}`);
  });
});

const PORT = 3000;

server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
