const { File } = require("../models");
const { GetM3U8 } = require("../utils");
const request = require("request");

const os = require("os");

exports.getVtt = async (req, res) => {
  try {
    const { dataId } = req.params;
    let host = req.get("host");
    const rows = await File.Data.aggregate([
      { $match: { _id: dataId, active: true, type: "thumbnails" } },
      //server
      {
        $lookup: {
          from: "servers",
          localField: "serverId",
          foreignField: "_id",
          as: "servers",
          pipeline: [
            { $match: { type: "storage" } },
            {
              $project: {
                _id: 0,
                svIp: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          server: { $arrayElemAt: ["$servers", 0] },
        },
      },
      //files
      {
        $lookup: {
          from: "files",
          localField: "fileId",
          foreignField: "_id",
          as: "files",
          pipeline: [
            {
              $project: {
                _id: 0,
                slug: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          file: { $arrayElemAt: ["$files", 0] },
        },
      },
      {
        $set: {
          svIp: "$server.svIp",
          slug: "$file.slug",
          vttUrl: {
            $concat: [
              "http://",
              "$server.svIp",
              "/",
              "$file.slug",
              "/thumbnails.vtt",
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          svIp: 1,
          slug: 1,
          vttUrl: 1,
          m3u8Index: 1,
        },
      },
    ]);
    const row = rows?.at(0);
    if (!row?._id) return res.status(404).end();

    let contentVtt = await GetM3U8.getRequest(row?.vttUrl);

    const array = [],
      regex = /\.(webp|jpg)(?:#|$)/;

    for (const key in contentVtt) {
      if (Object.hasOwnProperty.call(contentVtt, key)) {
        const item = contentVtt[key];
        const match = item.match(regex);
        if (match) {
          const extension = `.${match[1]}`;
          const newText = item.replace(extension, `/${row?._id}` + extension).replace(/\s+/g, '').replace(/thumbnails\//g, '');
          array.push(`${newText}`);
        } else {
          array.push(item);
        }
      }
    }
    res.set("content-type", "text/vtt");
    return res.end(array.join(os.EOL));
  } catch (err) {
    console.log(err);
    return res.json({ error: true });
  }
};

exports.getImage = async (req, res) => {
  try {
    const { dataId } = req.params;
    let host = req.get("host");
    const rows = await File.Data.aggregate([
      { $match: { _id: dataId, active: true, type: "thumbnails" } },
      //server
      {
        $lookup: {
          from: "servers",
          localField: "serverId",
          foreignField: "_id",
          as: "servers",
          pipeline: [
            { $match: { type: "storage" } },
            {
              $project: {
                _id: 0,
                svIp: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          server: { $arrayElemAt: ["$servers", 0] },
        },
      },
      //files
      {
        $lookup: {
          from: "files",
          localField: "fileId",
          foreignField: "_id",
          as: "files",
          pipeline: [
            {
              $project: {
                _id: 0,
                slug: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          file: { $arrayElemAt: ["$files", 0] },
        },
      },
      {
        $set: {
          svIp: "$server.svIp",
          slug: "$file.slug",
          imgUrl: {
            $concat: [
              "http://",
              "$server.svIp",
              "/",
              "$file.slug",
              "/thumbnails.webp",
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          svIp: 1,
          slug: 1,
          imgUrl: 1,
        },
      },
    ]);
    const row = rows?.at(0);
    if (!row?._id) return res.status(404).end();

    request({ url: row?.imgUrl }, (err, resp, body) => {})
      .on("response", function (res) {
        res.headers["content-type"] = `image/webp`;
        res.headers["Cache-control"] = "public, max-age=31536000";
      })
      .on("data", function (chunk) {
        //console.log(chunk)
      })
      .pipe(res);
  } catch (err) {
    return res.json({ error: true });
  }
};
