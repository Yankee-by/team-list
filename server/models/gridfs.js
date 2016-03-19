/*

securityLvl is a security level

1 - only author allowed to use the list
2 - everyone is allowed
//3 - author, watchers and collaborators


*/

var Grid = require('gridfs-stream');
var shortId = require('shortid');
var gfs;
var model;


function init(mongoose) {
  Grid.mongo = mongoose.mongo;
  gfs = new Grid(mongoose.connection.db);

  model = {};

  model.findAndRemoveAsync = (query) => new Promise((resolve, reject) => {
    gfs.files.find(query)
    .toArray((err, files) => {
      if (!files.length) {
        return resolve();
      }
      for (file in files) {
        gfs.remove({
          filename: files[file].filename
        }, (err) => {
          if (err) {
            return reject({err: err});
          }
        });
      }
      return resolve();
    });
  });

  model.findOneAsync = (username, query, securityLvl) => new Promise((resolve, reject) => {
    gfs.files.find(query)
    .toArray((err, files) => {
      if (!files.length) {
        return reject('file not found');
      }
      if (securityLvl === 1 && files[0].metadata.author !== username) {
        return reject('unauthorized access');
      }
      return resolve(files[0]);
    });
  });

  model.removeAsync = (file) => new Promise((resolve, reject) => {
    gfs.remove({filename: file.filename}, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });

  model.download = (query, res) => {
    gfs.files.find(query)
    .toArray(function(err, files) {
      if (!files.length) {
        return res.json({
          err: 'File not found'
        });
      }
      res.writeHead(200, {
        'Content-Type': files[0].contentType
      });
      console.info(files[0].filename, files[0].metadata.name);
      var readstream = gfs.createReadStream({
        filename: files[0].filename
      });
      readstream.on('data', function(data) {
        res.write(data);
      });
      readstream.on('end', function() {
        res.end();
      });
      readstream.on('error', function(err) {
        console.log('An error occurred!', err);
      });
    });
  };

  model.uploadAsync = (username, taskId, listId, file, req, res) => new Promise((resolve, reject) => {
    if (!file) {
      return res.json({err: 'no file passed'});
    }
    if (file.size > 100*1000*1000) {
      return res.json({err: 'file size must be under 100 Mb'})
    }
    console.log(file.name);
    var writeStream = gfs.createWriteStream({
      metadata: {
        author: username,
        name: file.name,
        parentTaskId: taskId,
        parentListId: listId
      },
      filename: shortId.generate() + '.' + file.name.split(/[. ]+/).pop()
    });

    writeStream.on('close', (savedFile) => {
      res.json({
        filename: savedFile.filename,
        name: savedFile.metadata.name
      });
      return resolve(savedFile);
    });

    writeStream.write(file.data);
    writeStream.end();
  });


  return model;
}






module.exports = (mongoose) => {
  return model || init(mongoose);
};
