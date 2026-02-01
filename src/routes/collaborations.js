const express = require('express');
const collaborationsHandler = require('../handlers/collaborationsHandler');

const router = express.Router();

router.post('/', collaborationsHandler.addCollaborationHandler);
router.delete('/', collaborationsHandler.deleteCollaborationHandler);

module.exports = router;
