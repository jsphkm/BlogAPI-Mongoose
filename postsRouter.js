const express = require("express");
const router = express.Router();

const {Author, BlogPost} = require("./models");

router.get("/", (req, res) => {
  BlogPost
    .find()
    .then(posts => {
      res.json(posts.map(post => {
        return {
          id: post._id,
          title: post.title,
          content: post.content,
          author: post.authorName
        }
      }));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: "something went wrong"});
    });
});

router.get("/:id", (req, res) => {
  BlogPost
    .findById(req.params.id)
    .then(post => {
      res.json({
        id: post._id,
        title: post.title,
        content: post.content,
        author: post.authorName,
        comments: post.comments
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: "something went wrong"});
    })
})

router.post("/", (req, res) => {
  const requiredFields = ["title", "content", "author_id"];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });

  Author
    .findById(req.body.author_id)
    .then(author => {
      if (author) {
        BlogPost
          .create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author_id
          })
          .then(post => res.status(201).json({
            id: post._id,
            title: post.title,
            content: post.content,
            author: `${author.firstName} ${author.lastName}`,
            comments: post.comments
          }))
          .catch(err => {
            console.error(err);
            res.status(500).json({error: "Something went wrong"});
          });
      }
      else {
        const message = `Author not found`;
        console.error(message);
        return res.status(400).send(message);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: "something went wrong"})
    });
});

router.put("/:id", (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: "Request path id and request body id values must match"
    });
  }

  const updated = {};
  const updateableFields = ['title', 'content'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  BlogPost
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .then(updatedPost => res.status(200).json({
      id: updatedPost.id,
      title: updatedPost.title,
      content: updatedPost.content
    }))
    .catch(err => res.status(500).json({message: err}));
});

router.delete("/:id", (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted blog post with id ${req.params.id}`);
      res.status(204).end();
    });
});

module.exports = router;
