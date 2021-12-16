import express  from "express";
import cors from "cors";
import {Server} from 'socket.io';
import * as http from 'http';
import router from "./Routes/Post.js";
import dotenv from "dotenv";
dotenv.config();
const PORT=process.env.PORT || 3001;
const ORGIN=process.env.orgin;
const app=express();
app.use(cors());


const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:ORGIN,
        methord:["GET","POST"],
    }
});

app.use(express.json());
app.use("/",router)



io.on("connection", (socket) => {
  
    // console.log(`User Connected: ${socket.id}`);
  
    socket.on("join_room", (data) => {
      socket.join(data);
      console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });
  
    socket.on("send_message", (data) => {
      
      socket.to(data.room).emit("receive_message", data);
    });
  
    socket.on("disconnect", () => {
      // console.log("User Disconnected", socket.id);
    });
  });
  
  server.listen(PORT, () => {
    console.log(`SERVER RUNNING ${PORT}`);
  });
  