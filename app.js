const { s3Credentials } = require('./s3credentials');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();

const port = 4000;
const config = JSON.parse(fs.readFileSync('./s3config.json', 'utf8'));

app.get('/api/s3credentials', (req, res) => {
  if (req.query.filename) {
    var filename =
      crypto.randomBytes(16).toString('hex') + path.extname(req.query.filename);
    res.json(
      s3Credentials(config, {
        filename: filename,
        contentType: req.query.content_type
      })
    );
  } else {
    res.status(400).send('filename is required');
  }
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
