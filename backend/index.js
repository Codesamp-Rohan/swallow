const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const CryptoJS = require("crypto-js");

const app = express();
const PORT = 5173;

// File paths
const usersFilePath = "users.json";
const ROOMS_FILE = path.join(__dirname, "room.json");

// Utility to read room data
function loadRooms() {
  if (!fs.existsSync(ROOMS_FILE)) return {};
  const data = fs.readFileSync(ROOMS_FILE, "utf-8");
  return JSON.parse(data || "{}");
}

// Utility to save room data
function saveRooms(rooms) {
  fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2));
}

// Ensure files exist
if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, JSON.stringify([]));
}

app.use(cors());
app.use(express.json());

// Helper functions to read and write to JSON files
const readDataFromFile = (filePath) => {
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
};

const writeDataToFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ error: "Username and password are required." });

  const users = readDataFromFile(usersFilePath);

  const existingUser = users.find((u) => u.username === username);
  if (existingUser)
    return res.status(409).json({ error: "Username already taken." });

  const hashedPassword = CryptoJS.SHA256(password).toString();

  const newUser = {
    username,
    password: hashedPassword,
    createdAt: Date.now(),
  };

  users.push(newUser);
  writeDataToFile(usersFilePath, users);

  res.status(201).json({ message: "User created successfully." });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ error: "Username and password are required." });

  const hashedInputPassword = CryptoJS.SHA256(password).toString();

  const users = readDataFromFile(usersFilePath);

  const matchedUser = users.find(
    (u) => u.username === username && u.password === hashedInputPassword
  );

  if (!matchedUser)
    return res.status(401).json({ error: "Invalid username or password." });

  res.status(200).json({ message: "Login successful." });
});

app.post("/message/:roomId", (req, res) => {
  const { roomId } = req.params;
  const { text, username, repliedTo } = req.body;

  if (!text || !username) {
    return res.status(400).json({ error: "Missing text or username" });
  }

  const rooms = loadRooms();

  if (!rooms[roomId]) {
    return res.status(404).json({ error: "Room not found" });
  }

  // Create the message
  const message = {
    username,
    text,
    timestamp: Date.now(),
  };

  // ✅ Add reply info only if it's valid
  if (
    repliedTo &&
    typeof repliedTo === "object" &&
    repliedTo.username &&
    repliedTo.text &&
    repliedTo.timestamp
  ) {
    message.repliedTo = repliedTo;
  }

  // Save message in correct room
  rooms[roomId].messages.push(message);
  saveRooms(rooms);

  res.status(200).json({ message: "Message added", messageObject: message });
});

app.get("/messages/:roomId", (req, res) => {
  const { roomId } = req.params;
  const rooms = loadRooms();

  if (!rooms[roomId]) {
    return res.status(404).json({ error: "Room not found" });
  }

  res.json(rooms[roomId].messages || []);
});

app.put("/message/:roomId/:timestamp", (req, res) => {
  const { roomId, timestamp } = req.params;
  const { text } = req.body;
  const rooms = loadRooms();

  if (!rooms[roomId]) return res.status(404).send("Room not found.");

  const messages = rooms[roomId].messages;
  const index = messages.findIndex(
    (msg) => msg.timestamp.toString() === timestamp
  );

  if (index === -1) return res.status(404).send("Message not found.");

  messages[index].text = text.trim();
  messages[index].editedAt = Date.now();

  saveRooms(rooms);

  res.status(200).json({ message: "Updated successfully." });
});

app.delete("/message/:roomId/:timestamp", (req, res) => {
  const { roomId, timestamp } = req.params;
  const rooms = loadRooms();

  if (!rooms[roomId]) return res.status(404).send("Room not found.");

  const messages = rooms[roomId].messages;
  const index = messages.findIndex(
    (msg) => msg.timestamp.toString() === timestamp
  );

  if (index === -1) return res.status(404).send("Message not found.");

  messages.splice(index, 1);
  saveRooms(rooms);

  res.status(200).json({ message: "Deleted successfully." });
});

// Rooom
app.post("/rooms/create", (req, res) => {
  const { name, createdBy } = req.body;
  if (!name || !createdBy) {
    return res.status(400).json({ error: "Missing name or createdBy" });
  }

  const rooms = loadRooms();

  const roomId = "room_" + Math.random().toString(36).substring(2, 8);
  const inviteCode = "join-" + Math.random().toString(36).substring(2, 6);

  rooms[roomId] = {
    name,
    inviteCode,
    createdAt: Date.now(),
    members: {
      [createdBy]: { role: "admin", joinedAt: Date.now() },
    },
    messages: [],
  };

  saveRooms(rooms);

  res.json({ roomId, inviteCode, name });
});

app.post("/rooms/join", (req, res) => {
  const { inviteCode, username } = req.body;
  const rooms = loadRooms(); // ✅ Must load rooms here

  const roomEntry = Object.entries(rooms).find(
    ([, room]) => room.inviteCode === inviteCode
  );

  if (!roomEntry) {
    return res.status(404).json({ error: "Room not found" });
  }

  const [roomId, room] = roomEntry;

  if (!room.members[username]) {
    room.members[username] = {
      role: "member",
      joinedAt: Date.now(),
    };
    saveRooms(rooms); // ✅ MUST save updated rooms
  }

  res.json({ roomId, name: room.name });
});

app.get("/rooms", (req, res) => {
  const { user } = req.query;
  const rooms = loadRooms();

  if (!user) {
    return res.json({ rooms }); // return all if no user provided
  }

  const filtered = Object.fromEntries(
    Object.entries(rooms).filter(
      ([, room]) => room.members && room.members[user]
    )
  );

  return res.json({ rooms: filtered });
});

// Users detail
app.get("/users", (req, res) => {
  res.sendFile(path.join(__dirname, "users.json"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
