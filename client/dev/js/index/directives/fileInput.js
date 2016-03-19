angular.module('teamList')
  .directive('fileInput', ['$parse', 'HandlerService', 'FilesService', function($parse, HandlerService, FilesService) {
    return {
      restrict: 'A',
      // scope: true,
      link: function(scope, elem, attrs) {
        var input = elem.find('input'),
            dropzone = elem.find('label');
            thumbnailImg = elem.find('img')[0],
            _files = FilesService.files,
            dropzoneDefaultText = '<strong>Drag file</strong> here or <strong>click to choose</strong> one';
        FilesService.onUploaded = onUploaded;
        changeDropzoneText();

        elem.bind('submit', onSubmit);
        input.bind('change', onInputChange);
        dropzone.bind('drag dragstart dragend dragover dragenter dragleave drop', dropZonePrevent);
        dropzone.bind('dragover dragenter', onDragOver);
        dropzone.bind('dragleave dragend drop', onDragLeave);
        dropzone.bind('drop', onDrop);

        function onInputChange(e) {
          handleFile(input[0].files[0]);
        }
        function dropZonePrevent(e) {
          e.preventDefault();
          e.stopPropagation();
        }
        function onDragOver() {
          dropzone[0].classList.add('dragover');
        }
        function onDragLeave() {
          dropzone[0].classList.remove('dragover');
        }
        function onDrop(e) {
          handleFile(e.dataTransfer.files[0]);
        }
        function handleFile(file) {
          if (!file) {
            thumbnailImg.classList.remove('visible');
            _files.length = 0;
            changeDropzoneText();
            return;
          }
          console.log(file.size);
          if (file.size > 100000000) {
            HandlerService.handleError({err: 'the files\'s size must be under 100 Mb'});
            return input[0].value = '';
          }
          _files.length = 0;
          _files[0] = file;
          var reader = new FileReader();
          reader.onload = function(event) {
            if (!event.target.result.includes('data:image')) {
              return;
            }
            thumbnailImg.src = event.target.result;
            thumbnailImg.classList.add('visible');
          }
          reader.readAsDataURL(file);
          changeDropzoneText(file.name);
          scope.$apply();
        }
        function onSubmit(e) {
          e.preventDefault();
          FilesService.upload()
        }
        function onUploaded() {
          elem[0].reset();
          thumbnailImg.classList.remove('visible');
          _files.length = 0;
          changeDropzoneText();
        }
        function changeDropzoneText(text) {
          dropzone[0].innerHTML = text || dropzoneDefaultText;
        }

        input.on('$destroy', function() {
          elem.unbind('submit', onSubmit);
          input.unbind('change', onInputChange);
          dropzone.unbind('drag dragstart dragend dragover dragenter dragleave drop', dropZonePrevent);
          dropzone.unbind('dragover dragenter', onDragOver);
          dropzone.unbind('dragleave dragend drop', onDragLeave);
          dropzone.unbind('drop', onDrop);
        });
      }
    };
  }]);
