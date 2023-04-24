import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import http from 'http';
import cors from "cors";
import { Server } from "socket.io";
import 'colors';
import connectDB from './utils/db.js';

import playerRoutes from './routes/playerRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import wordRoutes from './routes/wordRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const __dirname = path.resolve()
dotenv.config()
connectDB()

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://crypto-clash-client.vercel.app",
    methods: ["GET", "POST"],
  },
});

// Serve the build folder from the client
// app.use(express.static('client/build'));

// Parse JSON requests
app.use(express.json());

app.get('/', async (req, res) => {
  res.status(200).send('Crypto Clash Server is Running ...');
  res.end();
});

// API endpoint to generate random words
app.use('/api/words', wordRoutes);

// API endpoints for player management
app.use('/api/players', playerRoutes);

// API endpoints for room management
app.use('/api/rooms', roomRoutes);

// API endpoints for chat management
app.use('/api/chats', chatRoutes);


io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data.roomId);
    console.log(`User with ID: ${socket.id} joined room: ${data.roomId} team: ${data.team} player: ${data.player}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.roomId).emit("receive_message", data);
  });

  socket.on("room_action", (data) => {
    socket.to(data.roomId).emit("refresh", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

if (process.env.NODE_ENV == "production") {

  app.use(express.static(path.join(__dirname, '/client/build')))

  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html')))

}

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));
