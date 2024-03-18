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

const { FileRemote } = require("./controllers/file");
router.route("/api/request").post(FileRemote);

router.all("*", async (req, res) => {
  const html = `
  <html>
    <head>
      <title>zembed.xyz</title>
      <style>
        html,body{
          padding: 0;
          margin: 0;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          width: 100%;
          background: #000;
          color: #fff;
        }
        p{
          width: 100%;
          text-align: center;
          font-size: 2rem;
          padding: 0.25rem;
          line-height: 2.5rem;
        }
      </style>
    </head>
    <body>
      <p>Power by zembed.xyz</p>
    </body>
  </html>
  `;
  return res.status(200).end(html);
});

module.exports = router;
