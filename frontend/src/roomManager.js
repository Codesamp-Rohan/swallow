// roomManager.js

function generateId(prefix = "room") {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export const RoomManager = {
  getRooms() {
    return JSON.parse(localStorage.getItem("swallow_rooms") || "{}");
  },

  getUserHistory() {
    return JSON.parse(localStorage.getItem("swallow_user_history") || "{}");
  },

  createRoom(name, creatorUsername) {
    const rooms = this.getRooms();
    const roomId = generateId();
    const inviteCode = "join-" + Math.random().toString(36).slice(2, 6);

    rooms[roomId] = {
      name,
      inviteCode,
      createdAt: Date.now(),
      members: {
        [creatorUsername]: { role: "admin", joinedAt: Date.now() },
      },
      messages: [],
    };

    this.saveRooms(rooms);
    this.addToHistory(roomId, creatorUsername, "admin");

    return roomId;
  },

  joinRoomByInvite(inviteCode, username) {
    const rooms = this.getRooms();
    const roomId = Object.keys(rooms).find(
      (id) => rooms[id].inviteCode === inviteCode
    );

    if (!roomId) throw new Error("Invalid invite code");

    rooms[roomId].members[username] = {
      role: "member",
      joinedAt: Date.now(),
    };

    this.saveRooms(rooms);
    this.addToHistory(roomId, username, "member");

    return roomId;
  },

  addToHistory(roomId, username, role) {
    const history = this.getUserHistory();

    if (!history[username]) history[username] = {};

    history[username][roomId] = {
      joinedAt: Date.now(),
      role,
      leftAt: null,
    };

    localStorage.setItem("swallow_user_history", JSON.stringify(history));
  },

  leaveRoom(roomId, username) {
    const history = this.getUserHistory();
    if (history[username] && history[username][roomId]) {
      history[username][roomId].leftAt = Date.now();
      localStorage.setItem("swallow_user_history", JSON.stringify(history));
    }

    const rooms = this.getRooms();
    if (rooms[roomId] && rooms[roomId].members[username]) {
      delete rooms[roomId].members[username];
      this.saveRooms(rooms);
    }
  },

  saveRooms(rooms) {
    localStorage.setItem("swallow_rooms", JSON.stringify(rooms));
  },
};
