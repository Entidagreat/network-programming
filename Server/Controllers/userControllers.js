const userModel = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcrypt");
const chatModel = require("../Models/ChatModel");
const messageModel = require("../Models/messageModel");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const mongoose = require('mongoose'); // Import mongoose

console.log(process.env.CLOUDINARY_API_KEY);
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

if (!fs.existsSync('assets')) {
    fs.mkdirSync('assets');
}
// const user = { _id: new mongoose.Types.ObjectId() };
// console.log(user) // Tạo một ObjectId hợp lệ
// const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

// console.log('Token:', token);
const createToken = (_id) => {
    const jwtkey = process.env.JWT_SECRET_KEY;

    return jwt.sign({ _id }, jwtkey, { expiresIn: "3d" });
};

const storage = multer.memoryStorage({}); // Không cần lưu trữ file local

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/))   
 {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);   
   
  }
}); 

const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'home/avatar' },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        stream.end(file.buffer);
    });
};
const registerUser = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file); 

        const { name, email, password, role, friends, groups } = req.body;

        // Kiểm tra xem email đã tồn tại chưa
        let user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).json("Người dùng đã tồn tại!");
        }

        // Kiểm tra dữ liệu đầu vào
        if (!name || !email || !password) {
            return res.status(400).json("Vui lòng nhập đầy đủ thông tin");
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json("Email không hợp lệ");
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);
        let avatarUrl = null;
        if (req.file) {
          avatarUrl = await uploadToCloudinary(req.file); // Upload lên Cloudinary
        }
        // Tạo người dùng mới
        user = new userModel({ 
            name, 
            email, 
            password: hashedPassword, 
            role, 
            friends, 
            groups,
            avatar: avatarUrl // Lưu đường dẫn Cloudinary vào database
          });
      
          await user.save();
          const token = createToken(user._id);
      
          res.status(200).json({ 
            _id: user._id, 
            name, 
            email, 
            role, 
            token, 
            avatar: avatarUrl 
          });
      
        } catch (error) {
          console.error('Lỗi đăng ký:', error); 
          res.status(500).json("Lỗi server");
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

        res.status(200).json({ 
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            token: token,
            avatar: user.avatar // Thêm trường avatar 
        });    } catch (error) {
        console.log(error);
        res.status(500).json("lỗi server");
    }
};
const findUser = async (req, res) => {
    const userId = typeof req.params.userId === 'string' ? req.params.userId : null; 
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


// Function to update user's avatar
const updateUserAvatar = async (req, res) => {
    try {
      const userId = req.user._id; // Lấy ID người dùng từ middleware xác thực
      const avatarUrl = req.body.avatar; // Lấy URL avatar từ req.body
  
      // Kiểm tra xem URL avatar có hợp lệ không
      if (!avatarUrl || typeof avatarUrl !== 'string') {
        return res.status(400).json({ message: 'URL avatar không hợp lệ' });
      }
  
      // Cập nhật avatar của người dùng trong database
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { avatar: avatarUrl },
        { new: true } // Trả về document đã được cập nhật
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
  
      res.status(200).json(updatedUser); // Trả về thông tin người dùng đã cập nhật
    } catch (error) {
      console.error('Lỗi khi cập nhật avatar:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  };
  const changePassword = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy ID người dùng từ middleware xác thực
        const { oldPassword, newPassword } = req.body;

        // Kiểm tra xem người dùng có tồn tại không
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
        }

        // Mã hóa mật khẩu mới
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};


module.exports = { 
    registerUser, 
    loginUser, 
    findUser, 
    getUsers, 
    deleteUser, 
    searchUsersByName, 
    upload,
    uploadToCloudinary,
    updateUserAvatar,
    changePassword  // Export upload middleware
  };