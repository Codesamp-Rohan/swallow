// Rooms.jsx
import { useState, useEffect } from "react";

const Rooms = ({
  username,
  selectedPort = 5173,
  setSelectedRoomId,
  setSelectedRoomName,
  setCurrentRoom,
}) => {
  const [roomName, setRoomName] = useState("");
  const [rooms, setRooms] = useState({}); // 🟢 new state to hold rooms
  const [inviteCode, setInviteCode] = useState("");
  const [activeRoomId, setActiveRoomId] = useState(null);

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

        // 🔁 Refresh rooms after join
        const updated = await fetch(
          `http://localhost:${selectedPort}/rooms?user=${username}`
        );
        const result = await updated.json();
        setRooms(result.rooms);
      } else {
        alert(data.error || "Failed to join room");
      }
    } catch (err) {
      console.error("Join failed:", err);
      alert("Error joining room");
    }
  };

  useEffect(() => {
    const handleRooms = async () => {
      try {
        const res = await fetch(
          `http://localhost:${selectedPort}/rooms?user=${username}`
        );
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setRooms(data.rooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    if (username) handleRooms();
  }, [selectedPort, username]);

  return (
    <div className="w-[20%] max-w-[20%] h-full p-4 overflow-y-auto border-r-[1px] border-r-[#ccc] room--area">
      <h1 className="text-lg font-semibold mb-3 text-[14px] flex items-center gap-4">
        Rooms
      </h1>
      <input
        type="text"
        placeholder="Room name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        className="border-1 border-[#bbb] p-1 text-[12px] text-[#777] rounded w-full mb-2"
      />
      <button
        onClick={handleCreateRoom}
        className="w-full bg-[#1a4ffd] text-white py-1 text-[12px] rounded mb-4"
      >
        Create a new room
      </button>
      <input
        type="text"
        placeholder="Invite code"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        className="border-1 border-[#bbb] p-1 text-[12px] text-[#777] rounded w-full mb-2"
      />
      <button
        onClick={handleJoinRoom}
        className="w-full bg-[#ccc] border-1 border-[#bbb] text-[#444] py-1 text-[12px] rounded mb-4"
      >
        Join Room
      </button>

      {/* 🟢 Room list display */}
      <div className="space-y-1">
        {Object.keys(rooms).length === 0 ? (
          <div className="text-sm text-gray-500 italic">
            No rooms joined yet.
          </div>
        ) : (
          Object.entries(rooms).map(([roomId, room]) => (
            <div
              key={roomId}
              onClick={() => {
                setSelectedRoomId(roomId),
                  setSelectedRoomName(room.name),
                  setActiveRoomId(roomId);
                setCurrentRoom(room);
              }}
              className={`cursor-pointer p-1 rounded ${
                activeRoomId === roomId
                  ? "bg-[#ddd] text-[#444]"
                  : "hover:bg-[#ddd] text-[#777]"
              }`}
            >
              <div className="flex justify-between">
                <p className="font-bold text-[12px]">{room.name}</p>
                <p className="text-xs text-[10px]">{room.inviteCode}</p>
              </div>
              <p className="text-xs text-[12px] text-[#666] font-semibold line-clamp-1">
                {room.messages && room.messages.length > 0
                  ? `${room.messages[room.messages.length - 1].username} : ${
                      room.messages[room.messages.length - 1].text
                    }`
                  : "No messages yet."}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Rooms;
