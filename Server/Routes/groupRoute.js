const express = require('express');
const { createGroup, sendMessageToGroup, getUserGroups, addUserToGroup } = require('../Controllers/groupController');
const router = express.Router();

router.post('/create', createGroup);
router.post('/sendMessage', sendMessageToGroup);
router.get("/user/:userId", getUserGroups);
router.post('/addUser', addUserToGroup);

module.exports = router;