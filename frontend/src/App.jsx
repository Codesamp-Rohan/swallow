import logo from "./assets/logo.png";
import "./App.css";
import { useState, useEffect } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedPort, setSelectedPort] = useState(5173);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [authForm, setAuthForm] = useState({ name: "", password: "" });

  useEffect(() => {
    const body = document.body;
    body.style.overflow = showLogin || showSignup ? "hidden" : "";
    return () => (body.style.overflow = "");
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
      body: JSON.stringify({ text: input.trim(), username: username }),
    });
    setMessages([...messages, { text: input.trim(), timestamp: Date.now() }]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleAuth = async (type) => {
    const endpoint = type === "signup" ? "/signup" : "/login";

    try {
      const response = await fetch(
        `http://localhost:${selectedPort}${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: authForm.name,
            password: authForm.password,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("username", authForm.name);
        setUsername(authForm.name);
        setShowLogin(false);
        setShowSignup(false);
        setAuthForm({ name: "", password: "" });
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  return (
    <>
      <nav className="w-full mt-[1rem] mb-[1rem] flex justify-between">
        <div className="flex justify-center items-center">
          <img src={logo} className="w-[40px] h-[40px]" />
          <p className="font-bold">Swallow</p>
        </div>
        {!username ? (
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => {
                setShowLogin(true);
                setShowSignup(false);
              }}
              className="px-2 py-1 bg-[#ddd] border border-[#ccc] rounded font-bold"
            >
              Log In
            </button>
            <button
              onClick={() => {
                setShowSignup(true);
                setShowLogin(false);
              }}
              className="px-2 py-1 bg-[#242424] border border-black text-white rounded font-bold"
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div className="text-sm font-bold">👋 Hello, {username}</div>
        )}
      </nav>

      {(showLogin || showSignup) && (
        <div
          onClick={() => {
            setShowLogin(false);
            setShowSignup(false);
          }}
          className="overflow"
        ></div>
      )}

      {(showLogin || showSignup) && (
        <div id={showLogin ? "logInPopUp" : "signUpPopUp"} className="text-sm">
          <h1 className="text-lg font-bold">
            {showLogin ? "Log In" : "Sign Up"}
          </h1>
          <p>
            {showLogin
              ? "Enter your name and password to login"
              : "Create your account"}
          </p>
          <div className="flex flex-col gap-3 mt-3">
            <input
              type="text"
              placeholder="Name"
              value={authForm.name}
              onChange={(e) =>
                setAuthForm({ ...authForm, name: e.target.value })
              }
              className="border p-1 rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(e) =>
                setAuthForm({ ...authForm, password: e.target.value })
              }
              className="border p-1 rounded"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowLogin(false);
                  setShowSignup(false);
                }}
                className="flex-1 bg-[#ddd] border border-[#ccc] rounded font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAuth(showLogin ? "login" : "signup")}
                className="flex-1 bg-[#242424] border border-[#000] text-white rounded font-bold"
              >
                {showLogin ? "Log In" : "Sign Up"}
              </button>
            </div>
            <p className="text-gray-600">
              {showLogin ? (
                <>
                  Don’t have an account?{" "}
                  <span
                    className="underline font-bold cursor-pointer"
                    onClick={() => {
                      setShowLogin(false);
                      setShowSignup(true);
                    }}
                  >
                    Sign Up
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span
                    className="underline font-bold cursor-pointer"
                    onClick={() => {
                      setShowSignup(false);
                      setShowLogin(true);
                    }}
                  >
                    Log In
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      <main>
        <div className="relative">
          <div className="gradient absolute top-0 w-[100%] h-[80px] left-0 z-10 pointer-none:"></div>
          <div
            id="text--area"
            className="w-full h-full border-0 border-[#ccc] rounded-[24px] flex flex-col gap-1 overflow-y-scroll relative py-[3rem] pr-4"
          >
            {!username ? (
              <p>Please login or signup before seeing or entering a chat 😁</p>
            ) : messages.length == 0 ? (
              <p className="text-center">No messagess yet.</p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 px-4 py-1 max-w-[70%] bg-[#ebebeb] rounded-xl border-1 border-[#bbb] text-[#444] text-[12px] ${
                    msg.username === username
                      ? "ml-auto text-right rounded-br-none"
                      : "mr-auto text-left rounded-bl-none"
                  }`}
                >
                  <strong className="block text-xs text-[#666] mb-[2px]">
                    {msg.username}
                  </strong>
                  {msg.text}
                </div>
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
