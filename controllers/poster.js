const { File } = require("../models");
const request = require("request");
const { Cacher } = require("../utils");

exports.getPoster = async (req, res) => {
  try {
    const { fileId } = req.params;

    const rows = await File.List.aggregate([
      { $match: { _id: fileId } },
      //file_data
      {
        $lookup: {
          from: "file_datas",
          localField: "_id",
          foreignField: "fileId",
          as: "videos",
          pipeline: [
            {
              $match: {
                type: "video",
                name: { $in: ["360", "480", "720", "1080", "default"] },
              },
            },
            { $sort: { name: 1 } },
            { $limit: 1 },
            {
              $lookup: {
                from: "servers",
                localField: "serverId",
                foreignField: "_id",
                as: "servers",
                pipeline: [
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
            //ตั้งค่า
            {
              $set: {
                host: {
                  $concat: ["http://", "$server.svIp", ":8889/"],
                },
                file_name: {
                  $concat: ["file_", "$name", ".mp4"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                host: 1,
                file_name: 1,
              },
            },
          ],
        },
      },
      //
      {
        $addFields: {
          video: { $arrayElemAt: ["$videos", 0] },
        },
      },
      {
        $set: {
          posterUrl: {
            $concat: [
              "$video.host",
              "thumb/",
              "$$ROOT.slug",
              "/",
              "$video.file_name",
            ],
          },
        },
      },

      {
        $project: {
          _id: 0,
          posterUrl: 1,
          duration: 1,
        },
      },
    ]);
    const row = rows?.at(0);
    let url = row?.posterUrl;
    if (!row?.duration) url += "/thumb-1000-w600.jpg";
    else url += `/thumb-${Math.floor(row?.duration / 2) * 1000}-w600.jpg`;

    let buffers = [];
    let length = 0;
    request({ url }, (err, resp, body) => {})
      .on("response", function (res) {
        res.headers["content-type"] = `image/jpg`;
        res.headers["Cache-control"] = "public, max-age=3600";
      })
      .on("data", function (chunk) {
        length += chunk.length;
        buffers.push(chunk);
      })
      .on("end", async function () {
        if (res?.statusCode == 200) {
          let data = Buffer.concat(buffers);
          await Cacher.savePoster(`${fileId}.jpg`, data);
        }
      })
      .pipe(res);
  } catch (err) {
    console.log(err);
    return res.end();
  }
};
