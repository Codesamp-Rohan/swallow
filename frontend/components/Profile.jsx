const Profile = ({ selectedRoomId, userData }) => {
  return (
    <div
      className={`w-[25%] p-6 border-l-[1px] flex flex-col items-center border-l-[#ccc] ${
        selectedRoomId ? "opacity-0 pointer-none:" : ""
      }`}
    >
      <p className="font-bold text-[12px] text-[#444]">Profile</p>
      <div className="w-[100px] h-[100px] bg-[#ccc] rounded-2xl mt-10 mb-3"></div>
      <h1 className="font-bold text-[#444] text-[20px]">{userData.username}</h1>
      <p className="text-center text-[14px] text-[#777]">
        Work for a cause, and not a applause. Work to express and not impress.
      </p>
      <div className="flex flex-col gap-2 mt-4 pt-4 border-t-1 border-t-[#ccc]">
        <h1 className="font-bold text-[#444] text-[12px]">Specialization</h1>
        <p className="text-[14px] text-[#777]">
          #designer #uiux #frontend #developer
        </p>
      </div>
      <div className="flex flex-col gap-2 mt-4 pt-4 border-t-1 border-t-[#ccc]">
        <h1 className="font-bold text-[#444] text-[12px]">Social Links</h1>
        <p className="text-[14px] text-[#777]">
          #designer #uiux #frontend #developer
        </p>
      </div>
    </div>
  );
};

export default Profile;
