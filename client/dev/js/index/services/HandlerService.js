angular.module('teamList')
  .service('HandlerService',
    function() {
      var msgBox = document.getElementById('msgBox'),
          msgShowtime = 3000,
          msgTimeout;
      this.handleError = function(err) {
        if (!err) {
          return;
        }
        console.log(err);
        clearTimeout(msgTimeout);
        msgBox.classList.remove('success');
        msgBox.classList.add('err');
        var errMsg = typeof err === 'string'?err:err.msg||err.message||err.err||'some error occured';
        msgBox.innerHTML = errMsg;
        disableMsg();
      };
      this.handleSuccess = function(msg) {
        if (!msg) {
          return;
        }
        clearTimeout(msgTimeout);
        msgBox.classList.remove('err');
        msgBox.classList.add('success');
        msgBox.innerHTML = msg.msg || msg.message || 'changes saved';
        disableMsg();
      };
      function disableMsg() {
        msgTimeout = setTimeout(msgBox.classList.remove.bind(msgBox.classList, 'err', 'success'), msgShowtime);
      }
    }
  );
