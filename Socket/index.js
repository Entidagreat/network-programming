const { Server } = require("socket.io");
const messageModel = require("../Server/Models/messageModel"); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
require('dotenv').config({ path: '../server/.env' });

mongoose.connect(process.env.ATLAS_URI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('Lỗi kết nối MongoDB:', error);
});

db.once('open', () => {
  console.log('Kết nối MongoDB thành công.');
});

const io = new Server({
  cors: {
    origin: "http://localhost:5173", // Thay thế bằng origin của client của bạn
    methods: ["GET", "POST"]
  }
});

let onlineUsers = [];
const activeGroups = new Map();
const userGroups = new Map();

// Upload file to Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('File is undefined'));
      return;
    }

    const originalFilename = file.originalname || file.filename || 'default_filename.txt';

    // Determine resource type based on mimetype or extension
    let resourceType = 'auto';
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (file.mimetype && file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else {
      const ext = path.extname(originalFilename).toLowerCase();
      if (['.zip', '.rar', '.txt'].includes(ext)) {
        resourceType = 'raw';
      }
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'chat_files',
        resource_type: resourceType,
        public_id: originalFilename,
        overwrite: true,
        use_filename: false,
        unique_filename: false,
      },
      (error, result) => {
        if (error) {
          console.error("Lỗi khi upload lên Cloudinary:", error);
          reject(error);
        } else {
          console.log("Upload lên Cloudinary thành công:", result.secure_url);
          resolve(result);
        }
      }
    );
    const buffer = Buffer.from(file.buffer);
    stream.end(buffer);
  });
};

