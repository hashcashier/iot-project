var jwt = require('jsonwebtoken');

module.exports = function(app, express, passport) {
	var authRouter = express.Router();

	authRouter.get(
		'/facebook', 
		passport.authenticate(
			'facebook',
			{ scope: 'email,user_friends'}));

	authRouter.get('/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/app',
			failureRedirect : '/'
		}));

	authRouter.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return authRouter;
};