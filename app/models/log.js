/*!
 * Module dependencies
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Log schema
 */

const logSchema = new Schema({
  name: { type: String, default: "", required: true },
  quantity: { type: Number, default: 0 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String },
  createdAt: { type: Date, default: Date.now }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * virtuals
 */
logSchema.set("toJSON", { getters: true, virtuals: true });

/**
 * Methods
 */
// logSchema.methods.setPassword = function(password) {
//   this.salt = crypto.randomBytes(16).toString('hex');
//   this.hashed_password = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
// };

/**
 * Statics
 */

logSchema.static({});

/**
 * Register
 */
const Log = mongoose.model("Log", logSchema);
exports.Log = Log;
