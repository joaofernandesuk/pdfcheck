(function() {
  'use strict';

  function pdfCheck(file, fileData, fileNumber) {
    buildHeading(file, fileNumber);
    var valid = validatePDF(fileData);
    if (valid === true) {
      findTags(fileData);
      findLang(fileData);
      findMark(fileData);
      findUA(fileData);
      findTitle(fileData);
    }
  }

  // Check if valid PDF file (read first 8 bytes, match regex)
  function validatePDF(fileData) {
    var markup;
    var dataHeader = fileData.substr(0, 8);
    var regexHeader = /%PDF-(1.[0-7])/g;
    var matchHeader = regexHeader.exec(dataHeader);
    if (!matchHeader) {
      markup = "<strong>Not a valid PDF file</strong>";
      createDiv("report", "default", markup);
      return false;
    } else {
      markup = "<span class='attribute'>PDF Version:</span> <strong>" + matchHeader[1] + "</strong>";
      createDiv("report", "default", markup);
      return true;
    }
  }

  // Check if StructTreeRoot is set and count tags
  function findTags(fileData) {
    var markup;
    var regexTree = /StructTreeRoot\s(\d*)\s(\d*)/g;
    var matchTree = regexTree.exec(fileData);
    if (!!matchTree) {
      markup = "<span class='attribute'>Tagged:</span> <strong>Yes (" + matchTree[1] + " tags)</strong>";
      createDiv("report", "success", markup);
    } else {
      markup = "<span class='attribute'>Tagged:</span> <strong>No</strong>";
      createDiv("report", "failure", markup);
    }
  }

  // Check if Lang is set, display value if set
  function findLang(fileData) {
    var markup;
    var regexLang = /Lang((<|\()\S*(>|\)))/g;
    var matchLang = regexLang.exec(fileData);
    if (!!matchLang) {
      // Handle hex encoding
      if (matchLang[1] === "<656E2D5553>") {
        matchLang[1] = "(en-US)";
      }
      markup = "<span class='attribute'>Language:</span> <strong>" + matchLang[1] + "</strong>";
      createDiv("report", "success", markup);
    } else {
      markup = "<span class='attribute'>Language:</span> <strong>not set</strong>";
      createDiv("report", "failure", markup);
    }
  }

  // Check MarkInfo exists and whether true or false
  function findMark(fileData) {
    var markup;
    var regexMarked = /\/MarkInfo<<\/Marked (true|false)/g;
    var matchMarked = regexMarked.exec(fileData);
    if (!!matchMarked) {
      if (matchMarked[1] === "true") {
        markup = "<span class='attribute'>Marked:</span> <strong>True</strong>";
        createDiv("report", "success", markup);
      } else {
        markup = "<span class='attribute'>Marked:</span> <strong>False</strong>";
        createDiv("report", "warning", markup);
      }
    } else {
      markup = "<span class='attribute'>Marked:</span> <strong>No</strong>";
      createDiv("report", "failure", markup);
    }
  }

  // Check for PDF/UA identifier
  function findUA(fileData) {
    var markup;
    var regexPDFUA = /<pdfaSchema:prefix>pdfuaid<\/pdfaSchema:prefix>/g;
    var matchPDFUA = regexPDFUA.exec(fileData);
    if (!!matchPDFUA) {
      markup = "<span class='attribute'>PDF/UA identifier:</span> <strong>Yes</strong>";
      createDiv("report", "success", markup);
    } else {
      markup = "<span class='attribute'>PDF/UA identifier:</span> <strong>No</strong>";
      createDiv("report", "failure", markup);
    }
  }

  // Check for DisplayDocTitle and dc:title
  function findTitle(fileData) {
    var markup;
    var regexTitle = /\/DisplayDocTitle (true|false)/g;
    var matchTitle = regexTitle.exec(fileData);
    var regexDCTitle = /<dc:title>([\s\S]*?)<\/dc:title>/g;
    var matchDCTitle = regexDCTitle.exec(fileData);
    if (!!matchTitle) {
      if (matchTitle[1] === "true") {
        markup = "<span class='attribute'>Display Doc Title:</span> <strong>True</strong>";
        createDiv("report", "success", markup);
      } else {
        markup = "<span class='attribute'>Display Doc Title:</span> <strong>False</strong>";
        createDiv("report", "warning", markup);
      }
    } else if (!!matchDCTitle) {
      markup = "<span class='attribute'>DC Title found - (manually inspect title in Acrobat):</span> <strong>" + matchDCTitle[1] + "</strong>";
      createDiv("report", "warning", markup);
    } else {
      markup = "<span class='attribute'>Display Doc Title</span> <strong>not set</strong>";
      createDiv("report", "failure", markup);
    }
  }

  // Build file heading - ex: 1. document.pdf [PDF - 236 KB]
  function buildHeading(file, fileNumber) {
    var fileExt = file.name.split('.').pop().toUpperCase();
    var fileSize = file.size / 1024 / 1024;
    var fileSizeSuffix = " MB";
    fileSize = +fileSize.toFixed(1);
    if (fileSize <= 1) {
      fileSize = Math.ceil(file.size / 1024);
      fileSizeSuffix = " KB";
    }
    var fileLabel = "[" + fileExt + " - " + fileSize + fileSizeSuffix + "]";
    var markup = "<strong><span class='file-number'>" + fileNumber + ".</span> " + file.name + "</strong> " + fileLabel;
    createDiv("report", "title", markup);
  }

  function processFiles(files) {
    document.getElementById("report").innerHTML = "";
    readmultifiles(files);
  }

  function readmultifiles(files) {
    var reader = new FileReader();

    function readFile(index) {
      if (index >= files.length) {
        return;
      }
      var file = files[index];
      reader.onload = function(e) {
        var fileData = e.target.result;
        pdfCheck(file, fileData, index + 1);
        readFile(index + 1);
      };
      reader.readAsText(file);
    }
    readFile(0);
  }

  function createDiv(parent, className, innerHTML) {
    var tempNode = document.createElement("div");
    tempNode.className = className;
    tempNode.innerHTML = innerHTML;
    document.getElementById(parent).appendChild(tempNode);
  }

  // File, drag and drop handling
  (function(document, window, index) {
    // feature detection for drag and drop upload
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
        processFiles(e.target.files);
      });
      // drag and drop files if the feature is available
      if (isAdvancedUpload) {
        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(function(event) {
          form.addEventListener(event, function(e) {
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
          processFiles(droppedFiles);
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
}());
