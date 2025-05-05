import { useState } from "react";

const EditProfile = ({ showEditProfile, setShowEditProfile }) => {
  const [editProfileData, setEditProfileData] = useState({
    name: "",
    bio: "",
    profileImage: null,
    specializations: [],
    socialLinks: {
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: "",
    },
  });
  return (
    <div
      className={`fixed top-0 right-0 h-full text-sm w-[30%] z-[999] bg-[#ebebeb] shadow-lg overflow-y-scroll transform ${
        showEditProfile ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out z-50`}
    >
      <div className="flex justify-between items-center p-4 border-b border-b-[#ccc]">
        <h2 className="font-bold">Edit Profile</h2>
        <button
          onClick={() => setShowEditProfile(false)}
          className="text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
      </div>
      <form
        className="p-4 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          // TODO: Add your update logic here (API call)
          console.log(editProfileData);
          setShowEditProfile(false);
        }}
      >
        <div className="w-full">
          <label className="flex flex-col text-[12px] font-bold text-[#777] mx-2 my-1">
            Name
          </label>
          <input
            type="text"
            className="border border-[#ccc] p-1 rounded w-full"
            value={editProfileData.name}
            onChange={(e) =>
              setEditProfileData({
                ...editProfileData,
                name: e.target.value,
              })
            }
          />
        </div>
        <div className="w-full">
          <label className="flex flex-col text-[12px] font-bold text-[#777] mx-2 my-1">
            Bio
          </label>
          <textarea
            className="border border-[#ccc] p-1 rounded w-full"
            value={editProfileData.bio}
            onChange={(e) =>
              setEditProfileData({
                ...editProfileData,
                bio: e.target.value,
              })
            }
          />
        </div>
        <div className="w-full">
          <label className="flex flex-col text-[12px] font-bold text-[#777] mx-2 my-1">
            Profile Image (Max 1MB){" "}
          </label>
          <input
            type="file"
            accept="image/*"
            className="border border-[#ccc] p-1 rounded w-full"
            placeholder="Select Img*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file && file.size <= 1048576) {
                setEditProfileData({
                  ...editProfileData,
                  profileImage: file,
                });
              } else {
                alert("File size must be less than 1MB");
              }
            }}
          />
          {editProfileData.profileImage && (
            <img
              src={URL.createObjectURL(editProfileData.profileImage)}
              alt="Profile Preview"
              className="mt-2 w-24 h-24 object-cover rounded-full"
            />
          )}
        </div>
        <div className="w-full">
          <label className="flex flex-col text-[12px] font-bold text-[#777] mx-2 my-1">
            Specialization (Max 5, use #tag format)
          </label>

          <input
            type="text"
            className="border border-[#ccc] p-1 rounded w-full"
            placeholder="Type a tag and press Enter (e.g., #frontend)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const tag = e.target.value.trim();

                if (!tag.startsWith("#")) {
                  alert("Tag must start with #");
                  return;
                }
                if (tag.length < 2) {
                  alert("Tag is too short");
                  return;
                }
                if (editProfileData.specializations.length >= 5) {
                  alert("You can add a maximum of 5 tags.");
                  return;
                }
                if (editProfileData.specializations.includes(tag)) {
                  alert("Tag already added.");
                  return;
                }

                setEditProfileData({
                  ...editProfileData,
                  specializations: [...editProfileData.specializations, tag],
                });

                e.target.value = "";
              }
            }}
          />

          <div className="flex flex-wrap gap-2 mt-2">
            {editProfileData.specializations.map((tag, index) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center"
              >
                {tag}
                <button
                  className="ml-2 text-blue-500 hover:text-blue-700"
                  onClick={() => {
                    setEditProfileData({
                      ...editProfileData,
                      specializations: editProfileData.specializations.filter(
                        (_, i) => i !== index
                      ),
                    });
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full flex flex-col gap-2">
          <label className="flex flex-col text-[12px] font-bold text-[#777] mx-2 my-1">
            Social Links
          </label>
          <input
            type="text"
            className="border border-[#ccc] p-1 rounded w-full"
            placeholder="Facebook URL"
            value={editProfileData.socialLinks.facebook}
            onChange={(e) =>
              setEditProfileData({
                ...editProfileData,
                socialLinks: {
                  ...editProfileData.socialLinks,
                  facebook: e.target.value,
                },
              })
            }
          />
          <input
            type="text"
            className="border border-[#ccc] p-1 rounded w-full"
            placeholder="Twitter URL"
            value={editProfileData.socialLinks.twitter}
            onChange={(e) =>
              setEditProfileData({
                ...editProfileData,
                socialLinks: {
                  ...editProfileData.socialLinks,
                  twitter: e.target.value,
                },
              })
            }
          />
          <input
            type="text"
            className="border border-[#ccc] p-1 rounded w-full"
            placeholder="LinkedIn URL"
            value={editProfileData.socialLinks.linkedin}
            onChange={(e) =>
              setEditProfileData({
                ...editProfileData,
                socialLinks: {
                  ...editProfileData.socialLinks,
                  linkedin: e.target.value,
                },
              })
            }
          />
          <input
            type="text"
            className="border border-[#ccc] p-1 rounded w-full"
            placeholder="Instagram URL"
            value={editProfileData.socialLinks.instagram}
            onChange={(e) =>
              setEditProfileData({
                ...editProfileData,
                socialLinks: {
                  ...editProfileData.socialLinks,
                  instagram: e.target.value,
                },
              })
            }
          />
        </div>
        <button
          type="submit"
          className="px-4 py-1 text-[14px] bg-[#1a4ffd] text-white rounded mt-4"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
