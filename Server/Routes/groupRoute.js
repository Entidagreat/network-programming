const express = require('express');
const { createGroup, sendMessageToGroup, getUserGroups } = require('../Controllers/groupController');
const router = express.Router();

router.post('/create', createGroup);
router.post('/sendMessage', sendMessageToGroup);
router.get("/user/:userId", getUserGroups);

module.exports = router;