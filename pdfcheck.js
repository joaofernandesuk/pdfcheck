(function () {
  'use strict';

  (function(document, window, index) {

    // feature detection for drag&drop upload
    var isAdvancedUpload = function() {
      var div = document.createElement('div');
      return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
    }();

    // applying the effect for every form
    var forms = document.querySelectorAll('.box');
    Array.prototype.forEach.call(forms, function(form) {
      var input = form.querySelector('input[type="file"]'),
        label = form.querySelector('label'),
        droppedFiles = false,
        showFiles = function(files) {
          label.textContent = files.length > 1 ? (input.getAttribute('data-multiple-caption') || '').replace('{count}', files.length) : files[0].name;
        };

      // automatically submit the form on file select
      input.addEventListener('change', function(e) {
        showFiles(e.target.files);
        pdfCheck(e.target.files);
      });

      // drag&drop files if the feature is available
      if (isAdvancedUpload) {

        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(function(event) {
          form.addEventListener(event, function(e) {
            // preventing the unwanted behaviours
            e.preventDefault();
            e.stopPropagation();
          });
        });
        ['dragover', 'dragenter'].forEach(function(event) {
          form.addEventListener(event, function() {
            form.classList.add('is-dragover');
          });
        });
        ['dragleave', 'dragend', 'drop'].forEach(function(event) {
          form.addEventListener(event, function() {
            form.classList.remove('is-dragover');
          });
        });
        form.addEventListener('drop', function(e) {
          droppedFiles = e.dataTransfer.files; // the files that were dropped
          showFiles(droppedFiles);
          pdfCheck(droppedFiles);
        });
      }

      // Firefox focus bug fix for file input
      input.addEventListener('focus', function() {
        input.classList.add('has-focus');
      });
      input.addEventListener('blur', function() {
        input.classList.remove('has-focus');
      });

    });
  }(document, window, 0));

  function createDiv(parent, className, innerHTML) {
    var tempNode = document.createElement("div");
    tempNode.className = className;
    tempNode.innerHTML = innerHTML;
    document.getElementById(parent).appendChild(tempNode);
  }

  function pdfCheck(files) {

    // Clear report area
    document.getElementById("report").innerHTML = "";

    readmultifiles(files);

    function readmultifiles(files) {
      var reader = new FileReader();

      function readFile(index) {
        if( index >= files.length ) {
          return;
        }

        var file = files[index];
        reader.onload = function(e) {

          // get file content
          var markup;
          var dataFull = e.target.result;
          var pdfName = file.name;
          var fileNumber = index + 1;

          // Display File Name
          markup = "<strong><span class='file-number'>" + fileNumber + ".</span> " + pdfName + "</strong>";
          createDiv("report", "title", markup);

          // Check if valid PDF file (read first 8 bytes, match regex)
          var dataHeader = dataFull.substr(0, 8);
    			var regexHeader = /%PDF-(1.[0-7])/g;
          var matchHeader = regexHeader.exec(dataHeader);
          if (!matchHeader) {
            markup = "<span class='attribute'>PDF Version:</span> <strong>Not a valid PDF file</strong>";
            createDiv("report", "failure", markup);
            //return;
          }
          else {
            markup = "<span class='attribute'>PDF Version:</span> <strong>" + matchHeader[1] + "</strong>";
            createDiv("report", "default", markup);
          }

          // Display file size
          var fileSize = file.size / 1024 / 1024;
          fileSize = +fileSize.toFixed(1);
          var fileSizeSuffix = " MB";
          var KBSize = Math.ceil(file.size / 1024);
          if (fileSize <= 1) {
            fileSize = KBSize;
            fileSizeSuffix = " KB";
          }
          markup = "<span class='attribute'>File size:</span> <strong>" + fileSize + fileSizeSuffix + "</strong>";
          createDiv("report", "default", markup);

          // Check if StructTreeRoot is set
          var regexTree = /StructTreeRoot\s(\d*)\s(\d*)/g;
          var matchTree = regexTree.exec(dataFull);
          if (!!matchTree) {
            markup = "<span class='attribute'>Tagged:</span> <strong>Yes (" + matchTree[1] + " tags)</strong>";
            createDiv("report", "success", markup);
          }
          else {
            markup = "<span class='attribute'>Tagged:</span> <strong>No</strong>";
            createDiv("report", "failure", markup);
          }

          // Check if Lang is set, display value if set`
          var regexLang = /Lang\((\S*)\)/g;
          var matchLang = regexLang.exec(dataFull);
          if (!!matchLang) {
            markup = "<span class='attribute'>Language:</span> <strong>" + matchLang[1] + "</strong>";
            createDiv("report", "success", markup);
          }
          else {
            markup = "<span class='attribute'>Language:</span> <strong>not set</strong>";
            createDiv("report", "failure", markup);
          }

          // Check MarkInfo exists and whether true or false
          var regexMarked = /\/MarkInfo<<\/Marked (true|false)/g;
          var matchMarked = regexMarked.exec(dataFull);
          if (!!matchMarked) {
            if (matchMarked[1] === "true") {
              markup = "<span class='attribute'>Marked:</span> <strong>True</strong>";
              createDiv("report", "success", markup);
            }
            else {
              markup = "<span class='attribute'>Marked:</span> <strong>False</strong>";
              createDiv("report", "warning", markup);
            }
          }
          else {
            markup = "<span class='attribute'>Marked:</span> <strong>No</strong>";
            createDiv("report", "failure", markup);
          }

          // Check DisplayDocTitle exists and whether true or false
          var regexTitle = /\/DisplayDocTitle (true|false)/g;
          var matchTitle = regexTitle.exec(dataFull);
          if (!!matchTitle) {
            if (matchTitle[1] === "true") {
              markup = "<span class='attribute'>Display Doc Title:</span> <strong>True</strong>";
              createDiv("report", "success", markup);
            }
            else {
              markup = "<span class='attribute'>Display Doc Title:</span> <strong>False</strong>";
              createDiv("report", "warning", markup);
            }
          }
          else {
            markup = "<span class='attribute'>Display Doc Title</span> <strong>not set</strong>";
            createDiv("report", "failure", markup);
          }

          readFile(index+1);
        };
        reader.readAsText(file);
      }
      readFile(0);
    }
  }
}());
