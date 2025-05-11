import { useState, useEffect } from "react";

const EditProfile = ({ showEditProfile, setShowEditProfile, username, fetchUserData }) => {
  const [editProfileData, setEditProfileData] = useState({
    bio: "",
    profileImage: null,
    specializations: [],
    socialLinks: [],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5173/api/getUser?username=${username}`);
        if (!response.ok) {
          console.error("User not found");
          return;
        }

        const data = await response.json();

        const socialLinks = Array.isArray(data.socialLinks)
          ? data.socialLinks
          : Object.entries(data.socialLinks || {}).map(([platform, url]) => ({ platform, url }));

        setEditProfileData({
          bio: data.bio || "",
          profileImage: null, // Never prefill <input type="file" />
          specializations: data.specializations || [],
          socialLinks,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (username) fetchProfile();
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", username);
    formData.append("bio", editProfileData.bio);
    formData.append(
      "specializations",
      JSON.stringify(editProfileData.specializations)
    );
    formData.append("socialLinks", JSON.stringify(editProfileData.socialLinks));
    if (editProfileData.profileImage) {
      formData.append("profileImage", editProfileData.profileImage);
    }

    try {
      const response = await fetch("http://localhost:5173/api/updateUser", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        fetchUserData();
        setShowEditProfile(false);
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while updating profile.");
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full text-sm w-[30%] z-[999] bg-[#0000003a] backdrop-blur-[24px] shadow-lg overflow-y-scroll transform border-l-1 border-l-[#777] ${
        showEditProfile ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out z-50`}
    >
      <div className="flex justify-between items-center p-4 border-b border-b-[#777]">
        <h2 className="font-bold text-[#bbb]">Edit Profile</h2>
        <button
          onClick={() => setShowEditProfile(false)}
          className="text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
      </div>

      <form className="p-4 flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* Bio */}
        <div className="w-full">
          <label className="flex flex-col text-[12px] font-bold text-[#aaa] mx-2 my-1">
            Bio
          </label>
          <textarea
            className="border border-[#444] p-1 rounded w-full text-[#bbb]"
            value={editProfileData.bio}
            onChange={(e) =>
              setEditProfileData({
                ...editProfileData,
                bio: e.target.value,
              })
            }
          />
        </div>

        {/* Profile Image */}
        <div className="w-full">
          <label className="flex flex-col text-[12px] font-bold text-[#aaa] mx-2 my-1">
            Profile Image (Max 1MB)
          </label>
          <input
            type="file"
            accept="image/*"
            className="border border-[#ccc] p-1 rounded w-full text-[#777]"
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

        {/* Specializations */}
        <div className="w-full">
          <label className="flex flex-col text-[12px] font-bold text-[#aaa] mx-2 my-1">
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
                className="bg-[#0000004d] text-[#ddd] px-2 py-1 rounded-full text-sm flex items-center"
              >
                {tag}
                <button
                  className="ml-2 text-[#bbb] hover:text-blue-700"
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

        {/* Social Links (dynamic) */}
        <div className="w-full flex flex-col gap-2">
          <label className="flex flex-col text-[12px] font-bold text-[#aaa] mx-2">
            Social Links
          </label>

          {editProfileData.socialLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                className="border border-[#ccc] p-1 rounded w-[40%]"
                placeholder="Platform (e.g., Twitter)"
                value={link.platform}
                onChange={(e) => {
                  const newLinks = [...editProfileData.socialLinks];
                  newLinks[index].platform = e.target.value;
                  setEditProfileData({ ...editProfileData, socialLinks: newLinks });
                }}
              />
              <input
                type="text"
                className="border border-[#ccc] p-1 rounded w-full"
                placeholder="URL"
                value={link.url}
                onChange={(e) => {
                  const newLinks = [...editProfileData.socialLinks];
                  newLinks[index].url = e.target.value;
                  setEditProfileData({ ...editProfileData, socialLinks: newLinks });
                }}
              />
              <button
                type="button"
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  const newLinks = editProfileData.socialLinks.filter((_, i) => i !== index);
                  setEditProfileData({ ...editProfileData, socialLinks: newLinks });
                }}
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            className="mt-2 px-2 py-1 bg-[#333] text-white rounded text-sm self-start"
            onClick={() => {
              setEditProfileData({
                ...editProfileData,
                socialLinks: [...editProfileData.socialLinks, { platform: "", url: "" }],
              });
            }}
          >
            + Add Social Link
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-4 py-1 text-[14px] bg-[#ffffff3a] hover:bg-[#ffffff18] text-white rounded mt-4"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
