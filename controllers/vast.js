const { Generate } = require("../utils");

exports.getVast = async (req, res) => {
  try {
    const { playerId } = req.params;

    const rows = await Domain.Player.findOne({ _id: playerId }).select(
      `advert`
    );
    let data = {};
    data.rows = rows.advert.map((row) => {
      const out = {
        ...row,
      };
      out.skip = Generate.VastSecToHis(row.skip)
      return out;
    }) || [];
    res.type("xml");
    return res.render("vast", data);
  } catch (err) {
    console.log(err);
    return res.status(404).end();
  }
};
