/*!
 * Module dependencies
 */

const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;
const Joi = require("joi");

/**
 * Order schema
 */

const OrderSchema = new Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    clientName: { type: String, required: true },
    comments: { type: String },
    quantity: { type: Number },
    active: { type: Boolean, default: true },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
      // autopopulate: true
      // { select: "name" }
    },
    orderStatus: { type: String, default: "delievered" }
  },
  { timestamps: true }
);

// OrderSchema.plugin(require("mongoose-autopopulate"));

function validateOrder(order) {
  const schema = {
    itemId: Joi.string().required(),
    clientName: Joi.string().required(),
    comments: Joi.string().required(),
    updatedBy: Joi.string().required(),
    orderStatus: Joi.string(),

    orderQuantity: Joi.number()
      .min(0)
      .required()
  };
  return Joi.validate(order, schema);
}
/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * virtuals
 */
OrderSchema.set("toJSON", { getters: true, virtuals: true });

/**
 * Methods
 */
// OrderSchema.methods.setPassword = function(password) {
//   this.salt = crypto.randomBytes(16).toString('hex');
//   this.hashed_password = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
// };

/**
 * Statics
 */

OrderSchema.static({});

/**
 * Register
 */
const Order = mongoose.model("Order", OrderSchema);
exports.Order = Order;
exports.validateOrder = validateOrder;
