import { useState, useEffect } from "react";

const Members = ({ selectedPort = 5173 }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const handleMembers = async () => {
      try {
        const response = await fetch(`http://localhost:${selectedPort}/users`);
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    handleMembers();
  }, [selectedPort]);

  return (
    <div className="w-[25%] p-4 mt-2    ">
      <h1 className="text-lg font-semibold mb-3 text-[14px] flex items-center gap-4">
        Members List <p className="text-[12px] text-[#777]">{users.length}</p>
      </h1>
      {users.length > 0 ? (
        users.map((user, index) => (
          <div
            key={index}
            className="text-[#777] mb-1 pb-2 border-b-1 border-b-[#ddd] text-[12px] font-bold"
          >
            {user.username}
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">No users found.</p>
      )}
    </div>
  );
};

export default Members;
