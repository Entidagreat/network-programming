const userModel = require("../Models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

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
        if (!validator.isEmail(email)) return res.status(400).json("email khong kha dung 2");

        if (!validator.isStrongPassword(password)) return res.status(400).json("mat khau ngan qua m!!!");

        user = new userModel({ name, email, password, role, friends, groups });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        await user.save();
        const token = createToken(user._id);

        res.status(200).json({ _id: user._id, name, email, role, token });
    } catch (error) {
        console.log9(error);

        res.status(500).json("server error");
    }

};
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await userModel.findOne({ email });

        if (!user) return res.status(400).json("email khong dung");

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) return res.status(400).json("mat khau khong dung");
        const token = createToken(user._id);

        res.status(200).json({ _id: user._id, name: user.name, email, token });
    } catch (error) {

    }
};

module.exports = { registerUser, loginUser };