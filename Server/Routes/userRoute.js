const express = require('express');
const { registerUser, loginUser, findUser, getUsers, deleteUser } = require("../Controllers/userControllers"); // Import deleteUser

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/find/:userId", findUser);
router.get("/", getUsers);
router.delete("/:userId", deleteUser); // Thêm route cho deleteUser

module.exports = router;