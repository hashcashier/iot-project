var FacebookStrategy = require('passport-facebook').Strategy;

var configAuth = require('./auth');

module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});

	passport.use(new FacebookStrategy({
			clientID:		configAuth.facebookAuth.clientID,
			clientSecret:	configAuth.facebookAuth.clientSecret,
			callbackURL:	configAuth.facebookAuth.callbackURL
		},
		function(accessToken, refreshToken, profile, done) {
			process.nextTick(function () {
				return done(null, profile);
	    	});
		}
	))
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}