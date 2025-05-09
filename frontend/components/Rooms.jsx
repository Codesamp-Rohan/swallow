// Rooms.jsx
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

  useEffect(() => {
    if (username) handleRooms();
  }, [selectedPort, username]);

  return (
    <div className="w-[25%] max-w-[25%] h-full p-4 overflow-y-auto border-r-[1px] border-r-[#777] room--area text-[#ddd]">
      <h1 className="text-lg font-semibold mb-3 text-[14px] flex items-center gap-4">
        Rooms
      </h1>
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
              className={`cursor-pointer p-2 rounded-[10px] ${
                activeRoomId === roomId
                  ? "bg-[#0000003b] text-[#ddd]"
                  : "bg-[#00000018] hover:bg-[#0000003b] text-[#ddd]"
              }`}
            >
              <div className="flex justify-between">
                <p className="font-bold text-[12px]">{room.name}</p>
                <p className="text-xs text-[10px]">{room.inviteCode}</p>
              </div>
              <p className="text-xs text-[12px] text-[#aaa] font-light line-clamp-2">
                {room.messages && room.messages.length > 0
                  ? `${room.messages[room.messages.length - 1].username} : ${
                      room.messages[room.messages.length - 1].text
                    }`
                  : "No rooms yet."}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Rooms;
