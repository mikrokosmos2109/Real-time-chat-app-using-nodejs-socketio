import dotenv from "dotenv";
dotenv.config();
import { connect } from "mongoose";
import express from "express";
import chatMessage from "./utils/chatMessage.js";



const connectDatabase = () => {
	connect(process.env.MONGO_URI)
		.then(() => console.log("Connected to mongodb Database"))
		.catch((e) => console.log(e.message));
};


connectDatabase();
import loadChats from "./utils/loadChats.js";
import http from "http";
import { Server } from "socket.io";
import { userJoin, getCurrentUser, getRoomUsers, userLeave } from "./utils/users.js";


const app = express();
const server = http.createServer(app);
const io = new Server(server);


import messageFormatter from "./utils/messageFormatter.js";
app.use(express.static("public"));
const chat_bot = "GROUP ADMIN";
let user;

io.on("connection", async (socket) => {

	console.log("new user connected");
	socket.on("joinRoom", async ({ username, room }) => {
		user = await userJoin(socket.id, username, room);

		socket.join(user.room);

		socket.emit("loadChats", await loadChats(user.roomId));

		socket.broadcast
			.to(user.room)
			.emit("message", messageFormatter(chat_bot, `${user.username} has joined the chat`));
		io.to(user.room).emit("roomUsers", {
			room: user.room,
			users: await getRoomUsers(user.roomId),
		});
	});
	socket.on("disconnect", async () => {
		const user = await userLeave(socket.id);
		io.to(user.room).emit("message", messageFormatter(chat_bot, `${user.username} has left the chat`));
		io.to(user.room).emit("roomUsers", {
			room: user.room,
			users: await getRoomUsers(user.roomId),
		});
	});
	socket.on("chatMessage", async (msg) => {
		const user = getCurrentUser(socket.id);

		io.to(user.roomId).emit("message", await chatMessage(user.roomId, user.username, msg));
	});
});

server.listen(8000 || process.env.PORT, () => {
	console.log("App is listening on Port 8000");
});


