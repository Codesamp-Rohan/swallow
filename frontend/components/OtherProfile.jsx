import { useState } from "react";
import defaultImg from "../../backend/uploads/default.png";

const OtherProfile = ({ selectedRoomId, userData, setShowOtherProfile }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowOtherProfile(false);
    }, 300);
  };
  // console.log(userData);

  const profileImageUrl = userData.profileImage
    ? `http://localhost:5173/${userData.profileImage}`
    : defaultImg;

  return (
    <div
      className={`w-[25%] fixed top-0 right-0 z-50 bg-[#0000003a] backdrop-blur-[24px] h-full p-6 border-l border-[#777] flex flex-col items-center transition-transform duration-300 ${
        isClosing ? "translate-x-full" : "translate-x-0"
      }`}
    >
      <button className="absolute right-4 top-4 text-[#777]" onClick={handleClose}>
        close
      </button>
      <p className="font-bold text-[12px] text-[#bbb]">Profile</p>
      <div className="w-[100px] h-[100px] bg-[#ffffff3a] rounded-2xl mt-4 mb-3 overflow-hidden">
        <img
          src={profileImageUrl}
          alt="Profile"
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = defaultImg)}
        />
      </div>

      <h1 className="font-bold text-[#ddd] text-[20px]">
        {userData.username || userData.name}
      </h1>
      <p className="text-center text-[14px] text-[#aaa]">{userData.bio}</p>

      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[#777] w-full">
        <h1 className="font-bold text-[#bbb] text-[12px]">Specialization</h1>
        <div className="flex gap-2 flex-wrap">
          {userData.specializations?.length > 0 ? (
            userData.specializations.map((skill, index) => (
              <p
                className="text-[14px] text-[#ddd] bg-[#0000003a] px-2 rounded-md"
                key={index}
              >
                {skill}
              </p>
            ))
          ) : (
            <p className="text-[14px] text-[#ddd]">No specializations added</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full mt-4 pt-4 border-t border-[#777]">
        <h1 className="font-bold text-[#bbb] text-[12px]">Social Links</h1>
        <div className="flex flex-col gap-2 flex-wrap">
          {userData.socialLinks &&
          Object.keys(userData.socialLinks).length > 0 ? (
            Object.entries(userData.socialLinks).map(
              ([platform, link], index) =>
                link ? (
                  <p
                    className="text-[14px] text-[#ddd] bg-[#0000003a] px-2 py-1 rounded-md"
                    key={index}
                  >
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                  </p>
                ) :
                null
            )
          ) : (
            <p className="text-[14px] text-[#ddd]">No social links added</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtherProfile;
