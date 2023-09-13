const uuid = require("uuid");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { Mixed } = mongoose.Schema.Types;

const Group = mongoose.model(
  "domain_stream",
  new Schema(
    {
      _id: { type: String, default: () => uuid.v4() },
      active: { type: Boolean, default: true },
      type: { type: String },
      title: { type: String },
      lists: { type: Mixed, default: [] },
      used: { type: Mixed, default: 0 },
      userId: { type: String },
    },
    {
      timestamps: true,
    }
  )
);
const Player = mongoose.model(
  "domain_player",
  new Schema(
    {
      _id: { type: String, default: () => uuid.v4() },
      domain: { type: String, required: true },
      active: { type: Boolean, default: false },
      advertActive: { type: Boolean, default: false },
      setDefault: { type: Boolean, default: false },
      advert: { type: Mixed, default: [] },
      appearance: { type: Mixed, default: [] },
      accessToken: { type: String, required: true },
      userId: { type: String, required: true },
    },
    {
      timestamps: true,
    }
  )
);
module.exports = Domain = { Group, Player };
