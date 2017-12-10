const MongoClient = require('mongodb').MongoClient;

let state = {
  db: null
};

exports.connect = (url, dbName, done) => {
  if (state.db) return done();

  MongoClient.connect(url, (err, client) => {
    if (err) return done(err);
    state.db = client.db(dbName);
    done();
  });
};

exports.get = () => {
  return state.db;
};

exports.close = done => {
  if (state.db) {
    state.db.close((err, result) => {
      state.db = null;
      state.mode = null;
      done(err);
    });
  }
};
