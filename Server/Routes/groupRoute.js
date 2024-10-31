const express = require('express');
const { createGroup, sendMessageToGroup, getUserGroups, addUserToGroup, getGroupMessages } = require('../Controllers/groupController');
const router = express.Router();

router.post('/create', createGroup);
router.post('/sendMessage', sendMessageToGroup);
router.get("/user/:userId", getUserGroups);
router.post('/addUser', addUserToGroup);
router.get('/:groupId/messages', getGroupMessages);
module.exports = router;