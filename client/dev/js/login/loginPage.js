window.onload = function() {
  var animatedInputs = document.querySelectorAll('.form input, .form textarea'),
      selectedTab = document.querySelector('.tab.active'),
      selectedForm = document.querySelector('.formCont.active'),
      messageElem = document.getElementById('message');
  var forms = {
    'register': document.getElementById('signup'),
    'login': document.getElementById('login')
  };


  addEventListeners();
  // focusAndBlurInputs();
  setTimeout(focusAndBlurInputs, 5);





  function addEventListeners() {
    for (var elem of Object.keys(animatedInputs)) {
      animatedInputs[elem].onkeydown = handleInputInteraction;
      animatedInputs[elem].onblur = handleInputInteraction;
      animatedInputs[elem].onfocus = handleInputInteraction;
    }
    document.getElementById('signUpForm').onsubmit = submitForm;
    document.getElementById('logInForm').onsubmit = submitForm;
    [].forEach.call(document.querySelectorAll('.tab a'), (elem) => {
      elem.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        selectedTab.classList.remove('active');
        selectedTab = e.target.parentElement;
        selectedTab.classList.add('active');

        selectedForm.classList.remove('active');
        selectedForm = forms[e.target.getAttribute('data-tab')];;
        selectedForm.classList.add('active');
      }
    });
  }

  function submitForm(e) {
    e.preventDefault();
    var req = new XMLHttpRequest();
    req.onreadystatechange = handleXHRReadyStateChange;
    req.open('POST', e.target.action, true);
    req.send(new FormData(e.target));
  };

  function handleXHRReadyStateChange(e) {
    var req = e.target;
    if (req.readyState === 4 && req.status === 302) {
      window.location = '/';
    } else if (req.readyState === 4) {
      showMessage(JSON.parse(req.response).err);
    }
  }

  function showMessage(msg) {
    messageElem.classList.add('visible');
    messageElem.innerText = msg || 'some error occured';
  }

  function handleInputInteraction(e) {
    // e.preventDefault();
    e.stopPropagation();
    var target = e.target,
        label = target.parentElement.getElementsByTagName('label')[0],
        type = e.type;

    switch (e.type) {
      case 'keydown':
        setTimeout(() => {
          if (target.value === '') {
            label.classList.remove('active', 'highlight');
          } else {
            label.classList.add('active', 'highlight');
          }
        }, 0);
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

  function focusAndBlurInputs() {
    //this is nessesary to let the input labels stay
    //where they're should stay
    [].forEach.call(animatedInputs, (input) => {
      input.focus();
      input.blur();
    })
  }

};
