angular.module('teamList')
  .service('FilesService', function() {
    this.files = [];
    this.onUpload = undefined;
    this.onUploaded = undefined;
  });
