const User = require("../models/user");
const jwt = require("jsonwebtoken");

module.exports = (app, passport) => {
  const register = async (req, res, next) => {
    const {
      body: { user }
    } = req;

    if (!user.name) {
      return res.status(422).json({
        errors: {
          name: "is required"
        }
      });
    }
    if (!user.email) {
      return res.status(422).json({
        errors: {
          email: "is required"
        }
      });
    }

    if (!user.password) {
      return res.status(422).json({
        errors: {
          password: "is required"
        }
      });
    }
    let ifAlreadyExists = await User.findOne({ email: user.email });
    if (ifAlreadyExists) {
      return res.status(409).json({
        errors: {
          email: "already exists"
        }
      });
    }

    const finalUser = new User(user);
    finalUser.setPassword(user.password);

    return finalUser
      .save()
      .then(() => res.json({ user: finalUser.toAuthJSON() }));
  };

  const login = (req, res, next) => {
    const {
      body: { user }
    } = req;

    if (!user.email) {
      return res.status(422).json({
        errors: {
          email: "is required"
        }
      });
    }

    if (!user.password) {
      return res.status(422).json({
        errors: {
          password: "is required"
        }
      });
    }

    return passport.authenticate(
      "local",
      { session: false },
      (err, passportUser, info) => {
        if (err) {
          return next(err);
        }

        if (passportUser) {
          const user = passportUser;
          user.token = passportUser.generateJWT();

          return res.json({ user: user.toAuthJSON() });
        }

        return res.status(400).json(info);
      }
    )(req, res, next);
  };

  const current = async (req, res, next) => {
    try {
      return res.json({ user: req.user });
    } catch (err) {}
  };

  return {
    register,
    login,
    current
  };
};
