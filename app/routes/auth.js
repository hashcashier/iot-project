var jwt = require('jsonwebtoken');
var User = require('../models/user');

module.exports = function(app, express) {
	var authRouter = express.Router();

	authRouter.post('/login', function(req, res) {
		User.findOne({username: req.body.username}).select('username password').exec(function(err, user) {
			if (err) {
				throw err;
			}
			if (!user || !user.comparePassword(req.body.password)) {
				res.json({success: false})
			} else {
				var token = jwt.sign({username: user.username}, app.get('config').secret, {expiresInMinutes: 1440});
				res.json({success: true, token: token});
			}
		})
	});

	authRouter.post('/register', function(req, res) {
		var user = new User();

		user.username = req.body.username;
		user.password = req.body.password;

		user.save(function(err) {
			if (err) {
				// duplicate 
				if (err.code == 11000)
					return res.json({ success: false, message: 'A user with that username already exists. '});
				else
					return res.send(err);
			}
			res.json({ message: 'User created!' });
		});
	});

	authRouter.get('/logout', function(req, res) {
		//req.logout();
		//res.redirect('/');
	});

	return authRouter;
};
