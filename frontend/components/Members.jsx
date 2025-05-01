const Members = ({ selectedPort = 5173, currentRoom }) => {
  console.log(currentRoom);

  const membersObj = currentRoom?.members || {};
  const memberNames = Object.keys(membersObj);

  return (
    <div className="w-[25%] p-4 mt-2">
      <h1 className="text-lg font-semibold mb-3 text-[14px] flex items-center gap-4">
        Members List{" "}
        <p className="text-[12px] text-[#777]">{memberNames.length}</p>
      </h1>
      {memberNames.length > 0 ? (
        memberNames.map((username, index) => (
          <div
            key={index}
            className="text-[#777] mb-1 pb-2 border-b-1 border-b-[#ddd] text-[12px] font-bold"
          >
            {username}
            <span className="text-[10px] font-normal ml-2">
              ({membersObj[username].role})
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
