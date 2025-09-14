# Chat Real-Time Web

A real-time chat application built with React, Node.js and Socket.IO that allows users to chat online in real-time.

## 🚀 Technologies Used

### Frontend (Client)
- **React 18** - JavaScript library for building UI
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Bootstrap & React Bootstrap** - UI framework
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Input Emoji** - Emoji picker
- **Moment.js & Date-fns** - Date/time manipulation

### Backend (Server)
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **CORS** - Cross-Origin Resource Sharing

### Real-time (Socket)
- **Socket.IO** - WebSocket library for real-time communication

## 📁 Project Structure

```
network-programming/
├── client/          # Frontend React app
├── Server/          # Backend API server
├── Socket/          # Socket.IO server
└── README.md
```

## 🛠️ How to Run the Project

### Step 1: Install Server dependencies
```bash
cd Server
npm install
```

### Step 2: Install Socket dependencies
```bash
cd ../Socket
npm install
```

### Step 3: Install Client dependencies
```bash
cd ../client
npm install
```

### Step 4: Run the servers

#### 4.1 Start Database Server (MongoDB must be installed first)
```bash
# Make sure MongoDB is running on your machine
```

#### 4.2 Start Backend Server
```bash
cd Server
npm run dev
# or
npm start
```

#### 4.3 Start Socket Server
```bash
cd ../Socket
npm run dev
# or
npm start
```

#### 4.4 Start Frontend (Final step)
```bash
cd ../client
npm run dev
```

### 🎉 Access the Application
Open your browser and visit: `http://localhost:5173`

## ⚙️ Configuration

Make sure the following ports are not in conflict:
- **Client**: `5173` (Vite dev server)
- **Server**: `5000` (Backend API)
- **Socket**: `3000` (Socket.IO server)
- **MongoDB**: `27017` (Database)

## 📝 Features

- ✅ User Registration/Login
- ✅ Real-time 1-on-1 Chat
- ✅ Group Chat
- ✅ New message notifications
- ✅ Emoji picker
- ✅ Responsive design
- ✅ Multi-language support
- ✅ Dark/Light theme

## 🔧 System Requirements

- Node.js >= 16.x
- MongoDB >= 4.x
- npm or yarn

## 👥 Developed By

• Nguyễn Việt Dung  
• Nguyễn Hoàng Gia Huy  
• Phan Ngọc Thạch  
