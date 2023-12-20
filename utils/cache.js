const path = require("path");
const fs = require("fs-extra");
const dayjs = require("dayjs");
const dirCache = ".cacher";

exports.getData = async (cacheItem, timeCache = 60) => {
  try {
    let cacheDir = path.join(global.dir, dirCache),
      cacheFile = path.join(cacheDir, `${cacheItem}`);

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    if (fs.existsSync(cacheFile)) {
      let { birthtime } = fs.statSync(cacheFile);
      const second = dayjs().diff(dayjs(birthtime), "second");

      if (second > timeCache) {
        await fs.unlinkSync(cacheFile);
        return { error: true };
      }
      const read = fs.readFileSync(cacheFile, "utf8");
      return { data: read };
    } else {
      return { error: true };
    }
  } catch (error) {
    return { error: true };
  }
};

exports.saveData = (cacheItem, data) => {
  try {
    let cacheDir = path.join(global.dir, dirCache),
      cacheFile = path.join(cacheDir, `${cacheItem}`);

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    console.log(`new-cache`, cacheItem);
    fs.writeFileSync(cacheFile, data, "utf8");
  } catch (error) {
    return { error: true };
  }
};

exports.saveVtt = (file, data) => {
  try {
    let cacheDir = path.join(global.dir, "public", "thumbnails"),
      cacheFile = path.join(cacheDir, `${file}`);

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    console.log(`Vtt-saved`, file);
    fs.writeFileSync(cacheFile, data, "utf8");
  } catch (error) {
    console.log(error);
    return { error: true };
  }
};

exports.saveThumbnails = (file, data) => {
  try {
    let cacheDir = path.join(global.dir, "public", "thumbnails"),
      cacheFile = path.join(cacheDir, `${file}`);

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    console.log(`thumbnails-saved`, file);
    fs.writeFileSync(cacheFile, data, "utf8");
  } catch (error) {
    return { error: true };
  }
};

exports.savePoster = (file, data) => {
  try {
    let cacheDir = path.join(global.dir, "public", "poster"),
      cacheFile = path.join(cacheDir, `${file}`);

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    console.log(`poster-saved`, file);
    fs.writeFileSync(cacheFile, data, "utf8");
  } catch (error) {
    return { error: true };
  }
};
