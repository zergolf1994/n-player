exports.isReferrer = async (req, res, next) => {
  try {
    const referrer = req.get("Referrer");
    if (!referrer) throw new Error("");
    return next();
  } catch (error) {
    return res.status(404).end();
  }
};

exports.isIframe = async (req, res, next) => {
  try {
    //const isFromIframe = req.get("X-Frame-Options");
    const secFetchDest = req.get("Sec-Fetch-Dest");

    if (secFetchDest !== "iframe") throw new Error("Forbidden");
    return next();
  } catch (error) {
    return res.status(404).end();
  }
};
