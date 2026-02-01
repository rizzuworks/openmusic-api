const express = require('express');
const authenticationsHandler = require('../handlers/authenticationsHandler');

const router = express.Router();

router.post('/', authenticationsHandler.postAuthHandler);
router.put('/', authenticationsHandler.putAuthHandler);
router.delete('/', authenticationsHandler.deleteAuthHandler);

module.exports = router;
