(function () {
  function addFlag(className, innerHTML) {
    var tempNode = document.createElement('p');
    tempNode.className = 'flag ' + className;
    tempNode.innerHTML = innerHTML;
    document.getElementById('report').appendChild(tempNode);
  }

  // Check if valid PDF file (read first 8 bytes, match regex)
  function validatePDF(fileData) {
    var markup;
    var dataHeader = fileData.substr(0, 8);
    var regexHeader = /%PDF-(1.[0-7])/g;
    var matchHeader = regexHeader.exec(dataHeader);
    if (!matchHeader) {
      markup = '<strong>Not a valid PDF file</strong>';
      addFlag('default', markup);
      return false;
    }
    markup = '<span>PDF Version:</span> <strong>' + matchHeader[1] + '</strong>';
    addFlag('default', markup);
    return true;
  }

  // Check if StructTreeRoot is set and count tags
  function findTags(fileData) {
    var markup;
    var regexTree = /StructTreeRoot\s(\d*)\s(\d*)/g;
    var matchTree = regexTree.exec(fileData);
    if (matchTree) {
      markup = '<span>Tagged <a href="#help-tagged" class="more-info" aria-label="more information on this check" title="more information on this check">i</a></span> <strong>Yes (' + matchTree[1] + ' tags)</strong>';
      addFlag('success', markup);
    } else {
      markup = '<span>Tagged <a href="#help-tagged" class="more-info" aria-label="more information on this check" title="more information on this check">i</a></span> <strong>No</strong>';
      addFlag('failure', markup);
    }
  }

  // Check if Lang is set, display value if set
  function findLang(fileData) {
    var markup;
    var regexLang = /Lang((<|\()\S*(>|\)))/g;
    var matchLang = regexLang.exec(fileData);
    if (matchLang) {
      // Handle hex encoding
      if (matchLang[1] === '<656E2D5553>') {
        matchLang[1] = '(en-US)';
      }
      markup = '<span>Language <a href="#help-language" class="more-info" aria-label="more information on this check" title="more information on this check">i</a></span> <strong>' + matchLang[1] + '</strong>';
      addFlag('success', markup);
    } else {
      markup = '<span>Language <a href="#help-language" class="more-info" aria-label="more information on this check" title="more information on this check">i</a></span> <strong>not set</strong>';
      addFlag('failure', markup);
    }
  }

  // Check MarkInfo exists and whether true or false
  function findMark(fileData) {
    var markup;
    var regexMarked = /<<\/Marked (true|false)/g;
    var matchMarked = regexMarked.exec(fileData);
    if (matchMarked) {
      if (matchMarked[1] === 'true') {
        markup = '<span>Marked <a href="#help-marked" class="more-info" aria-label="more information on this check" title="more information on this check">i</a></span> <strong>True</strong>';
        addFlag('success', markup);
      } else {
        markup = '<span>Marked <a href="#help-marked" class="more-info" aria-label="more information on this check" title="more information on this check">i</a></span> <strong>False</strong>';
        addFlag('warning', markup);
      }
    } else {
      markup = '<span>Marked <a href="#help-marked" class="more-info" aria-label="more information on this check" title="more information on this check">i</a></span> <strong>No</strong>';
      addFlag('failure', markup);
    }
  }

  // Check for PDF/UA identifier
  function findUA(fileData) {
    var markup;
    var regexPDFUA = /<pdfaSchema:prefix>pdfuaid<\/pdfaSchema:prefix>/g;
    var matchPDFUA = regexPDFUA.exec(fileData);
    if (matchPDFUA) {
      markup = '<span>PDF/UA identifier <a href="#help-pdfua" class="more-info" aria-label="more information on this check" title="more information on this check">i</a></span> <strong>Yes</strong>';
      addFlag('success', markup);
    } else {
      markup = '<span>PDF/UA identifier <a href="#help-pdfua" class="more-info" aria-label="more information on this check" title="more information on this check">i</a></span> <strong>Not set</strong>';
      addFlag('warning', markup);
    }
  }

  // Check for DisplayDocTitle and dc:title
  function findTitle(fileData) {
    var markup;
    var regexTitle = /<dc:title>[\s\S]*?<rdf:Alt>([\s\S]*?)<\/rdf:Alt>[\s\S]*?<\/dc:title>/g;
    var matchTitle = regexTitle.exec(fileData);
    var emptyTag = /<rdf:li xml:lang="x-default"\/>/g;
    var matchEmpty = emptyTag.exec(matchTitle);

    if (matchTitle) {
      if (matchEmpty) {
        markup = '<span>Document Title <a href="#help-title" class="more-info" aria-label="more information on this check" title="more information on this check">i</a></span> <strong>Empty</strong>';
        addFlag('warning', markup);
      } else {
        markup = '<span>Document Title <a href="#help-title" class="more-info" aria-label="more information on this check" title="more information on this check">i</a></span> <strong>' + matchTitle[1] + '</strong>';
        addFlag('default', markup);
      }
    } else {
      markup = '<span>Document Title <a href="#help-title" class="more-info" aria-label="more information on this check" title="more information on this check">i</a></span> <strong>Not set</strong>';
      addFlag('failure', markup);
    }
  }

  // Build file heading - ex: 1. document.pdf [PDF - 236 KB]
  function buildHeading(file, fileNumber) {
    var fileLabel;
    var markup;
    var fileExt = file.name.split('.').pop().toUpperCase();
    var fileSize = file.size / 1024 / 1024;
    var fileSizeSuffix = ' MB';
    fileSize = +fileSize.toFixed(1);
    if (fileSize <= 1) {
      fileSize = Math.ceil(file.size / 1024);
      fileSizeSuffix = ' KB';
    }
    fileLabel = '[' + fileExt + ' - ' + fileSize + fileSizeSuffix + ']';
    markup = fileNumber + '. ' + file.name + ' <small>' + fileLabel + '</small>';
    addFlag('title', markup);
  }

  function pdfCheck(file, fileData, fileNumber) {
    var valid;
    buildHeading(file, fileNumber);
    valid = validatePDF(fileData);
    if (valid === true) {
      findTitle(fileData);
      findTags(fileData);
      findLang(fileData);
      findMark(fileData);
      findUA(fileData);
    }
  }

  function readmultifiles(files) {
    var reader = new FileReader();

    function readFile(index) {
      var file;
      if (index >= files.length) {
        return;
      }
      file = files[index];
      reader.onload = function (e) {
        var fileData = e.target.result;
        pdfCheck(file, fileData, index + 1);
        readFile(index + 1);
      };
      reader.readAsText(file);
    }
    readFile(0);
  }

  function processFiles(files) {
    document.getElementById('report').innerHTML = '';
    readmultifiles(files);
  }

  // File, drag and drop handling
  (function (document, window) {
    // feature detection for drag and drop upload
    var isAdvancedUpload = (function () {
      var div = document.createElement('div');
      return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
    }());
    // applying the effect for every form
    var forms = document.querySelectorAll('.box');
    Array.prototype.forEach.call(forms, function (form) {
      var input = form.querySelector('input[type="file"]');
      var label = form.querySelector('label');
      var droppedFiles = false;
      var showFiles = function (files) {
        label.textContent = files.length > 1 ? (input.getAttribute('data-multiple-caption') || '').replace('{count}', files.length) : files[0].name;
      };
      // automatically submit the form on file select
      input.addEventListener('change', function (e) {
        showFiles(e.target.files);
        processFiles(e.target.files);
      });
      // drag and drop files if the feature is available
      if (isAdvancedUpload) {
        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(function (event) {
          form.addEventListener(event, function (e) {
            e.preventDefault();
            e.stopPropagation();
          });
        });
        ['dragover', 'dragenter'].forEach(function (event) {
          form.addEventListener(event, function () {
            form.classList.add('is-dragover');
          });
        });
        ['dragleave', 'dragend', 'drop'].forEach(function (event) {
          form.addEventListener(event, function () {
            form.classList.remove('is-dragover');
          });
        });
        form.addEventListener('drop', function (e) {
          droppedFiles = e.dataTransfer.files; // the files that were dropped
          showFiles(droppedFiles);
          processFiles(droppedFiles);
        });
      }
      // Firefox focus bug fix for file input
      input.addEventListener('focus', function () {
        input.classList.add('has-focus');
      });
      input.addEventListener('blur', function () {
        input.classList.remove('has-focus');
      });
    });
  }(document, window));
}());
