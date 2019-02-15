const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');

module.exports = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).send({ error: 'No token provided' });
	}

	const parts = authHeader.split(' ');

	if (!parts.lenght === 2) {
		return res.status(401).send({ error: 'Invalid Token' });
	}

	const [scheme, token] = parts;

	if (scheme.indexOf('Bearer') === -1) {
		return res.status(401).send({ error: 'Token malformatted' });
	}

	jwt.verify(token, authConfig.secret, (err, decoded) => {
		if (err) {
			return res.status(401).send({ error: 'Incorrect Token' });
		}

		req.userId = decoded.id;
		return next();
	});
};
