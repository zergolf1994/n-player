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

module.exports = Domain = { Group };
