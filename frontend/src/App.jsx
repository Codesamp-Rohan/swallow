import logo from "./assets/logo.png";
import send from "./assets/send.png";
import close from "./assets/close.png";
import edit from "./assets/edit.png";
import deleteBtn from "./assets/delete.png";
import "./App.css";
import { useState, useEffect } from "react";
import Members from "../components/Members";
import Rooms from "../components/Rooms";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedPort, setSelectedPort] = useState(5173);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

  const [selectedRoomId, setSelectedRoomId] = useState(null);
  console.log(selectedRoomId);
  const [selectedRoomName, setSelectedRoomName] = useState(""); // 🆕

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [authForm, setAuthForm] = useState({ name: "", password: "" });

  const [showDropdown, setShowDropdown] = useState(false);
  const [activeDropdownIdx, setActiveDropdownIdx] = useState(null);

  const [editingIdx, setEditingIdx] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const [currentRoom, setCurrentRoom] = useState([]);

  // const selectedRoom = currentRoom.find((room) => room.id === selectedRoomId);
  const isAdmin = currentRoom?.members?.[username]?.role === "admin";
  console.log("isAdmin ?   ", isAdmin);

  function timeAgo(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  useEffect(() => {
    const body = document.body;
    body.style.overflow = showLogin || showSignup ? "hidden" : "";
    return () => (body.style.overflow = "");
  }, [showLogin, showSignup]);

  useEffect(() => {
    if (!selectedRoomId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:${selectedPort}/messages/${selectedRoomId}`
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
  }, [selectedPort, selectedRoomId]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    try {
      const repliedMessageDetails = replyTo
        ? {
            username: replyTo.username,
            text: replyTo.text,
            timestamp: replyTo.timestamp,
          }
        : null;

      await fetch(
        `http://localhost:${selectedPort}/message/${selectedRoomId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: input.trim(),
            username,
            roomId: selectedRoomId,
            repliedTo: repliedMessageDetails,
          }),
        }
      );

      setInput("");
      setReplyTo(null);
      try {
        const response = await fetch(
          `http://localhost:${selectedPort}/messages/${selectedRoomId}`
        );
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent newline
      handleSend();
    }
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

  const handleDelete = async (timestamp, idx) => {
    try {
      await fetch(
        `http://localhost:${selectedPort}/message/${selectedRoomId}/${timestamp}`,
        {
          method: "DELETE",
        }
      );

      // Update frontend
      const updatedMessages = [...messages];
      updatedMessages.splice(idx, 1);
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <>
      <div id="page">
        <Rooms
          username={username}
          selectedPort={selectedPort}
          setSelectedRoomId={setSelectedRoomId}
          setSelectedRoomName={setSelectedRoomName}
          setCurrentRoom={setCurrentRoom}
        />

        <div className="chat--area relative">
          <nav className="w-full mt-[1rem] mb-[1rem] flex justify-between navbar">
            <div className="flex justify-center items-center">
              <img src={logo} className="w-[40px] h-[40px]" />
              <p className="font-bold">Swallow</p>
              {selectedRoomName && (
                <p className="font-bold ml-4">{selectedRoomName}</p>
              )}
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
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="text-sm font-bold bg-[#eee] px-3 py-1 rounded-full"
                >
                  👋 Hello, {username}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-40 rounded-b-md bg-[#ebebeb] border-gray-300 rounded shadow-lg text-sm z-50">
                    <button
                      onClick={() => {
                        alert(`Viewing profile of ${username}`);
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-[#dbdbdb] rounded-t-md"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem("username");
                        setUsername("");
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-[#dbdbdb] rounded-b-md"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
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
            <div
              id={showLogin ? "logInPopUp" : "signUpPopUp"}
              className="text-sm"
            >
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

          {selectedRoomId && (
            <>
              <main>
                <div className="relative">
                  <div className="gradient absolute top-0 w-[100%] h-[80px] left-0 z-10 pointer-events-none"></div>
                  <div
                    id="text--area"
                    className="w-full h-full border-0 border-[#ccc] rounded-[24px] flex flex-col overflow-y-scroll relative pt-[3rem] pb-[4rem] pr-4"
                  >
                    {!username ? (
                      <p>
                        Please login or signup before seeing or entering a chat
                        😁
                      </p>
                    ) : messages.length == 0 ? (
                      <p className="text-center">No messagess yet.</p>
                    ) : (
                      messages.map((msg, idx) => {
                        const previous = messages[idx - 1];
                        const sameUser =
                          previous && previous.username === msg.username;
                        const timeDiff = previous
                          ? Math.abs(
                              new Date(msg.timestamp) -
                                new Date(previous.timestamp)
                            ) / 1000
                          : Infinity;

                        const showUsername = !(sameUser && timeDiff < 120);

                        return (
                          <div
                            key={idx}
                            className={`mb-1 max-w-[70%] bg-[#ebebeb] text-[#444] text-[14px] message ${
                              msg.username === username
                                ? "ml-auto text-right rounded-br-none flex flex-col items-end"
                                : "mr-auto text-left rounded-bl-none"
                            }`}
                          >
                            {showUsername && (
                              <strong
                                className={`text-xs text-[#777] mb-[2px] flex flex-row gap-1 ${
                                  msg.username === username ? "justify-end" : ""
                                }`}
                              >
                                {msg.username}
                              </strong>
                            )}
                            <div
                              className={`md:w-fit relative group flex ${
                                msg.username === username
                                  ? "justify-end w-[90vw]"
                                  : "w-[fit-content]"
                              }`}
                            >
                              {editingIdx === idx ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editingText}
                                    onChange={(e) =>
                                      setEditingText(e.target.value)
                                    }
                                    className="border p-1 rounded text-black text-sm"
                                  />
                                  <button
                                    onClick={async () => {
                                      // Update in backend
                                      await fetch(
                                        `http://localhost:${selectedPort}/message/${selectedRoomId}/${msg.timestamp}`,
                                        {
                                          method: "PUT",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            text: editingText,
                                          }),
                                        }
                                      );

                                      const updatedMessages = [...messages];
                                      updatedMessages[idx].text = editingText;
                                      setMessages(updatedMessages);

                                      setEditingIdx(null);
                                      setEditingText("");
                                    }}
                                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingIdx(null);
                                      setEditingText("");
                                    }}
                                    className="px-2 py-1 bg-gray-400 text-white text-xs rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div
                                  className={`rounded-lg border-[1px] border-[#ddd] ${
                                    msg.username === username
                                      ? "bg-gradient-to-r from-[#566bf3] to-[#0044ff]"
                                      : ""
                                  }`}
                                >
                                  {msg.repliedTo && (
                                    <div
                                      className={`p-2 text-xs  items-start mb-1 rounded-t-lg flex flex-col ${
                                        msg.username === username
                                          ? "text-[#ebebeb] bg-[#ffffff28]"
                                          : "text-[#222] bg-[#00000016]"
                                      }`}
                                    >
                                      <div className="font-bold flex flex-row gap-2 italic w-full text-[10px]">
                                        <p>{msg.repliedTo.username}</p>
                                        {timeAgo(msg.repliedTo.timestamp)}
                                      </div>
                                      {msg.repliedTo.text}
                                    </div>
                                  )}
                                  <p
                                    id={msg.timestamp}
                                    className={`singleMessage px-2 w-fit py-1 flex flex-row items-end gap-2 whitespace-pre-wrap text-left rounded-md ${
                                      msg.username === username
                                        ? `text-[#ddd]`
                                        : "text-[#444]"
                                    }`}
                                  >
                                    {msg.text}
                                    <span className="text-[10px] whitespace-nowrap font-bold text-[#bbb]">
                                      {timeAgo(msg.timestamp)}
                                    </span>
                                  </p>
                                </div>
                              )}
                              <>
                                <button
                                  onClick={() =>
                                    setActiveDropdownIdx(
                                      activeDropdownIdx === idx ? null : idx
                                    )
                                  }
                                  className={`md:hidden group-hover:block font-bold absolute top-0 right-2 ${
                                    msg.username === username
                                      ? "text-[#fff]"
                                      : "text-[#000]"
                                  }`}
                                >
                                  ...
                                </button>

                                {activeDropdownIdx === idx && (
                                  <div
                                    className={`absolute mt-8 w-40 rounded-md bg-[#ebebeb] border-gray-300 text-[#546af3] shadow-lg text-sm z-50 overflow-hidden text-[12px] font-bold ${
                                      msg.username === username
                                        ? "right-0"
                                        : "left-[90%]"
                                    }`}
                                  >
                                    <button
                                      onClick={() => setReplyTo(msg)}
                                      className="flex gap-2 items-center w-full text-left px-4 py-1 hover:bg-[#dbdbdb]"
                                    >
                                      <img
                                        src={send}
                                        className="w-[10px] h-[10px]"
                                      />{" "}
                                      Reply
                                    </button>
                                    {isAdmin || msg.username === username ? (
                                      <>
                                        <button
                                          onClick={() => {
                                            // alert(`Viewing profile of ${username}`);
                                            setEditingIdx(idx);
                                            setEditingText(msg.text);
                                            setActiveDropdownIdx(null);
                                          }}
                                          className="flex gap-2 items-center w-full text-left px-4 py-1 hover:bg-[#dbdbdb]"
                                        >
                                          <img
                                            src={edit}
                                            className="w-[10px] h-[10px]"
                                          />{" "}
                                          Edit
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDelete(msg.timestamp, idx)
                                          }
                                          className="flex gap-2 items-center w-full text-left px-4 py-1 hover:bg-[#dbdbdb] text-red-500"
                                        >
                                          <img
                                            src={deleteBtn}
                                            className="w-[10px] h-[10px]"
                                          />{" "}
                                          Delete
                                        </button>
                                      </>
                                    ) : null}
                                  </div>
                                )}
                              </>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="gradient absolute bottom-0 w-[100%] h-[80px] left-0 z-10 rotate-180 pointer-events-none"></div>
                </div>
              </main>
              <div className="sticky z-[999] mx-[2%] md:mx-0 md:w-[100%] w-[96%] p-1 bottom-4 left-0 flex flex-col items-center mt-4 border-1 border-[#ccc] bg-[#ebebeb] rounded-[12px] writeMsgInput">
                {replyTo && (
                  <div className="w-full flex flex-col gap-1 bg-[#e2e2e2] py-2 mb-2 px-4 rounded-[12px] relative">
                    <p className="text-[10px] text-[#777]">
                      <i>Replying to </i>
                      <strong>{replyTo.username}</strong>
                    </p>
                    <p className="text-[14px] text-[#777] font-bold">
                      {replyTo.text}
                    </p>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="absolute right-4 top-4"
                    >
                      <img src={close} className="w-[12px] h-[12px]" />
                    </button>
                  </div>
                )}
                <div className="flex w-full rounded-full">
                  <textarea
                    data-gramm="false"
                    placeholder="Type your messages..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-4 py-2 focus:outline-none text-[14px] text-[#777] resize-none rounded-[12px] bg-transparent max-h-[150px] overflow-y-auto"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    className="px-4 py-2 cursor-pointer"
                  >
                    <img src={send} className="w-[24px] h-[24px]" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        <Members selectedPort={selectedPort} messages={messages} />
      </div>
    </>
  );
}

export default App;
