const express=require('express');
const app=express();
const cors=require("cors");
app.use(cors());
const {Server}=require('socket.io');
const PORT=process.env.PORT || 3001;
const http = require("http");


const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methord:["GET","POST"],
    }
});

io.on("connection", (socket) => {
  
    console.log(`User Connected: ${socket.id}`);
  
    socket.on("join_room", (data) => {
      socket.join(data);
      console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });
  
    socket.on("send_message", (data) => {
      socket.to(data.room).emit("receive_message", data);
    });
  
    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
  });
  
  server.listen(PORT, () => {
    console.log(`SERVER RUNNING ${PORT}`);
  });
  