const express = require('express');
const { createGroup, sendMessageToGroup, getUserGroups, addUserToGroup,deleteGroup, getGroupMessages  } = require('../Controllers/groupController');
const router = express.Router();

router.post('/create', createGroup);
router.post('/sendMessage', sendMessageToGroup);
router.get("/user/:userId", getUserGroups);
router.post('/addUser', addUserToGroup);

router.delete('/delete/:groupId', deleteGroup);
router.get('/messages/:groupId', getGroupMessages);
module.exports = router;