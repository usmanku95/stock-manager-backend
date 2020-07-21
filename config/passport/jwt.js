
var JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
opts.secretOrKey = process.env.SECRET;
// opts.issuer = 'accounts.examplesoft.com';
// opts.audience = 'yoursite.net';

module.exports = new JwtStrategy(opts,async function (jwt_payload, done) {
  try {
    let user = await User.findOne({ _id: jwt_payload.id });
    if (!user) {
      return done(null, false, { message: 'invalid token' });
    }
    return done(null, user)
  } catch (err) {
    if (err) return done(err);
  }

});



