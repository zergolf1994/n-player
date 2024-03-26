"use strict";
const express = require("express");
const router = express.Router();

const { isIframe, isReferrer } = require("./middleware");

const { getEmbed, getSource, getEmbedV1 } = require("./controllers/embed");
const { getIndex, getMaster } = require("./controllers/m3u8");

//router.route("/embed/:slug").get(getEmbed);
router.route("/embed/:slug").get(isIframe, getEmbedV1);
router.route("/source/:slug").get(getSource);
router.route("/:fileId/_").get(isReferrer, getMaster);
router.route("/:videoId/0").get(isReferrer,getIndex);

const { getVtt, getImage } = require("./controllers/thumbnails");
router.route("/thumbnails/:dataId.vtt").get(getVtt);
router.route("/thumbnails/:dataId.(webp|jpg)").get(getImage);

const { getPoster } = require("./controllers/poster");
router.route("/poster/:fileId.(webp|jpg|png|gif)").get(getPoster);
const { getVast } = require("./controllers/vast");
router.route("/advert/:playerId.(xml)").get(getVast);

const { serverCreate } = require("./controllers/server");
router.get("/server/create", serverCreate);

const { FileRemote } = require("./controllers/file");
router.route("/api/request").post(FileRemote);

router.all("*", async (req, res) => {
  return res.status(500).end();
});

module.exports = router;
