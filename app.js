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

app.get('/api/projects', (req, res) => {
  const collection = db.get().collection('projects');
  collection.find().toArray((err, docs) => {
    res.json({ projects: docs });
  });
});

app.post('/api/projects', (req, res) => {
  const collection = db.get().collection('projects');
  collection
    .update(
      {
        name: req.body.projectName
      },
      {
        name: req.body.projectName
      },
      { upsert: true }
    )
    .then(result => {
      if (result.result.upserted) {
        res.json({
          success: true,
          message: 'Project successfully added',
          data: {
            _id: result.result.upserted[0]._id,
            name: req.body.projectName
          }
        });
      } else {
        res.json({
          success: false,
          message: `Project "${req.body.projectName}" already exists.`
        });
      }
    })
    .catch(error => {
      console.log('error', error);
      res.json(error);
    });
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
