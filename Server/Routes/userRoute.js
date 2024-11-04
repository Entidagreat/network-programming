const express = require('express');
const { 
    registerUser, 
    loginUser, 
    findUser, 
    getUsers, 
    deleteUser, 
    searchUsersByName, 
    upload,
} = require("../Controllers/userControllers");

const router = express.Router();

router.post("/register", upload.single("image"), registerUser); // Thay "avatar" bằng "image"
router.post("/login", loginUser);
router.get("/find/:userId", findUser);
router.get("/", getUsers);
router.delete("/:userId", deleteUser);
router.get("/search", searchUsersByName); 

module.exports = router;