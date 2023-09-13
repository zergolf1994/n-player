const { File, Domain } = require("../models");
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
      base_color: `#ff0000`,
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
      userToken: "test",
      jwplayer: {},
    };

    const row = await File.List.findOne({ slug }).select(`_id title`);
    if (!row?._id) return res.json({ error: true, msg: "ไม่พบไฟล์วิดีโอ" });

    data.title = row.title;
    data.jwplayer.sources = [
      {
        file: `//${host}/${row?._id}/_`,
        type: `application/vnd.apple.mpegurl`,
      },
    ];

    data.jwplayer.key = "W7zSm81+mmIsg7F+fyHRKhF3ggLkTqtGMhvI92kbqf/ysE99"; //ITWMv7t88JGzI0xPwW8I0+LveiXX9SWbfdmt0ArUSyc= //uoW6qHjBL3KNudxKVnwa3rt5LlTakbko9e6aQ6VUyKQ=
    data.jwplayer.width = "100%";
    data.jwplayer.height = "100%";
    data.jwplayer.preload = "metadata";
    data.jwplayer.primary = "html5";
    data.jwplayer.hlshtml = "true";
    data.jwplayer.controls = "true";
    data.jwplayer.pipIcon = "enabled";
    data.jwplayer.image = `//${host}/poster/${row?._id}.jpg`;

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
    /*
    data.jwplayer.advertising = {
      client: "vast",
      schedule: [
        {
          offset: "pre",
          tag: `//fc2jav.xyz/a5ru6rtjhrn7upohfpzv.xml`,
        },
      ],
    };
*/
    data.jwplayer.skin = {
      controlbar: {
        iconsActive: "#ff0000",
      },
      timeslider: {
        progress: "#ff0000",
      },
      menus: {
        background: "#121212",
        textActive: "#ff0000",
      },
    };

    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ error: true });
  }
};

exports.getEmbedV1 = async (req, res) => {
  try {
    const { slug } = req.params,
      host = req.get("host");
    //const secFetchSite = req?.headers["sec-fetch-site"] || "none";

    //if (["none", "cross-site"].includes(secFetchSite))
    //  return res.status(404).end();

    // const referer = Check.extractDomain(req?.headers?.referer);

    const domain = await Domain.Player.findOne({ domain: host });

    if (!domain?._id) return res.render("error", { msg: "ไม่พบโดเมนในระบบ" });

    if (!domain?.active)
      return res.render("error", { msg: "ยังไม่เปิดใช้งาน" });

    const row = await File.List.findOne({ slug }).select(`_id title`);

    if (!row?._id) return res.render("error", { msg: "ไม่พบไฟล์วิดีโอ" });
    const file_data = await File.Data.countDocuments({
      type: "video",
      fileId: row?._id,
      active: true,
    });

    if (!file_data)
      return res.render("error", { msg: "วิดีโอนี้กำลังประมวลผล" });

    const appearance = domain?.appearance[0] || {};

    let data = {
      title: `Player`,
      base_color: appearance?.BaseColor || `#ffffff`,
      slug,
      host,
      lang: "th",
      isContinue: appearance?.ContinuePlay || false,
      jwplayer: {
        key: "W7zSm81+mmIsg7F+fyHRKhF3ggLkTqtGMhvI92kbqf/ysE99",
        width: "100%",
        height: "100%",
        preload: "metadata",
        primary: "html5",
        hlshtml: "true",
        controls: "true",
        pipIcon: "true",
        autostart: appearance?.AutoPlay || false,
        mute: appearance?.Mute || false,
        repeat: appearance?.Repeat || false,
        image: appearance?.PosterLink
          ? appearance?.PosterLink
          : `//${host}/poster/${row?._id}.jpg`,
      },
    };
    data.jwplayer.sources = [
      {
        file: `//${host}/${row?._id}/_`,
        type: `application/vnd.apple.mpegurl`,
      },
    ];
    //ชื่อ
    if (appearance?.ShowTitle) {
      data.jwplayer.title = row?.title;
    }
    //สี
    if (data?.base_color) {
      data.jwplayer.skin = {
        controlbar: {
          iconsActive: data?.base_color,
        },
        timeslider: {
          progress: data?.base_color,
        },
        menus: {
          background: "#121212",
          textActive: data?.base_color,
        },
      };
    }
    //logo
    if (appearance?.LogoLink && appearance?.ShowLogo) {
      data.jwplayer.logo = {
        file: appearance?.LogoLink,
        link: appearance?.LogoHref,
        hide: "true",
        position: appearance?.LogoPosition,
      };
    }

    //พรีวิว
    if (appearance?.ShowPreview) {
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
    }

    if (domain?.advertActive) {
      data.jwplayer.advertising = {
        client: "vast",
        schedule: [
          {
            offset: "pre",
            tag: `//${host}/advert/${domain?._id}.xml`,
          },
        ],
      };
    }
    return res.render("jwplayer", data);
  } catch (err) {
    console.log(err);
    return res.render("error", { msg: "เกิดข้อมิดพลาดจากระบบ" });
  }
};
