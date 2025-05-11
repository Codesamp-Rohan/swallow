import { useState, useEffect } from "react";
import createBtn from '../src/assets/create.png';
import joinBtn from '../src/assets/join.png';

const Rooms = ({
  username,
  selectedPort = 5173,
  setSelectedRoomId,
  setSelectedRoomName,
  setCurrentRoom,
}) => {
  const [roomName, setRoomName] = useState("");
  const [rooms, setRooms] = useState({});
  const [inviteCode, setInviteCode] = useState("");
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [editRoomId, setEditRoomId] = useState(null); // 🔁 New: track which room is being edited

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return alert("Enter a room name");

    try {
      const res = await fetch(`http://localhost:${selectedPort}/rooms/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName.trim(), createdBy: username }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Room created: ${data.name}\nInvite Code: ${data.inviteCode}`);
        setRoomName("");
        await handleRooms();
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Failed to create room", err);
    }
  };

  const handleJoinRoom = async () => {
    if (!inviteCode.trim()) return alert("Enter an invite code");

    try {
      const res = await fetch(`http://localhost:${selectedPort}/rooms/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: inviteCode.trim(), username }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Joined room: ${data.name}`);
        setInviteCode("");
        await handleRooms();
      } else {
        alert(data.error || "Failed to join room");
      }
    } catch (err) {
      console.error("Join failed:", err);
      alert("Error joining room");
    }
  };

  const handleRooms = async () => {
    try {
      const res = await fetch(`http://localhost:${selectedPort}/rooms?user=${username}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setRooms(data.rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleLeaveRoom = async (roomId) => {
    try {
      const res = await fetch(`http://localhost:${selectedPort}/rooms/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, username }),
      });

      const text = await res.text();
console.log("Raw response:", text);
const data = JSON.parse(text);


      // const data = await res.json();
      
      if (res.ok) {
        alert(`Left room: ${data.name}`);
        if (activeRoomId === roomId) {
          setActiveRoomId(null);
          setSelectedRoomId(null);
          setSelectedRoomName(null);
          setCurrentRoom(null);
        }
        await handleRooms();
      } else {
        alert(data.error || "Failed to leave room");
      }
    } catch (err) {
      console.error("Leave room failed:", err);
    }
  };

  useEffect(() => {
    if (username) handleRooms();
  }, [selectedPort, username]);

  return (
    <div className="w-[25%] max-w-[25%] h-full p-4 overflow-y-auto border-r-[1px] border-r-[#444] room--area text-[#ddd]">
      <h1 className="text-lg font-semibold mb-3 text-[14px] flex items-center gap-4">
        Rooms
      </h1>

      {/* Room Creation */}
      <div className="flex gap-1 mb-2">
        <input
          type="text"
          placeholder="Room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="border-1 border-[#444] p-1 text-[12px] text-[#777] rounded w-full"
        />
        <button
          onClick={handleCreateRoom}
          className="w-fit bg-[#0000003b] border-1 border-[#444] text-white text-[12px] rounded-[10px] px-2"
        >
          <img src={createBtn} className="w-5 h-4" />
        </button>
      </div>

      {/* Room Join */}
      <div className="flex gap-1 mb-2">
        <input
          type="text"
          placeholder="Invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          className="border-1 border-[#444] p-1 text-[12px] text-[#777] rounded w-full"
        />
        <button
          onClick={handleJoinRoom}
          className="w-fit bg-[#0000003b] border-1 border-[#444] text-white text-[12px] rounded-[10px] px-2"
        >
          <img src={joinBtn} className="w-5 h-4" />
        </button>
      </div>

      {/* Room List */}
      <div className="space-y-1">
        {Object.keys(rooms).length === 0 ? (
          <div className="text-sm text-gray-500 italic">No rooms joined yet.</div>
        ) : (
          Object.entries(rooms).map(([roomId, room]) => (
            <div
              key={roomId}
              onClick={() => {
                setSelectedRoomId(roomId);
                setSelectedRoomName(room.name);
                setCurrentRoom(room);
                setActiveRoomId(roomId);
                setEditRoomId(null); // Close edit menu
              }}
              className={`relative cursor-pointer p-2 rounded-[10px] ${
                activeRoomId === roomId
                  ? "bg-[#77777718] text-[#ddd]"
                  : "bg-[#00000018] hover:bg-[#77777718] text-[#ddd]"
              }`}
            >
              <div className="flex justify-between">
                <p className="font-bold text-[12px]">{room.name}</p>
                <p className="text-xs text-[10px]">{room.inviteCode}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-[12px] text-[#aaa] font-light line-clamp-2">
                  {room.messages?.length
                    ? `${room.messages.at(-1).username} : ${room.messages.at(-1).text}`
                    : "No messages yet."}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditRoomId((prev) => (prev === roomId ? null : roomId));
                  }}
                  className="hover:bg-[#7777773a] rounded-md w-fit h-fit p-1"
                >
                  ...
                </button>
              </div>

              {editRoomId === roomId && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-2 top-14 w-fit bg-[#77777718] backdrop-blur-[24px] border border-[#444] rounded-lg shadow-lg text-sm z-50"
                >
                  <button
                    onClick={() => handleLeaveRoom(roomId)}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-[#bbbbbb3b] rounded-lg"
                  >
                    Leave Room
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Rooms;
