/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const User = mongoose.model('User');

/**
 * Expose
 */

module.exports = new LocalStrategy(
  {
    usernameField: 'user[email]',
    passwordField: 'user[password]'
  },
  async function (email, password, done) {
    try {
      let user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false, { message: "The email address that you've entered doesn't match any account" });
      }
      if (!user.validatePassword(password)) {
        return done(null, false, { message: 'The password you entered is incorrect.' });
      }
      return done(null,user)
    } catch (err) {
      if (err) return done(err);
    }
  }
);
