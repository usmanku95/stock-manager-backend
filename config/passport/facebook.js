

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = mongoose.model('User');
require('dotenv').config();

/**
 * Expose
 */

module.exports = new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'emails', 'name', 'picture']
}, async (accessToken, refreshToken, profile, done) => {
    try {

        let user = await User.findOne({ 'facebookProvider.id': profile.id }).select('facebookProvider');
        if (user) {    //user found? update its access token 

            // user.facebookProvider.access_token = accessToken;
            // await user.save();
            return done(null, user);
            console.log('this account is already registered!')
        }

        //not found? create new user
        const email = profile.emails[0].value;
        const profilePic = profile.photos[0].value;
        const { id: facebook_id, displayName: name } = profile;
        user = await User.create({
            name,
            email,
            profilePic,
            facebookProvider: {
                id: facebook_id,
                access_token: accessToken
            }
        })
        await user.save();
        console.log(user)
        return done(null, user)
    } catch (error) {
        console.log(error);
        return done(error, false, error.message)
    }
});
