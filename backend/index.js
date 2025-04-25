const express = require("express");
const cors = require("cors");
const Corestore = require("corestore");
const CryptoJS = require("crypto-js");

const app = express();
const PORT = 5173;

const corestore = new Corestore("hypercoreDB");
const messageCore = corestore.get({
  name: "messages-feed",
  valueEncoding: "json",
});
const usersCore = corestore.get({
  name: "users-feed",
  valueEncoding: "json",
});

app.use(cors());
app.use(express.json());

(async () => {
  await messageCore.ready();
  await usersCore.ready();

  const inv =
    "yry1h8mnrfoqimaqgotpxwq89arahmyjykn87o8a3mm9gx9hsfxydnpn3f7xdzm7zcrccybwtupwfrbxa7whrxqq5crrn3441md53kqp9a";
  console.log("Share to add: ", inv);

  app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
      return res
        .status(400)
        .json({ error: "Username and password are required." });

    const users = [];
    for await (const user of usersCore.createReadStream()) {
      users.push(user);
    }

    const existingUser = users.find((u) => u.username === username);
    if (existingUser)
      return res.status(409).json({ error: "Username already taken." });

    const hashedPassword = CryptoJS.SHA256(password).toString();

    const newUser = {
      username,
      password: hashedPassword,
      createdAt: Date.now(),
    };

    await usersCore.append([newUser]);

    res.status(201).json({ message: "User created successfully." });
  });

  app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
      return res
        .status(400)
        .json({ error: "Username and password are required." });

    const hashedInputPassword = CryptoJS.SHA256(password).toString();

    const users = [];

    for await (const user of usersCore.createReadStream()) {
      users.push(user);
    }

    const matchedUser = users.find(
      (u) => u.username === username && u.password === hashedInputPassword
    );

    if (!matchedUser)
      return res.status(401).json({ error: "Invalid username or password." });

    res.status(200).json({ message: "Login successful." });
  });

  app.post("/message", async (req, res) => {
    try {
      const { text, username } = req.body;

      if (!text || text.trim() === "") {
        return res.status(400).send("Message text required");
      }

      if (!username || username.trim() === "")
        return res.status(400).send("Username required");

      const message = {
        username: username.trim(),
        text: text.trim(),
        timestamp: Date.now(),
      };

      console.log("Saving message:", message);

      await messageCore.append([message]);

      res.status(200).send("Message saved to Hypercore");
    } catch (err) {
      console.error("Error saving message:", err);

      res.status(500).send(`Failed to save message: ${err.message}`);
    }
  });

  app.get("/messages", async (req, res) => {
    try {
      const messages = [];

      const stream = messageCore.createReadStream();

      stream.on("data", (data) => {
        try {
          messages.push(data);
        } catch (err) {
          console.error("Failed to process message:", err);
        }
      });

      stream.on("end", () => {
        res.json(messages);
      });

      stream.on("error", (err) => {
        console.error("Error streaming messages:", err);
        res.status(500).send("Internal server error");
      });
    } catch (err) {
      console.error("Error reading messages:", err);
      res.status(500).send("Internal server error");
    }
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();
