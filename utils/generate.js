"use strict";

const { File } = require("../models");

exports.Token = (length = 10) => {
  let result = "",
    characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

exports.Slug = async (length = 10) => {
  let result = "",
    characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  const exist = await File.List.findOne({ slug: result });
  if (exist?._id) return this.Token(20);

  return result;
};
exports.VastSecToHis = (duration = 0) => {
  try {
    // Hours, minutes and seconds
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    return ret;
  } catch (error) {
    return "00:00:00";
  }
};
