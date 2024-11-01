const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoute = require("./Routes/userRoute");
const chatRoute = require("./Routes/chatRoute");
const messageRoute = require("./Routes/messageRoute");
const groupRoute = require("./Routes/groupRoute");
const app = express();
require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use('/api/users', userRoute);
app.use('/api/chats', chatRoute);
app.use('/api/messages', messageRoute);
app.use('/api/groups', groupRoute);
const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;

app.get("/", (req, res) => {
    res.send("welcome to chat app apis..");
});

app.listen(port, (req, res) => {
    console.log(`Server is running on port..: ${port}`);
});

mongoose.connect(uri).then(() => console.log('MongoDB connected..'))
    .catch((error) => console.log("mongodb connection error", error.message));