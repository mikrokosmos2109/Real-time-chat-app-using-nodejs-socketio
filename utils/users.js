import UserModel from "../models/user.model.js";
import RoomModel from "../models/room.model.js";

let users = [];

export const userJoin = async (id, username, room) => {
  let user;
  let roomD;

  let userD = await UserModel.findOne({ name: username });
  if (!userD) {
    const newUser = new UserModel({ name: username });
    await newUser.save();
    userD = newUser;
  }

  roomD = await RoomModel.findOne({ roomName: room });
  if (!roomD) {
    const newRoom = new RoomModel({ roomName: room });
    await newRoom.save();
    roomD = newRoom;
  }

  roomD.users.push(userD._id);
  await roomD.save();

  user = {
    socketId: id,
    id: userD._id,
    roomId: roomD._id,
    room: roomD.roomName,
    username: userD.name,
  };
  users.push(user);
  return user;
};

export const userLeave = async (socketId) => {
  const index = users.findIndex((user) => user.socketId === socketId);
  if (index !== -1) {
    const userFound = users[index];
    const roomD = await RoomModel.findOne({ _id: userFound.roomId }).populate("users");
    if (roomD) {
      const indexRoom = roomD.users.findIndex(
        (user) => String(user._id) === String(userFound.id)
      );
      if (indexRoom !== -1) {
        roomD.users.splice(indexRoom, 1);
        await roomD.save();
      }
    }
    return userFound;
  }
};

export const getRoomUsers = async (roomId) => {
  const roomD = await RoomModel.findOne({ _id: roomId }).populate("users");
  if (roomD) {
    return roomD.users;
  }
  console.log("There was an error fetching room details");
  return null;
};

export const getCurrentUser = (id) => {
  return users.find((user) => user.socketId === id);
};
