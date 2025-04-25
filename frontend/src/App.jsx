import logo from "./assets/logo.png";
import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedPort, setSelectedPort] = useState(5173);

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    const body = document.body;
    if (showLogin || showSignup) {
      body.style.overflow = "hidden";
    } else {
      body.style.overflow = "";
    }
    return () => {
      body.style.overflow = "";
    };
  }, [showLogin, showSignup]);

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
      <nav className="w-full mt-[1rem] mb-[1rem] flex justify-between">
        <div className="flex justify-center items-center">
          <img src={logo} className="w-[40px] h-[40px]" />
          <p className="font-bold">Swallow</p>
        </div>
        <div className="flex gap-[1rem] text-[12px]">
          <button
            onClick={() => {
              setShowLogin(true);
              setShowSignup(false);
            }}
            id="logInBtn"
            className="px-2 py-1 bg-[#ddd] border-1 border-[#ccc] rounded-[5px] font-bold"
          >
            Log In
          </button>
          <button
            id="signUpBtn"
            onClick={() => {
              setShowSignup(true);
              setShowLogin(false);
            }}
            className="px-2 py-1 bg-[#242424] border-1 border-[#000] text-[#ddd] rounded-[5px] font-bold"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {(showLogin || showSignup) && <div className="overflow"></div>}

      {showLogin && (
        <div id="logInPopUp" className="text-[12px]">
          <span className="flex flex-col">
            <h1 className="text-[16px] font-bold">Log In</h1>
            <p>Enter your name and password to login</p>
          </span>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label>Enter the Name</label>
              <input
                type="text"
                name="name"
                id="login--name"
                placeholder="Enter the name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label>Enter the Name</label>
              <input
                type="password"
                name="name"
                id="login--password"
                placeholder="Enter the password"
              />
            </div>
            <div className="flex gap-[1rem] text-[12px]">
              <button
                onClick={() => setShowLogin(false)}
                className="px-2 py-1 bg-[#ddd] border-1 border-[#ccc] rounded-[5px] font-bold w-full cancelBtn"
              >
                cancel
              </button>
              <button
                id="signUpBtn"
                className="px-2 py-1 bg-[#242424] border-1 border-[#000] text-[#ddd] rounded-[5px] font-bold w-full"
              >
                Log In
              </button>
            </div>
            <p className="text-[#777]">
              Do not have an account?{" "}
              <a
                onClick={() => {
                  setShowSignup(true);
                  setShowLogin(false);
                }}
                id="signUpToggleBtn"
                className="underline text-[#000] font-bold"
              >
                Sign Up
              </a>
            </p>
          </div>
        </div>
      )}
      {showSignup && (
        <div id="signUpPopUp" className="text-[12px] hide">
          <span className="flex flex-col">
            <h1 className="text-[16px] font-bold">Sign Up</h1>
            <p>Enter your name and password to signup</p>
          </span>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label>Enter the Name</label>
              <input
                type="text"
                name="name"
                id="login--name"
                placeholder="Enter the name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label>Enter the Password</label>
              <input
                type="password"
                name="name"
                id="login--password"
                placeholder="Enter the password"
              />
            </div>
            <div className="flex gap-[1rem] text-[12px]">
              <button
                onClick={() => setShowSignup(false)}
                className="px-2 py-1 bg-[#ddd] border-1 border-[#ccc] rounded-[5px] font-bold w-full cancelBtn"
              >
                cancel
              </button>
              <button
                id="signUpBtn"
                className="px-2 py-1 bg-[#242424] border-1 border-[#000] text-[#ddd] rounded-[5px] font-bold w-full"
              >
                Sign Up
              </button>
            </div>
            <p className="text-[#777]">
              Already have an account?{" "}
              <a
                onClick={() => {
                  setShowLogin(true);
                  setShowSignup(false);
                }}
                id="logInToggleBtn"
                className="underline text-[#000] font-bold"
              >
                Log In
              </a>
            </p>
          </div>
        </div>
      )}

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
                  className="mb-2 bg-[#ebebeb] border-1 border-[#ccc] inline-block px-4 py-1 rounded-xl rounded-bl-[0] w-fit max-w-[70%]"
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
