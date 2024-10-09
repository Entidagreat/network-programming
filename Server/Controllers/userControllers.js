const userModel = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const validator = require("validator");

// Hàm tạo token
const createToken = (_id) => {
    const jwtkey = process.env.JWT_SECRET_KEY;

    return jwt.sign({ _id }, jwtkey, { expiresIn: "3d" });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, friends, groups } = req.body;
        let user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).json("nguoi dung da ton tai");
        };
        if (!name || !email || !password) {
            return res.status(400).json("vui long nhap day du thong tin");
        };
        if (!validator.isEmail(email)) return res.status(400).json("email khong kha dung");
        if (!validator.isStrongPassword(password)) return res.status(400).json("mat khau ngan qua!");
        user = new userModel({ name, email, password, role, friends, groups });
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
        let user = await userModel.findOne({ email });
        if (!user) return res.status(400).json("email khong dung");
        if (password !== user.password) {
            return res.status(400).json("mat khau khong dung");
        }
        const token = createToken(user._id);
        res.status(200).json({ _id: user._id, name: user.name, email, token });
    } catch (error) {
        console.log(error);
        res.status(500).json("server error");
    }
};
const findUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await userModel.findById(userId);
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


module.exports = { registerUser, loginUser, findUser, getUsers };
