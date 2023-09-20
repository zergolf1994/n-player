const { Domain, File } = require("../models");
const { Check, useCurl, Google, Generate } = require("../utils");

exports.FileRemote = async (req, res) => {
  try {
    let { title, source, token } = req.body;
    if (!source) return res.json({ status: false, msg: "ไม่พบแหล่งที่มา" });
    if (!token) return res.json({ status: false, msg: "ไม่พบ key token" });
    // check token
    let play = await Domain.Player.findOne({ accessToken: token });
    if (!play) return res.json({ status: false, msg: "ไม่พบข้อมูล" });
    if (!play?.active) return res.json({ status: false, msg: "ปิดใช้งาน" });
    if (play?.domain != req.get("host"))
      return res.json({ status: false, msg: "โดเมนไม่ถูกต้อง" });

    const Allow = Check.Allow(source);

    if (!Allow?.status)
      return res.json({ status: false, msg: "ไม่รองรับแหล่งที่มา" });

    //เช็คแหล่งที่มาในระบบ
    let where = {
      source: Allow?.source,
      type: Allow?.type,
      userId: play?.userId,
    };
    const exist = await File.List.findOne(where);
    if (exist?._id) {
      return res.json({
        status: "success",
        cache: true,
        embed_url: `https://${play?.domain}/embed/${exist?.slug}/`,
        slug: `${exist?.slug}`,
        title: `${exist?.title}`,
      });
    } else {
      let dataCreate = {};

      if (Allow?.type == "gdrive") {
        const GData = await Google.DriveSource(where);
        if (GData?.status == "ok") {
          dataCreate.title = title || GData?.title;
          dataCreate.source = Allow?.source;
          dataCreate.type = Allow?.type;
          dataCreate.mimeType = "video";
        } else {
          const GInfo = await Google.DriveInfo(where);
          if (GInfo?.title) {
            dataCreate.title = title || GInfo?.title;
            dataCreate.source = Allow?.source;
            dataCreate.type = Allow?.type;
            if (GInfo?.fileSize) dataCreate.size = GInfo?.fileSize;
            if (GInfo?.videoMediaMetadata) {
              if (
                GInfo?.videoMediaMetadata?.width &&
                GInfo?.videoMediaMetadata?.height
              ) {
                dataCreate.dimention = `${GInfo?.videoMediaMetadata?.width}X${GInfo?.videoMediaMetadata?.height}`;
              }
            }
          } else {
            return res.json({ error: true, msg: GData?.reason });
          }
        }
      } else if (Allow?.type == "direct") {
        const { statusCode, contentType } = await useCurl.getStatus(
          Allow?.source
        );
        if (!contentType.startsWith("video/")) {
          return res.json({ status: false, msg: "ไม่รองรับไฟล์นี้" });
        } else if (statusCode != 200) {
          return res.json({ status: false, msg: "ไม่สามารถเข้าถึงไฟล์ไฟล์" });
        }

        dataCreate.title = title || Allow?.title;
        dataCreate.source = Allow?.source;
        dataCreate.type = Allow?.type;
        dataCreate.mimeType = "video";
      }

      if (!Object?.keys(dataCreate)?.length)
        return res.json({ status: false, msg: "ไม่สามารถเข้าถึงไฟล์ไฟล์" });

      dataCreate.slug = await Generate.Slug();
      dataCreate.userId = play?.userId;

      let dbCreate = await File.List.create(dataCreate);

      if (dbCreate?._id) {
        return res.json({
          status: "success",
          embed_url: `https://${play?.domain}/embed/${dbCreate?.slug}/`,
          slug: `${dbCreate?.slug}`,
          title: `${dbCreate?.title}`,
        });
      } else {
        return res.json({ status: false, msg: `ลองอีกครั้ง` });
      }
    }
  } catch (err) {
    console.log(err);
    return res.json({ status: true });
  }
};
