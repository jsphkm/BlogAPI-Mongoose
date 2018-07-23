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

router.put("/:id", (req, res) => {
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)){
		res.status(400).json({
			error: "Request path id and the body id values must match"
		})
	}

	const updated = {};
	const updateableFields = ["firstName", "lastName", "userName"];
	updateableFields.forEach(field => {
		if (field in req.body) {
			updated[field] = req.body[field];
		}
	});

	Author
		.findOne({ userName: updated.userName })
		.then(author => {
			if (author) {
				const message = `Username is already taken`;
				console.error(message);
				return res.status(400).send(message);
			}
			else {
				Author
					.findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
					.then(updatedAuthor => {
						res.status(200).json({
							id: updatedAuthor.id,
							name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
							userName: updatedAuthor.userName
						});
					})
					.catch(err => res.status(500).json({message: err}));
			}
		})
});

router.delete('/:id', (req, res) => {
	BlogPost
		.remove({ author: req.params.id })
		.then(() => {
			Author
				.findByIdAndRemove(req.params.id)
				.then(() => {
					console.log(`Deleted the author and the related blog posts, ${req.params.id}`);
					res.status(204).json({message: "success"});
				});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({error: "Something went wrong"});
		});
});

module.exports = router;