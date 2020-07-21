"use strict";

/**
 * Module dependencies.
 */

const home = require("../app/controllers/home");
let auth = require("../app/controllers/auth");
let item = require("../app/controllers/item");
let order = require("../app/controllers/order");
let log = require("../app/controllers/log");

/**
 * Expose
 */

module.exports = function(app, passport) {
  auth = auth(app, passport);

  /**
   * Home routes
   */
  app.get("/", home.index);

  /**
   * auth routes
   */
  app.post("/api/auth/register", auth.register);

  app.post("/api/auth/login", auth.login);

  app.get(
    "/api/auth/current",
    passport.authenticate("jwt", { session: false }),
    auth.current
  );

  /**
   * items routes
   */
  app.post("/api/items", item.create);
  app.get("/api/items", item.findAll);
  app.get("/api/items/:itemId", item.findOne);
  app.put("/api/items/:itemId", item.update);
  app.delete("/api/items/:itemId", item.delete);

  /**
   * orders routes
   */
  app.post("/api/orders", order.create);
  app.get("/api/orders", order.findAll);
  app.get("/api/orders/:orderId", order.findOne);
  app.put("/api/orders/:orderId", order.update);
  app.delete("/api/orders/:orderId", order.delete);

  //logs routes
  app.get("/api/logs", log.findAll);

  /**
   * Error handling
   */

  app.use(function(err, req, res, next) {
    // treat as 404
    if (
      err.message &&
      (~err.message.indexOf("not found") ||
        ~err.message.indexOf("Cast to ObjectId failed"))
    ) {
      return next();
    }
    console.error(err.stack);
    // error page
    res.status(500).render("500", { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function(req, res) {
    res.status(404).render("404", {
      url: req.originalUrl,
      error: "Not found"
    });
  });
};
