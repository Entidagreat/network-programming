const express = require('express');
const { registerUser, loginUser, findUser, getUsers, deleteUser, searchUsersByName } = require("../Controllers/userControllers"); // Import deleteUser

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/find/:userId", findUser);
router.get("/", getUsers);
router.delete("/:userId", deleteUser); // Thêm route cho deleteUser
router.get("/search", searchUsersByName); // Xóa khoảng trắng thừa trước searchUsersByName
module.exports = router;