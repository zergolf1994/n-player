"use strict";
const express = require("express");
const router = express.Router();

const { getEmbed, getSource } = require("./controllers/embed");
const { getIndex, getMaster } = require("./controllers/m3u8");

router.route("/embed/:slug").get(getEmbed);
router.route("/source/:slug").get(getSource);
router.route("/:fileId/_").get(getMaster);
router.route("/:videoId/0").get(getIndex);
//router.route("/install/:server/:name").get(setupInstall);

router.all("*", async (req, res) => {
  return res.status(404).json({ error: true, msg: `link_not_found` });
});

module.exports = router;
