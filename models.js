const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const blogPostSchema = mongoose.Schema({
  title: String,
  content: String,
  author: {firstName: String, lastName: String},
  created: {type: Date, default: Date.now}
});

blogPostSchema
  .virtual("authorFullName")
  .get(function(){
    return `${this.author.firstName} ${this.author.lastName}`.trim();
  });

blogPostSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorFullName,
    created: this.created
  }
}


const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {BlogPost};
