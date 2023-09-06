const { File } = require("../models");
const { Check } = require("../utils");
exports.getEmbed = async (req, res) => {
  try {
    const { slug } = req.params;
    //const secFetchSite = req?.headers["sec-fetch-site"] || "none";

    //if (["none", "cross-site"].includes(secFetchSite))
    //  return res.status(404).end();

    // const referer = Check.extractDomain(req?.headers?.referer);

    let data = {
      title: `Player`,
      base_color: `#ffffff`,
      slug,
      host: req.get("host"),
      lang: "th",
    };

    return res.render("player", data);
  } catch (err) {
    return res.json({ error: true });
  }
};

exports.getSource = async (req, res) => {
  try {
    const { slug } = req.params;
    let host = req.get("host");
    let data = {
      title: `test`,
      userToken: "test",
      jwplayer: {},
    };

    /*const row = await File.List.aggregate([
      { $match: { slug } },
      //file_data
      {
        $lookup: {
          from: "file_datas",
          localField: "_id",
          foreignField: "fileId",
          as: "video",
          pipeline: [
            { $match: { type: "video" } },
            //ตั้งค่า
            {
              $set: {
                file: {
                  $concat: ["//", host, "/", "$$ROOT._id", "/_"],
                },
                type: `application/vnd.apple.mpegurl`,
              },
            },
            {
              $project: {
                _id: 0,
                file: 1,
                type: 1,
              },
            },
          ],
        },
      },
      {
        $set: {
          sources: "$video",
        },
      },
      {
        $project: {
          _id: 0,
          sources: 1,
        },
      },
    ]);
    data.jwplayer = {
      ...row,
    };*/
    const row = await File.List.findOne({ slug }).select(`_id`);
    if (!row?._id) return res.json({ error: true, msg: "ไม่พบไฟล์วิดีโอ" });
    data.jwplayer.sources = [
      {
        file: `//${host}/${row?._id}/_`,
        type: `application/vnd.apple.mpegurl`,
      },
    ];
    data.jwplayer.key = "W7zSm81+mmIsg7F+fyHRKhF3ggLkTqtGMhvI92kbqf/ysE99"; //ITWMv7t88JGzI0xPwW8I0+LveiXX9SWbfdmt0ArUSyc=
    data.jwplayer.width = "100%";
    data.jwplayer.height = "100%";
    data.jwplayer.preload = "metadata";
    data.jwplayer.primary = "html5";
    data.jwplayer.hlshtml = "true";
    data.jwplayer.controls = "true";
    data.jwplayer.pipIcon = "enabled";

    const thumbnails = await File.Data.findOne({
      fileId: row?._id,
      type: "thumbnails",
    }).select(`_id`);

    if (thumbnails?._id) {
      data.jwplayer.tracks = [
        {
          file: `//${host}/thumbnails/${thumbnails?._id}.vtt`,
          kind: "thumbnails",
        },
      ];
    }

    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ error: true });
  }
};
