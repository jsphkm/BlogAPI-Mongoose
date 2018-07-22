const express = require("express");
const router = express.Router();

const {Author, BlogPost} = require("./models");

router.get("/", (req, res) => {
	Author
		.find()
		.then(authors => {
				res.json(authors.map(author => {
					return {
						id: author._id,
						name: `${author.firstName} ${author.lastName}`,
						userName: author.userName
					};
				}));
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({error: "something went wrong"});
		});
});

router.post("/", (req, res) => {
	const requiredFields = ["firstName", "lastName", "userName"];
	requiredFields.forEach(field => {
		if (!(field in req.body)) {
			const message = `Missing ${field} in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	});

	Author
		.findOne({userName: req.body.userName})
		.then(author => {
			if (author) {
				const message = "Username is already taken";
				console.error(message);
				return res.status(400).send(message);
			}
			else {
				Author
					.create({
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						userName: req.body.userName
					})
					.then(author => res.status(201).json({
						_id: author.id,
						name: `${author.firstName} ${author.lastName}`,
						userName: author.userName
					}))
					.catch(err => {
						console.error(err);
						res.status(500).json({error: "Something went wrong"});
					});
			}
		})
		.catch(err => {
				console.error(err);
				res.status(500).json({error: "Something went wrong"});
		})  
})

module.exports = router;