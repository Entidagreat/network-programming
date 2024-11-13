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
const upload = multer({ dest: 'uploads/' });

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
      const updatedUser = await updateUserAvatar(req.user._id, avatarUrl);

      res.status(200).json({
          message: 'Avatar updated successfully',
          user: updatedUser
      });
  } catch (error) {
      console.error('Error handling avatar update:', error);
      res.status(500).json({ message: error.message });
  }
});




module.exports = router;