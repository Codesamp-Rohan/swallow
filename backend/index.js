const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const CryptoJS = require("crypto-js");
const multer = require("multer");

const app = express();
const PORT = 5174;

// File paths
const usersFilePath = "users.json";
const ROOMS_FILE = path.join(__dirname, "room.json");

// Utility to read room data
function loadRooms() {
  if (!fs.existsSync(ROOMS_FILE)) return {};
  const data = fs.readFileSync(ROOMS_FILE, "utf-8");
  return JSON.parse(data || "{}");
}


function readUsers() {
  try {
    const filePath = path.join(__dirname, "users.json");
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Failed to read users.json:", err);
    return [];
  }
}


// Utility to save room data
function saveRooms(rooms) {
  fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2));
}

function readRooms() {
  return JSON.parse(fs.readFileSync(ROOMS_FILE, 'utf-8'));
}

function writeRooms(data) {
  fs.writeFileSync(ROOMS_FILE, JSON.stringify(data, null, 2));
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

app.post('/rooms/leave', (req, res) => {
  try {
    const { roomId, username } = req.body;
    if (!roomId || !username) {
      return res.status(400).json({ error: 'roomId and username are required.' });
    }

    const rooms = readRooms();

    if (!rooms[roomId]) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    const room = rooms[roomId];

    if (!room.members || !room.members[username]) {
      return res.status(400).json({ error: 'User is not a member of this room.' });
    }

    const isAdminLeaving = room.createdBy === username;

    delete room.members[username];

    // 🔁 Assign a new admin if the current admin is leaving
    if (isAdminLeaving) {
      const remainingMembers = Object.keys(room.members);

      if (remainingMembers.length > 0) {
        const [newAdminUsername] = remainingMembers.sort(
          ([, a], [, b]) => a.joinedAt - b.joinedAt
        )[0];
        room.members[newAdminUsername].role = "admin";
        console.log(`Admin ${username} left. New admin is ${room.createdBy}`);
      } else {
        // No members left — delete the room
        delete rooms[roomId];
        writeRooms(rooms);
        return res.json({ success: true, name: room.name, message: "Room deleted as no members were left." });
      }
    }

    writeRooms(rooms);

    return res.json({ success: true, name: room.name, message: isAdminLeaving ? `New admin is ${room.createdBy}` : undefined });

  } catch (err) {
    console.error("Error in /rooms/leave:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
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

const upload = multer({ dest: "uploads/" });

app.use("/uploads", (req, res, next) => {
  const filePath = path.join(__dirname, "uploads", req.url);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/getUser", (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: "Username is required" });

  try {
    const users = readUsers(); // Reads from users.json
    const user = users.find(u => u.username === username);

    if (!user) return res.status(404).json({ error: "User not found" });

    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error("GET /api/getUser error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/updateUser", upload.single("profileImage"), (req, res) => {
  const { username, name, bio, specializations, socialLinks } = req.body;
  const profileImage = req.file; // profile image info (if uploaded)

  // Parse the specializations and socialLinks to proper format
  const parsedSpecializations = JSON.parse(specializations); // Convert to array
  const parsedSocialLinks = JSON.parse(socialLinks); // Convert to object

  // Read the existing users data from the users.json file
  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading users file:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    let users = [];
    if (data) {
      try {
        users = JSON.parse(data); // Parse the existing data from JSON
      } catch (e) {
        console.error("Error parsing users data:", e);
      }
    }

    // Find existing user or create new user
    let user = users.find((u) => u.username === username);

    if (!user) {
      // If user doesn't exist, create a new user object
      user = {
        username,
        name,
        bio,
        specializations: parsedSpecializations,
        socialLinks: parsedSocialLinks,
        profileImage: profileImage ? profileImage.path : null, // Save path of the uploaded profile image
      };
      users.push(user); // Add the new user to the array
    } else {
      // If the user exists, update their data
      user.name = name;
      user.bio = bio;
      user.specializations = parsedSpecializations;
      user.socialLinks = parsedSocialLinks;
      if (profileImage) {
        user.profileImage = profileImage.path; // Save path of the uploaded profile image
      }
    }

    // Save the updated users array back to the users.json file
    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        console.error("Error writing to users file:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      // Respond with success message
      return res.status(200).json({ message: "Profile updated successfully" });
    });
  });
});

// Users detail
app.get("/users", (req, res) => {
  res.sendFile(path.join(__dirname, "users.json"));
});

app.get("/users/:username", (req, res) => {
  const { username } = req.params;
  const users = readDataFromFile(usersFilePath);

  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
