import logo from "./assets/logo.png";
import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedPort, setSelectedPort] = useState(5173);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:${selectedPort}/messages`
        );
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();

    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [selectedPort]);

  const handleSend = async () => {
    if (input.trim() == "") return;
    await fetch(`http://localhost:${selectedPort}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: input.trim() }),
    });
    setMessages([...messages, { text: input.trim(), timestamp: Date.now() }]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      <nav className="w-fit mt-[1rem] mb-[1rem]">
        <img src={logo} className="w-[40px] h-[40px]" />
        <p className="font-bold">Swallow</p>
      </nav>
      <main>
        <div className="relative">
          <div className="gradient absolute top-0 w-[100%] h-[80px] left-0 z-10 pointer-none:"></div>
          <div
            id="text--area"
            className="w-full h-full border-0 border-[#ccc] rounded-[24px] flex flex-col gap-1 overflow-y-scroll relative pt-[3rem] pb-[3rem]"
          >
            {messages.length == 0 ? (
              <p className="text-center">No messagess yet.</p>
            ) : (
              messages.map((msg, idx) => (
                <p
                  key={idx}
                  id={msg.timestamp}
                  className="mb-2 bg-[#ebebeb] border-1 border-[#ccc] inline-block px-4 py-1 rounded-xl rounded-bl-[0] w-fit"
                >
                  {msg.text}
                </p>
              ))
            )}
          </div>
          <div className="gradient absolute bottom-0 w-[100%] h-[80px] left-0 z-10 rotate-180 pointer-none:"></div>
        </div>
        <div className="w-full flex items-center mt-4">
          <input
            type="text"
            placeholder="Type your messages..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:ring-[0.5px] focus:ring-[#ddd]"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-[#ddd] text-[#444] cursor-pointer  font-semibold border border-gray-300 rounded-r-full hover:bg-[#ccc]"
          >
            Send
          </button>
        </div>
      </main>
    </>
  );
}

export default App;
