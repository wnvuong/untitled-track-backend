const { s3Credentials } = require('./s3credentials');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const db = require('./db');
const port = 4000;
const s3config = JSON.parse(fs.readFileSync('./s3config.json', 'utf8'));
const mongoConfig = JSON.parse(fs.readFileSync('./mongoConfig.json', 'utf8'));

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

app.get('/api/tracks', (req, res) => {
  const collection = db.get().collection('tracks');
  collection.find().toArray((err, docs) => {
    res.json({ tracks: docs });
  });
});

app.post('/api/tracks', (req, res) => {
  console.log(req.body);
  res.json(req.body);
  // const collection = db.collection('tracks');
  // collection.insert([
  //   {a : 1}, {a : 2}, {a : 3}
  // ], function(err, result) {
  //   assert.equal(err, null);
  //   assert.equal(3, result.result.n);
  //   assert.equal(3, result.ops.length);
  //   console.log("Inserted 3 documents into the collection");
  //   callback(result);
  // });
});

app.get('/api/s3credentials', (req, res) => {
  if (req.query.filename) {
    var filename =
      crypto.randomBytes(16).toString('hex') + path.extname(req.query.filename);
    res.json(
      s3Credentials(s3config, {
        filename: filename,
        contentType: req.query.content_type
      })
    );
  } else {
    res.status(400).send('filename is required');
  }
});

db.connect(mongoConfig.dbUrl, mongoConfig.dbName, err => {
  if (err) {
    console.log('Unable to connect to Mongo.');
    process.exit(1);
  } else {
    app.listen(port, () => {
      console.log(`Listening on port ${port}...`);
    });
  }
});
