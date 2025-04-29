const express = require("express");
const cors = require("cors");
const fs = require("fs");
const CryptoJS = require("crypto-js");

const app = express();
const PORT = 5173;

// File paths
const usersFilePath = "users.json";
const messagesFilePath = "messages.json";

// Ensure files exist
if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, JSON.stringify([]));
}

if (!fs.existsSync(messagesFilePath)) {
  fs.writeFileSync(messagesFilePath, JSON.stringify([]));
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

app.post("/message", (req, res) => {
  try {
    const { text, username, repliedTo } = req.body;

    // Validate message text
    if (!text || text.trim() === "") {
      return res.status(400).send("Message text required");
    }

    // Validate username
    if (!username || username.trim() === "") {
      return res.status(400).send("Username required");
    }

    // If a message is being replied to, validate that the original message exists
    if (repliedTo) {
      const messages = readDataFromFile(messagesFilePath);
      const originalMessageExists = messages.some(
        (msg) => msg.timestamp === repliedTo.timestamp
      );

      if (!originalMessageExists) {
        return res.status(400).send("Invalid repliedTo: message not found");
      }
    }

    // Prepare the new message
    const message = {
      username: username.trim(),
      text: text.trim(),
      timestamp: Date.now(),
      ...(repliedTo && { repliedTo }), // Include repliedTo if it exists
    };

    console.log("Saving message:", message);

    // Read existing messages, add the new one, and save back to the file
    const messages = readDataFromFile(messagesFilePath);
    messages.push(message);
    writeDataToFile(messagesFilePath, messages);

    res.status(200).send("Message saved to file");
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).send(`Failed to save message: ${err.message}`);
  }
});

app.get("/messages", (req, res) => {
  try {
    const messages = readDataFromFile(messagesFilePath);
    res.json(messages);
  } catch (err) {
    console.error("Error reading messages:", err);
    res.status(500).send("Internal server error");
  }
});

app.put("/message/:timestamp", (req, res) => {
  try {
    const { timestamp } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res
        .status(400)
        .send("New text is required to update the message.");
    }

    const messages = readDataFromFile(messagesFilePath);

    const messageIndex = messages.findIndex(
      (msg) => msg.timestamp.toString() === timestamp
    );

    if (messageIndex === -1) {
      return res.status(404).send("Message not found.");
    }

    messages[messageIndex].text = text.trim();
    messages[messageIndex].editedAt = Date.now(); // optional: add edited timestamp

    writeDataToFile(messagesFilePath, messages);

    res.status(200).json({ message: "Message updated successfully." });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).send("Internal server error");
  }
});

app.delete("/message/:timestamp", (req, res) => {
  try {
    const { timestamp } = req.params;

    const messages = readDataFromFile(messagesFilePath);

    const messageIndex = messages.findIndex(
      (msg) => msg.timestamp.toString() === timestamp
    );

    if (messageIndex === -1) {
      return res.status(404).send("Message not found.");
    }

    messages.splice(messageIndex, 1); // ✅ Actually delete the message

    writeDataToFile(messagesFilePath, messages);

    res.status(200).json({ message: "Message deleted successfully." });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).send("Internal server error");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
