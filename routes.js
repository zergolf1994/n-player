"use strict";
const express = require("express");
const router = express.Router();

const { getEmbed, getSource, getEmbedV1 } = require("./controllers/embed");
const { getIndex, getMaster } = require("./controllers/m3u8");

//router.route("/embed/:slug").get(getEmbed);
router.route("/embed/:slug").get(getEmbedV1);
router.route("/source/:slug").get(getSource);
router.route("/:fileId/_").get(getMaster);
router.route("/:videoId/0").get(getIndex);

const { getVtt, getImage } = require("./controllers/thumbnails");
router.route("/thumbnails/:dataId.vtt").get(getVtt);
router.route("/thumbnails/:dataId.(webp|jpg)").get(getImage);

const { getPoster } = require("./controllers/poster");
router.route("/poster/:fileId.(webp|jpg|png|gif)").get(getPoster);
const { getVast } = require("./controllers/vast");
router.route("/advert/:playerId.(xml)").get(getVast);

const { serverCreate } = require("./controllers/server");
router.get("/server/create", serverCreate);

router.all("*", async (req, res) => {
  return res.status(404).json({ error: true, msg: `link_not_found` });
});

module.exports = router;
