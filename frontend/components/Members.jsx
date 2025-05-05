const Members = ({ selectedPort = 5173, currentRoom, selectedRoomId }) => {
  console.log(currentRoom);

  const membersObj = currentRoom?.members || {};
  const memberNames = Object.keys(membersObj);

  return (
    <div
      className={`w-[25%] p-4 border-l-[1px] border-l-[#ccc] ${
        selectedRoomId ? "" : "opacity-0 pointer-none:"
      }`}
    >
      <div className="mb-10 flex justify-between items-center">
        <h1 className="text-[24px] font-semibold text-[#444]">
          {currentRoom.name}
        </h1>
        <h1 className="text-[10px] font-semibold bg-gradient-to-r from-[#566bf3] to-[#0044ff] text-[#ddd] px-2 py-[1px] border-1  border-[#1a4ffd] rounded-xl">
          {currentRoom.inviteCode}
        </h1>
      </div>
      <h1 className="text-lg font-semibold mb-3 text-[14px] flex items-center gap-4">
        Members<p className="text-[12px] text-[#777]">{memberNames.length}</p>
      </h1>
      {memberNames.length > 0 ? (
        memberNames.map((username, index) => (
          <div
            key={index}
            className="text-[#777] mb-1 pb-2 border-b-1 border-b-[#ddd] text-[12px] font-bold"
          >
            {username}
            <span className="text-[8px] font-bold ml-2 ring-1 ring-[#bbb] px-1 rounded">
              {membersObj[username].role}
            </span>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">No users found.</p>
      )}
    </div>
  );
};

export default Members;
