const express = require('express');
const { 
    registerUser, 
    loginUser, 
    findUser, 
    getUsers, 
    deleteUser, 
    searchUsersByName, 
    uploadToCloudinary,
    updateUserAvatar 
} = require("../Controllers/userControllers");
const authMiddleware = require('../authMiddleware');

const router = express.Router();
const multer = require('multer');

// Cấu hình multer để lưu trữ file trong bộ nhớ
const storage = multer.memoryStorage(); 
const upload = multer({ 
    storage: storage,
    // ... (các cấu hình khác) ...
});

router.post("/register", upload.single("image"), registerUser);
router.post("/login", loginUser);
router.get("/find/:userId", findUser);
router.get("/", getUsers);
router.delete("/:userId", deleteUser);
router.get("/search", searchUsersByName); 

router.put('/update-avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarUrl = await uploadToCloudinary(req.file);
    req.body.avatar = avatarUrl; // Gán avatarUrl cho req.body.avatar
    await updateUserAvatar(req, res); // Gọi hàm updateUserAvatar với req và res
  } catch (error) {
    console.error('Error handling avatar update:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;