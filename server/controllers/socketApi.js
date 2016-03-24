function initSocketRoutings(io) {
  var ctrls = require('../controllers/controllers')(io);
  console.log('initSocketRoutings');

  // setInterval(() => {
  //   io.in('l').emit('listUpdated', {listId: '56cfce756ed9fea820ed4b31', body:{name: Math.random()}})
  // }, 2000)

  io.on('connection', (socket) => {
    if (!socket.request.user) {
      return socket.disconnect('{redirect:true}');
    }
    var user = socket.request.user;
    console.log('user connected ' + user.username);
    ctrls.enterRooms(user, socket);



    socket.on('getUser', ctrls.getUser.bind(null, user, socket));
    socket.on('changeUserSettings', ctrls.changeUserSettings.bind(null, user, socket));
    socket.on('getLists', ctrls.getLists.bind(null, user, socket));
    socket.on('getList', ctrls.getList.bind(null, user, socket));
    socket.on('addList', ctrls.addList.bind(null, user, socket));
    socket.on('editList', ctrls.editList.bind(null, user, socket)); //notification goes
    socket.on('deleteList', ctrls.deleteList.bind(null, user, socket)); //notification goes
    socket.on('shareList', ctrls.shareList.bind(null, user, socket)); //notification goes
    socket.on('stopWatchingLists', ctrls.stopWatchingLists.bind(null, user, socket));
    socket.on('enterListRoom', ctrls.enterListRoom.bind(null, user, socket));
    socket.on('getTask', ctrls.getTask.bind(null, user, socket));
    socket.on('addTask', ctrls.addTask.bind(null, user, socket)); //notification goes
    socket.on('editTask', ctrls.editTask.bind(null, user, socket)); //notification goes
    socket.on('searchForTasks', ctrls.searchForTasks.bind(null, user, socket));
    socket.on('deleteTask', ctrls.deleteTask.bind(null, user, socket)); //notification goes
    socket.on('deleteFile', ctrls.deleteFile.bind(null, user, socket)); //notification goes
    socket.on('getNotifs', ctrls.getNotifs.bind(null, user, socket));
    socket.on('removeNotif', ctrls.removeNotif.bind(null, user, socket));

  });
}


module.exports = (appio) => {
  initSocketRoutings(appio);
};
