const express = require("express");
const cors = require("cors");
const Autopass = require("autopass");
const Corestore = require("corestore");
const Hypercore = require("hypercore");

const app = express();
const PORT = 5173;

const corestore = new Corestore("hypercoreDB");
const messageCore = corestore.get({
  name: "messages-feed",
  valueEncoding: "json",
});

app.use(cors());
app.use(express.json());

(async () => {
  await messageCore.ready();

  const inv =
    "yry1h8mnrfoqimaqgotpxwq89arahmyjykn87o8a3mm9gx9hsfxydnpn3f7xdzm7zcrccybwtupwfrbxa7whrxqq5crrn3441md53kqp9a";
  console.log("Share to add: ", inv);

  app.post("/message", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || text.trim() === "") {
        return res.status(400).send("Message text required");
      }

      const message = {
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
