window.onload = (function() {
  var animElems = document.querySelectorAll('.form input, .form textarea'),
    selectedTab = document.querySelector('.tab.active');
  selectedTab.querySelector('a').click();

  function init() {
    for (elem in animElems) {
      animElems[elem].onkeydown = handleInputInteraction;
      animElems[elem].onblur = handleInputInteraction;
      animElems[elem].onfocus = handleInputInteraction;
    }
  }

  setTimeout(init, 0);


  document.getElementById('signUpForm').onsubmit = submitForm;
  document.getElementById('logInForm').onsubmit = submitForm;

  function submitForm(e) {
    e.preventDefault();
    var req = new XMLHttpRequest();
    req.onreadystatechange = handleReadyStateChange;
    req.open('POST', e.target.action, true);
    req.send(new FormData(e.target));
  };

  function handleReadyStateChange(e) {
    var req = e.target;
    if (req.readyState === 4 && req.status === 302) {
      window.location = '/';
    } else if (req.readyState === 4) {
      var messageElem = document.getElementById('message');
      messageElem.classList.add('visible');
      messageElem.innerHTML = JSON.parse(req.response).err;
    }
  }


  [].forEach.call(document.querySelectorAll('.tab a'), function(elem) {
    elem.onclick = function(e) {
      e.stopPropagation();
      selectedTab.classList.remove('active');
      selectedTab = e.target.parentElement;
      selectedTab.classList.add('active');
    }
  });

  function handleInputInteraction(e) {
    //        e.preventDefault();
    e.stopPropagation();
    var target = e.target,
      label = target.parentElement.getElementsByTagName('label')[0],
      type = e.type;

    switch (e.type) {
      case 'keydown':
        if (target.value === '') {
          label.classList.remove('active', 'highlight');
        } else {
          label.classList.add('active', 'highlight');
        }
        break;

      case 'blur':
        if (target.value === '') {
          label.classList.remove('active', 'highlight');
        } else {
          label.classList.remove('highlight');
        }
        break;
      case 'focus':
        if (target.value === '') {
          label.classList.remove('highlight');
        } else {
          label.classList.add('highlight');
        }
    }
  }
})();
