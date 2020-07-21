const { Order, validateOrder } = require("../models/order");
const { Item } = require("../models/item");
const { Log } = require("../models/log");

const mongoose = require("mongoose");

exports.create = async (req, res) => {
  try {
    //add validation please

    const { error } = validateOrder(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let order = new Order({
      item: req.body.itemId,
      clientName: req.body.clientName,
      comments: req.body.comments,
      quantity: req.body.orderQuantity,
      updatedBy: req.body.updatedBy
    });

    let itemAvailability = await checkStockAvailability(
      req.body.itemId,
      req.body.orderQuantity
    );
    if (itemAvailability == null) {
      return res.status(404).send({
        message: "Item not found with id " + req.params.itemId
      });
    }
    if (itemAvailability == false) {
      return res.status(400).send({
        message: "Stock is empty "
      });
    }

    order = await order.save();
    // subtracting orderQuantity from item.quantity in checkStockAvailability() function

    res.send(order);

    //making log now
    let itemForLog = await Item.findById(req.body.itemId);

    let log = new Log({
      name: itemForLog.name,
      quantity: req.body.orderQuantity,
      updatedBy: req.body.updatedBy,
      action: "Item ordered."
    });

    log = await log.save();
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the order."
    });
  }
};
exports.findAll = async (req, res) => {
  try {
    var size = parseInt(req.query.size);
    var pageNo = parseInt(req.query.pageNo);
    let filteredOrders = await Order.aggregate([
      {
        $match: {
          $and: [
            {
              clientName: new RegExp(
                req.query.filterClient.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
              )
            },
            {
              orderStatus: new RegExp(
                req.query.filterStatus.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
              )
            },
            {
              createdAt: {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: "items",
          localField: "item",
          foreignField: "_id",
          as: "item"
        }
      },

      { $unwind: "$item" },

      {
        $match: {
          "item.name": new RegExp(
            req.query.filterName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i"
          )
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "updatedBy",
          foreignField: "_id",
          as: "updatedBy"
        }
      },
      { $unwind: "$updatedBy" }
    ]);
    let totalCount = filteredOrders.length; //--GEt total count here
    //pagination
    filteredOrders = filteredOrders.slice(
      size * (pageNo - 1),
      size * (pageNo - 1) + size
    );
    let totalPages = Math.ceil(totalCount / size);
    response = { error: false, message: filteredOrders, pages: totalPages };
    return res.send(response);
  } catch (err) {
    return res.status(500).send({
      message: err.message || "Some error occurred while retrieving orders."
    });
  }
};

exports.findOne = async (req, res) => {
  try {
    let order = await Order.findById(req.params.orderId).populate("item");
    if (!order) {
      return res.status(404).send({
        message: "Order not found with id " + req.params.orderId
      });
    }
    res.send(order);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send({
        message: "Order not found with id " + req.params.orderId
      });
    }
    return res.status(500).send({
      message: "Error retrieving order with id " + req.params.orderId
    });
  }
};
exports.update = async (req, res) => {
  try {
    var orderForUpdate = await Order.findByIdAndUpdate(req.params.orderId, {
      orderStatus: req.body.orderStatus
    });

    if (!orderForUpdate) {
      return res.status(404).send({
        message: "Order not found with id " + req.params.orderId
      });
    }

    if (req.body.orderStatus === "cancelled") {
      //add order quantity to item quantity

      let item2 = await Item.findByIdAndUpdate(orderForUpdate.item, {
        $inc: { quantity: orderForUpdate.quantity }
      });

      let order2 = await Order.findByIdAndUpdate(req.params.orderId, {
        active: false
      });
    }

    console.log(req.body, "req body");

    //Creating log now

    console.log(orderForUpdate, "order for update");

    let itemForLog = await Item.findById(orderForUpdate.item);
    console.log(itemForLog, "item for log");

    let log = new Log({
      name: itemForLog.name,
      quantity: orderForUpdate.quantity,
      updatedBy: req.body.updatedBy,
      action: `Order ${req.body.orderStatus}.`
    });

    log = await log.save();

    ///

    res.send(orderForUpdate);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send({
        message: "Order not found with id " + req.params.orderId
      });
    }
    return res.status(500).send({
      message: "Error updating order with id " + req.params.orderId
    });
  }
};
exports.delete = async (req, res) => {
  try {
    let order = Order.findByIdAndUpdate(req.params.orderId, {
      active: false
    });
    if (!order) {
      return res.status(404).send({
        message: "Order not found with id " + req.params.orderId
      });
    }
    res.send({ message: "Order deleted successfully" });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send({
        message: "Order not found with id " + req.params.orderId
      });
    }
    return res.status(500).send({
      message: "Error deleting order with id " + req.params.orderId
    });
  }
};

checkStockAvailability = async (itemId, quantity) => {
  let item = await Item.findById(itemId);
  if (!item) {
    return null;
  }
  if (item.quantity - quantity < 0) {
    return false;
  }
  // subtracting orderQuantity from item.quantity
  item.quantity = item.quantity - quantity;
  await item.save();
  return true;
};
