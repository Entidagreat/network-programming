const userModel = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcrypt");
const chatModel = require("../Models/ChatModel");
const messageModel = require("../Models/messageModel");
const createToken = (_id) => {
    const jwtkey = process.env.JWT_SECRET_KEY;

    return jwt.sign({ _id }, jwtkey, { expiresIn: "3d" });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, friends, groups } = req.body;
        let user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).json("Người dùng đã tồn tại!");
        };
        if (!name || !email || !password) {
            return res.status(400).json("Vui lòng nhập đầy đủ email và password");
        };
        if (!validator.isEmail(email)) return res.status(400).json("Email không khả dụng!");

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        user = new userModel({ name, email, password: hashedPassword, role, friends, groups });
        await user.save();
        const token = createToken(user._id);
        res.status(200).json({ _id: user._id, name, email, role, token });
    } catch (error) {
        console.log(error);
        res.status(500).json("server error");
    }
};
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email) {
            return res.status(400).json("Email chưa được nhập");
        }
        if (!password) {
            return res.status(400).json("Mật khẩu chưa được nhập");
        }

        let user = await userModel.findOne({ email });

        if (!user) return res.status(400).json("email hoặc mật khẩu không đúng");

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json("email hoặc mật khẩu không đúng");

        const token = createToken(user._id);
        
        res.status(200).json({ _id: user._id, name: user.name, email, token });
    } catch (error) {
        console.log(error);
        res.status(500).json("lỗi server");
    }
};
const findUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await userModel.findById(userId);

        if (!user) {
            // Trả về lỗi 404 nếu không tìm thấy user
            return res.status(404).json({ error: "Không tìm thấy người dùng" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json("server error");
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json("server error");
    }
};

const deleteUser = async (req, res) => { // Thêm hàm deleteUser
    try {
        const userId = req.params.userId;
        // Xóa người dùng
        await userModel.findByIdAndDelete(userId);
        // Xóa các cuộc trò chuyện liên quan
        await chatModel.deleteMany({ members: { $in: [userId] } });
        // Xóa các tin nhắn liên quan
        await messageModel.deleteMany({ senderId: userId });
        res.status(200).json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
const searchUsersByName = async (req, res) => {
    try {
        const name = req.query.name;
        if (!name) {
            return res.status(400).json({ message: 'Vui lòng cung cấp tên người dùng' });
        }
        console.log('Tìm kiếm người dùng theo tên:', name);

        const escapedName = escapeRegExp(name); // Escape các ký tự đặc biệt

        const users = await userModel.find({ name: { $regex: new RegExp(escapedName, 'i') } });

        console.log('Kết quả tìm kiếm:', users);
        res.status(200).json(users);
    } catch (error) {
        console.error('Lỗi khi tìm kiếm người dùng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = { registerUser, loginUser, findUser, getUsers, deleteUser, searchUsersByName, escapeRegExp };
