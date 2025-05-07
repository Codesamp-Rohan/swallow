import { useEffect, useState } from "react";
import defaultImg from "../../backend/uploads/default.png";
import { handleCopy } from "../src/App.jsx";

const Members = ({
  selectedPort = 5173,
  currentRoom,
  selectedRoomId,
  setRoomMemberData,
  setShowOtherProfile,
}) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`http://localhost:${selectedPort}/users`);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users.json", err);
      }
    };
    fetchUsers();
  }, [selectedPort]);

  const getUserData = (username) => {
    if (!users || !Array.isArray(users)) {
      console.error("Users data is not loaded or invalid.");
      return defaultImg;
    }

    const user = users.find((u) => u.username === username);

    if (!user) {
      console.warn(`User '${username}' not found.`);
      return defaultImg;
    }

    const profileImageUrl = user.profileImage
      ? `http://localhost:${selectedPort}/${user.profileImage}`
      : defaultImg;

    return profileImageUrl;
  };

  const membersObj = currentRoom?.members || {};
  const memberNames = Object.keys(membersObj);

  return (
    <div
      className={`w-[30%] bg-[#ebebeb] h-[100%] p-4 border-l-[1px] border-l-[#ccc] ${
        selectedRoomId ? "" : "opacity-0 pointer-none:"
      }`}
    >
      <div className="mb-10 flex flex-col justify-between gap-2">
        <h1 className="text-[24px] font-semibold text-[#444]">
          {currentRoom.name}
        </h1>
        <button
          onClick={() => handleCopy(currentRoom.inviteCode)}
          className="text-[10px] w-fit font-semibold bg-gradient-to-r from-[#566bf3] to-[#0044ff] text-[#ddd] px-2 py-[1px] border-1  border-[#1a4ffd] rounded-xl"
        >
          {currentRoom.inviteCode}
        </button>
      </div>
      <h1 className="text-lg font-semibold mb-3 text-[14px] flex items-center gap-4">
        Members<p className="text-[12px] text-[#777]">{memberNames.length}</p>
      </h1>
      {memberNames.length > 0 ? (
        memberNames.map((username, index) => (
          <button
            key={index}
            id={username}
            onClick={() => {
              setRoomMemberData(username);
              setShowOtherProfile(true);
            }}
            className="flex items-center gap-2 w-full border-b-1 border-b-[#ddd] pb-2 mb-1"
          >
            <img
              src={getUserData(username)}
              alt="profile"
              className="w-8 h-8 rounded-md"
            />
            <div className="text-[#777] text-[14px] font-bold flex items-center">
              {username}
              <span className="text-[8px] font-bold ml-2 ring-1 ring-[#bbb] px-1 rounded">
                {membersObj[username].role}
              </span>
            </div>
          </button>
        ))
      ) : (
        <p className="text-sm text-gray-500">No users found.</p>
      )}
    </div>
  );
};

export default Members;
