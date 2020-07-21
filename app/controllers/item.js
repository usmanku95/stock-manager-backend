const { Item, validateItem } = require("../models/item");
const mongoose = require("mongoose");
//const validateItem = require("../models/item");
const { Log } = require("../models/log");

exports.create = async (req, res) => {
  try {
    //add validation please

    const { error } = validateItem(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let item = await Item.findOne({ name: req.body.name, active: true });
    if (item) return res.status(400).send("Item already exists.");

    item = new Item({
      name: req.body.name,
      quantity: req.body.quantity,
      updatedBy: req.body.updatedBy
    });

    item = await item.save();
    res.send(item);
    //creating a log now
    let log = new Log({
      name: req.body.name,
      quantity: req.body.quantity,
      updatedBy: req.body.updatedBy,
      action: "Item created."
    });

    log = await log.save();
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the item."
    });
  }
};
exports.findAll = async (req, res) => {
  try {
    // const items = await Item.find({ active: true })
    //   .sort("-createdAt")
    //   .populate({
    //     path: "updatedBy",
    //     select: "name"
    //   });

    // res.send(items);

    var size = parseInt(req.query.size);
    var pageNo = parseInt(req.query.pageNo);
    let filteredItems = await Item.aggregate([
      {
        $match: {
          name: new RegExp(
            req.query.filterName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),

            "i"
          ),
          active: true
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "updatedBy",
          foreignField: "_id",
          as: "updatedBy"
        }
      },
      { $unwind: "$updatedBy" },
      {
        $match: {
          "updatedBy.name": new RegExp(
            req.query.filterUserName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i"
          )
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    let totalCount = filteredItems.length; //--GEt total count here
    //pagination
    filteredItems = filteredItems.slice(
      size * (pageNo - 1),
      size * (pageNo - 1) + size
    );
    let totalPages = Math.ceil(totalCount / size);
    response = { error: false, message: filteredItems, pages: totalPages };
    res.send(response);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving items."
    });
  }
};
exports.findOne = async (req, res) => {
  try {
    let item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).send({
        message: "Item not found with id " + req.params.itemId
      });
    }
    res.send(item);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send({
        message: "Item not found with id " + req.params.itemId
      });
    }
    return res.status(500).send({
      message: "Error retrieving item with id " + req.params.itemId
    });
  }
};
exports.update = async (req, res) => {
  try {
    const { error } = validateItem(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let item = await Item.findByIdAndUpdate(req.params.itemId, {
      name: req.body.name,
      quantity: req.body.quantity,
      updatedBy: req.body.updatedBy
    });
    if (!item) {
      return res.status(404).send({
        message: "Item not found with id " + req.params.itemId
      });
    }
    res.send(item);

    //creating log
    let log = new Log({
      name: req.body.name,
      quantity: req.body.quantity,
      updatedBy: req.body.updatedBy,
      action: "Item updated."
    });

    log = await log.save();
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send({
        message: "Item not found with id " + req.params.itemId
      });
    }
    return res.status(500).send({
      message: "Error updating item with id " + req.params.itemId
    });
  }
};
exports.delete = async (req, res) => {
  try {
    let item = await Item.findByIdAndUpdate(req.params.itemId, {
      active: false
    });
    if (!item) {
      return res.status(404).send({
        message: "Item not found with id " + req.params.itemId
      });
    }
    res.send({ message: "Item deleted successfully" });
    //creating log
    let log = new Log({
      name: item.name,
      quantity: item.quantity,
      updatedBy: item.updatedBy,
      action: "Item deleted."
    });

    log = await log.save();
    //
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send({
        message: "Item not found with id " + req.params.itemId
      });
    }
    return res.status(500).send({
      message: "Error deleting item with id " + req.params.itemId
    });
  }
};
