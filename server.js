const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");

const app = express();
app.use(express.json());
app.use(morgan("common"));

const postsRouter = require("./postsRouter");
mongoose.Promise = global.Promise;

const {DATABASE_URL, PORT} = require('./config');
const {BlogPost} = require("./models");

app.use("/posts", postsRouter);

app.use("*", function (req, res) {
  res.status(404).json({message: "Not Found"});
});

let server;

function runServer(databaseUrl, port) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, {useNewUrlParser: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL, PORT).catch(err => console.error(err));
}

module.exports = {runServer, app, closeServer};
