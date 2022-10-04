var express = require("express");
const settingsController = require("../controllers/SettingsController");

var router = express.Router();
router.post('/addSettings', settingsController.createSettings)
router.get("/", settingsController.getSettings);
router.delete('/:id',settingsController.DeleteSettings)
router.put('/:id',settingsController.UpdateSettings)

module.exports = router;