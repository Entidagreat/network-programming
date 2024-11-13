const { Server } = require("socket.io");

const io = new Server({
    cors: {
        origin: "http://localhost:5173", // Thay đổi thành URL client của bạn
        methods: ["GET", "POST"]
    }
});

let onlineUsers = [];
const activeGroups = new Map();
const userGroups = new Map();

io.on("connection", (socket) => {
    console.log("Kết nối mới:", socket.id);

    socket.on("addNewUser", (userId) => {
        if (!userId) return;

        const existingUserIndex = onlineUsers.findIndex(user => user.userId === userId);
        if (existingUserIndex !== -1) {
            onlineUsers[existingUserIndex].socketId = socket.id;
        } else {
            onlineUsers.push({
                userId,
                socketId: socket.id,
            });
        }

        socket.userId = userId;

        const userGroupIds = userGroups.get(userId) || [];
        userGroupIds.forEach(groupId => {
            socket.join(`group_${groupId}`);
            if (!activeGroups.has(groupId)) {
                activeGroups.set(groupId, new Set());
            }
            activeGroups.get(groupId).add(socket.id);

            // Thông báo cho các thành viên khác trong nhóm rằng người dùng đã tham gia lại
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

    // Xử lý tin nhắn 1-1
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
            io.in(roomId).emit("getGroupMessage", message);

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
                type: 'group' // Add message type
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

    socket.on("disconnect", () => {
        console.log(`Người dùng ngắt kết nối: ${socket.id}`);

        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);

        activeGroups.forEach((members, groupId) => {
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