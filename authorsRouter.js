const express = require("express");
const router = express.Router();

const {Author, BlogPost} = require("./models");

router.get("/authors", (req, res) => {
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

module.exports = router;