"use strict";
const path = require("path");
//const fs = require("fs-extra");
const os = require("os");

const { File, Domain } = require("../models");
const { GetM3U8 } = require("../utils");

exports.getMaster = async (req, res) => {
  try {
    const { fileId } = req.params;
    let host = req.get("host");
    //const secFetchSite = req?.headers["sec-fetch-site"] || "none";

    //if (["none", "cross-site"].includes(secFetchSite))
    //  return res.status(404).end();

    //const row = await File.Data.find({ type: "video", fileId });
    const rows = await File.Data.aggregate([
      { $match: { fileId, active: true, type: "video" } },
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
      //hlsCache
      {
        $lookup: {
          from: "file_hls_caches",
          localField: "_id",
          foreignField: "filedataId",
          as: "hls_caches",
          pipeline: [
            {
              $project: {
                _id: 0,
                contentMaster: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          hlsCache: { $arrayElemAt: ["$hls_caches", 0] },
        },
      },
      {
        $set: {
          svIp: "$server.svIp",
          slug: "$file.slug",
          m3u8Master: {
            $concat: [
              "http://",
              "$server.svIp",
              ":8889/hls/",
              "$file.slug",
              "/file_",
              "$$ROOT.name",
              ".mp4/master.m3u8",
            ],
          },
          /*m3u8Index: {
            $concat: [
              "http://",
              "$server.svIp",
              ":8889/hls/",
              "$file.slug",
              "/file_",
              "$$ROOT.name",
              ".mp4/index.m3u8",
            ],
          },*/
          m3u8Index: {
            $concat: ["//", host, "/", "$$ROOT._id", "/0"],
          },
          contentMaster: "$hlsCache.contentMaster",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          svIp: 1,
          slug: 1,
          m3u8Master: 1,
          m3u8Index: 1,
          contentMaster: 1,
          //contentIndex: 1,
        },
      },
    ]);

    if (!rows?.length) return res.status(404).end();

    let removeDefault = rows?.map((e) => e?.name).includes("360");
    let ArrayMaster = ["#EXTM3U"];
    for (const key in rows) {
      if (Object.hasOwnProperty.call(rows, key)) {
        const row = rows[key];
        if (removeDefault && row?.name == "default") continue;

        let contentMaster = row?.contentMaster || [];
        let m3u8Index = row?.m3u8Index;
        if (!contentMaster?.length) {
          let data = await GetM3U8.getRequest(row?.m3u8Master);
          if (!data?.length) return res.status(404).end();
          contentMaster = await GetM3U8.extractMaster(data);
          if (!contentMaster?.length) return res.status(404).end();
          // ค้นหาว่ามีฐานข้อมูลหรือยัง
          const exist = await File.HlsCache.findOne({
            filedataId: row?._id,
          }).select(`_id`);

          if (exist?._id) {
            //อัพเดต
            await File.HlsCache.findByIdAndUpdate(
              { _id: exist?._id },
              { contentMaster }
            );
          } else {
            //สร้างใหม่
            await File.HlsCache.create({ filedataId: row?._id, contentMaster });
          }

          /*await File.Data.findByIdAndUpdate(
            { _id: row?._id },
            { contentMaster }
          );*/
        }

        if (contentMaster.length > 0) {
          ArrayMaster.push(
            contentMaster
              .map((e) => {
                if (e.match(/RESOLUTION=(.*?)/gm)) {
                  if (isNaN(row?.name)) {
                    return e;
                  } else {
                    const match = e.match(
                      /RESOLUTION=([\w\-]{1,200})x([\w\-]{1,200})$/i
                    );
                    return `RESOLUTION=${match[1]}x${row?.name}`;
                  }
                } else {
                  return e;
                }
              })
              .join(",")
          );
          ArrayMaster.push(m3u8Index);
          ArrayMaster.push("");
        }
      }
    }

    if (ArrayMaster.length < 1) return res.status(404).end("1");
    res.set("content-type", "application/x-mpegURL");
    return res.end(ArrayMaster.join(os.EOL));
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
};

exports.getIndex = async (req, res) => {
  try {
    const { videoId } = req.params;

    const rows = await File.Data.aggregate([
      { $match: { _id: videoId, active: true } },
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
      //hlsCache
      {
        $lookup: {
          from: "file_hls_caches",
          localField: "_id",
          foreignField: "filedataId",
          as: "hls_caches",
          pipeline: [
            //domain-stream
            {
              $lookup: {
                from: "domain_streams",
                localField: "domainId",
                foreignField: "_id",
                as: "domain_streams",
                pipeline: [
                  {
                    $project: {
                      _id: 0,
                      lists: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                domain_stream: { $arrayElemAt: ["$domain_streams", 0] },
              },
            },
            {
              $project: {
                _id: 0,
                contentIndex: 1,
                domainId: 1,
                domain_stream: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          hlsCache: { $arrayElemAt: ["$hls_caches", 0] },
        },
      },
      {
        $set: {
          svIp: "$server.svIp",
          slug: "$file.slug",
          domain: {
            $ifNull: ["$hlsCache.domain_stream.lists", []],
          },
          m3u8Index: {
            $concat: [
              "http://",
              "$server.svIp",
              ":8889/hls/",
              "$file.slug",
              "/file_",
              "$$ROOT.name",
              ".mp4/index.m3u8",
            ],
          },
          contentIndex: "$hlsCache.contentIndex",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          svIp: 1,
          slug: 1,
          domain: 1,
          m3u8Index: 1,
          contentIndex: 1,
        },
      },
    ]);
    if (!rows?.at(0)) return res.status(404).end();

    const row = rows?.at(0);

    let contentIndex = row?.contentIndex || [];

    if (!contentIndex?.length) {
      let data = await GetM3U8.getRequest(row?.m3u8Index);
      if (!data?.length) return res.status(404).end();
      contentIndex = await GetM3U8.extractIndex(data);
      if (!contentIndex?.length) return res.status(404).end();

      // ค้นหาว่ามีฐานข้อมูลหรือยัง
      const exist = await File.HlsCache.findOne({
        filedataId: row?._id,
      }).select(`_id`);
      if (exist?._id) {
        //อัพเดต
        await File.HlsCache.findByIdAndUpdate(
          { _id: exist?._id },
          { contentIndex }
        );
      } else {
        //สร้างใหม่
        await File.HlsCache.create({ filedataId: row?._id, contentIndex });
      }
      //await File.Data.findByIdAndUpdate({ _id: row?._id }, { contentIndex });
    }

    if (!contentIndex.length) return res.status(404).end();

    let domain = row?.domain;

    if (!domain?.length) {
      //ค้นหา โดเมนสตรีม

      const getDoamin = await Domain.Group.findOne(
        {
          active: true,
          type: "hls",
        },
        null,
        { sort: { used: 1 } }
      ).select("_id lists title");

      if (!getDoamin?._id) return res.status(404).end("ไม่พบโดเมนสตรีม");

      domain = getDoamin?.lists;

      if (!domain?.length) return res.status(404).end("ไม่พบรายการโดเมนสตรีม");

      const updateDomainId = await File.HlsCache.updateOne(
        { filedataId: row?._id },
        { domainId: getDoamin?._id }
      );
      if (updateDomainId?.matchedCount) {
        // อัพเดตจำนวนที่ใช้งาน
        const countUsed = await File.HlsCache.countDocuments({
          domainId: getDoamin?._id,
        });
        
        await Domain.Group.findByIdAndUpdate(
          { _id: getDoamin?._id },
          { used: countUsed }
        );
      }
    }

    const array = [];
    let i = 0,
      e = domain?.length - 1;
    for (const key in contentIndex) {
      if (Object.hasOwnProperty.call(contentIndex, key)) {
        const item = contentIndex[key];
        if (isNaN(item)) {
          array.push(item);
        } else {
          array.push(`//${domain[i]}/${row?._id}/${item}.html`);

          if (i == e) {
            i = 0;
          } else {
            i++;
          }
        }
      }
    }

    res.set("content-type", "application/x-mpegURL");
    return res.end(array.join(os.EOL));
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
};
