var express = require('express');
var router;


function initRoutes(io) {
  console.log('initRoutes');
  var router = express.Router();
  var ctrls = require('../controllers/controllers')(io);
  router
    .get('/', ctrls.requireLogin, ctrls.index)
    .get('/login', ctrls.login)
    .post('/user/register', ctrls.register)
    .post('/user/login', ctrls.userLogin)
    .get('/user/logout', ctrls.logout)
    .get('/files/:filename', ctrls.requireAngLogin, ctrls.getFileByFilename)
    .post('/files/:taskId', ctrls.requireAngLogin, ctrls.addFileToTask)

  return router;
}


module.exports = (socketio) => {
  return router || initRoutes(socketio);
};
