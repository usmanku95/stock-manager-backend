const { Log } = require("../models/log");

exports.create = async (req, res) => {
  try {
    //add validation please
    let log = new Log({
      name: req.body.name,
      quantity: req.body.quantity,
      updatedBy: req.body.updatedBy
    });

    log = await log.save();
    res.send(log);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the log."
    });
  }
};
exports.findAll = async (req, res) => {
  try {
    var size = parseInt(req.query.size);
    var pageNo = parseInt(req.query.pageNo);

    // let datehere = new Date(req.query.startDate);
    // let date22 = new Date(req.query.endDate);
    // console.log(datehere, date22, "datehere");

    let filteredLogs = await Log.aggregate([
      {
        $match: {
          $and: [
            {
              name: new RegExp(
                req.query.filterName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
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
    let totalCount = filteredLogs.length; //--GEt total count here

    //pagination
    filteredLogs = filteredLogs.slice(
      size * (pageNo - 1),
      size * (pageNo - 1) + size
    );
    let totalPages = Math.ceil(totalCount / size);
    response = { error: false, message: filteredLogs, pages: totalPages };
    return res.send(response);
  } catch (err) {
    return res.status(500).send({
      message: err.message || "Some error occurred while retrieving items."
    });
  }
};