io.on("connection", (socket) => {
  console.log("Kết nối mới:", socket.id);

  socket.on("addNewUser", (userId) => {
    if (!userId) return;
    socket.userId = userId;
    console.log(`Đã gán userId ${userId} cho socket ${socket.id}`);

    const existingUserIndex = onlineUsers.findIndex(user => user.userId === userId);
    if (existingUserIndex !== -1) {
      onlineUsers[existingUserIndex].socketId = socket.id;
    } else {
      onlineUsers.push({
        userId,
        socketId: socket.id,
      });
    }

    const userGroupIds = userGroups.get(userId) || [];
    userGroupIds.forEach(groupId => {
      socket.join(`group_${groupId}`);
      if (!activeGroups.has(groupId)) {
        activeGroups.set(groupId, new Set());
      }
      activeGroups.get(groupId).add(socket.id);

      socket.to(`group_${groupId}`).emit("userJoinedGroup", {
        groupId,
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    io.emit("getOnlineUsers", onlineUsers);
  });

  socket.on("joinGroup", (groupId) => {
    if (!groupId || !socket.userId) return;

    const roomId = `group_${groupId}`;
    socket.join(roomId);

    if (!activeGroups.has(groupId)) {
      activeGroups.set(groupId, new Set());
    }
    activeGroups.get(groupId).add(socket.id);

    if (!userGroups.has(socket.userId)) {
      userGroups.set(socket.userId, new Set());
    }
    userGroups.get(socket.userId).add(groupId);

    console.log(`Người dùng ${socket.userId} (${socket.id}) đã tham gia nhóm ${groupId}`);
    console.log("activeGroups:", activeGroups);
    console.log("userGroups:", userGroups);
    console.log("io.sockets.adapter.rooms:", io.sockets.adapter.rooms);

    socket.to(roomId).emit("userJoinedGroup", {
      groupId,
      userId: socket.userId,
      timestamp: new Date()
    });
  });

  socket.on("leaveGroup", (groupId) => {
    if (!groupId || !socket.userId) return;

    const roomId = `group_${groupId}`;
    socket.leave(roomId);

    if (activeGroups.has(groupId)) {
      activeGroups.get(groupId).delete(socket.id);
    }
    if (userGroups.has(socket.userId)) {
      userGroups.get(socket.userId).delete(groupId);
    }

    console.log(`Người dùng ${socket.userId} (${socket.id}) đã rời khỏi nhóm ${groupId}`);
    console.log("activeGroups:", activeGroups);
    console.log("userGroups:", userGroups);
    console.log("io.sockets.adapter.rooms:", io.sockets.adapter.rooms);
  });

  // Handle 1-1 messages
  socket.on("sendMessage", (message) => {
    const user = onlineUsers.find(user => user.userId === message.recipientId);
    if (user) {
      io.to(user.socketId).emit("getMessage", message);
      io.to(user.socketId).emit("getNotification", {
        senderId: message.senderId,
        isRead: false,
        date: new Date(),
      });
    }
  });

  socket.on("sendGroupMessage", async (message) => {
    if (!message.groupId || !socket.userId) return;

    const roomId = `group_${message.groupId}`;
    const timestamp = new Date();
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const enhancedMessage = {
      ...message,
      messageId,
      timestamp,
      senderSocketId: socket.id
    };

    try {
      io.in(roomId).emit("getGroupMessage", enhancedMessage);

      socket.emit("messageDelivered", {
        messageId,
        groupId: message.groupId,
        status: "sent",
        timestamp
      });

      socket.to(roomId).emit("getNotification", {
        senderId: message.senderId,
        groupId: message.groupId,
        messageId,
        isRead: false,
        date: timestamp,
        type: 'group'
      });

      const recipientCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      console.log(`Tin nhắn nhóm đã được gửi đến phòng ${roomId}`, {
        messageId,
        senderId: message.senderId,
        recipientCount
      });
      console.log("activeGroups:", activeGroups);
      console.log("io.sockets.adapter.rooms:", io.sockets.adapter.rooms);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn nhóm:", error);
      socket.emit("messageError", {
        messageId,
        error: "Không thể gửi tin nhắn",
        timestamp
      });
    }
  });

  socket.on("messageReceived", ({ messageId, groupId }) => {
    if (!messageId || !groupId) return;

    const roomId = `group_${groupId}`;
    io.in(roomId).emit("messageDeliveryStatus", {
      messageId,
      receivedBy: socket.id,
      userId: socket.userId,
      timestamp: new Date()
    });
  });

  // Send file
  socket.on("sendFile", async (data, callback) => {
    try {
        console.log("Dữ liệu nhận được từ client:", data);

        const { recipientId, groupId, chatId, file } = data;

        // Validate required fields
        if (!chatId) throw new Error('Missing chatId');
        if (!socket.userId) throw new Error('Missing socket.userId');

        const senderId = groupId || socket.userId;

        if (!senderId) throw new Error('Missing senderId');
        if (!file) throw new Error('Missing file');

        // Perform file upload to Cloudinary
        console.log("Trước khi upload lên Cloudinary");
        const uploadResult = await uploadToCloudinary(file);
        console.log("Sau khi upload lên Cloudinary:", uploadResult);

        // Kiểm tra nếu uploadResult có đầy đủ thông tin cần thiết
        if (!uploadResult || !uploadResult.original_filename || !uploadResult.secure_url) {
            throw new Error('Upload file failed: missing data from Cloudinary');
        }

        console.log("Trước khi insert vào MongoDB");

        // Thực hiện insert trực tiếp vào MongoDB bằng phương thức insertOne
        const newMessage = {
            chatId: chatId.toString(),
            senderId: senderId.toString(),
            file: {
                filename: uploadResult.original_filename,
                url: uploadResult.secure_url,
                mimetype: `${uploadResult.resource_type}/${path.extname(uploadResult.original_filename).substring(1)}`
            },
            groupId: groupId ? groupId.toString() : null,
            timestamp: new Date()
        };

        // Sử dụng MongoDB's insertOne()
        const result = await mongoose.connection.collection('messages').insertOne(newMessage);

        console.log("Kết quả insert:", result);

        const insertedId = result.insertedId;
        const messageData = {
            senderId: socket.userId,
            file: newMessage.file,
            timestamp: newMessage.timestamp,
            _id: insertedId
        };

        if (groupId) {
            io.to(`group_${groupId}`).emit("newFile", messageData);
        } else if (recipientId) {
            io.to(recipientId).emit("newFile", messageData);
        }

        callback({ status: "sent", timestamp: new Date() });
    } catch (error) {
        console.error('Lỗi khi gửi file:', error);

        callback({
            error: error.toString(),
            timestamp: new Date()
        });
    }
});



  socket.on("disconnect", () => {
    console.log(`Người dùng ngắt kết nối: ${socket.id}`);

    onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);

    activeGroups.forEach((members) => {
      members.delete(socket.id);
    });

    io.emit("getOnlineUsers", onlineUsers);

    console.log("activeGroups:", activeGroups);
    console.log("userGroups:", userGroups);
    console.log("io.sockets.adapter.rooms:", io.sockets.adapter.rooms);
  });
});

io.on("error", (error) => {
  console.error("Lỗi Socket.IO:", error);
});

setInterval(() => {
  activeGroups.forEach((members, groupId) => {
    if (members.size === 0) {
      activeGroups.delete(groupId);
    }
  });

  userGroups.forEach((groups, userId) => {
    const isUserOnline = onlineUsers.some(user => user.userId === userId);
    if (!isUserOnline && groups.size === 0) {
      userGroups.delete(userId);
    }
  });
}, 60000);

io.listen(3000);
module.exports = io;