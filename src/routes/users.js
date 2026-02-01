const express = require('express');
const usersHandler = require('../handlers/usersHandler');

const router = express.Router();

router.post('/', usersHandler.addUserHandler);

module.exports = router;
