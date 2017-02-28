/**
 * Based off of:
 * https://blog.idrsolutions.com/2013/07/check-if-a-pdf-is-valid-using-html5-file-api/
 */

/**
 * Used to attach events to an element or object in a browser independent way
 * @param element
 * @param event
 * @param callbackFunction
 */
function attachEvent(element, event, callbackFunction) {
    if(element.addEventListener) {
		element.addEventListener(event, callbackFunction, false);
	}
	else if(element.attachEvent)  {
		element.attachEvent("on" + event, callbackFunction);
	}
}

/**
 * Returns true if the HTML5 File API is supported by the browser
 * @returns {*}
 */
function supportsFileAPI() {
	return window.File && window.FileReader && window.FileList && window.Blob;
}

/**
 * Method to be called upon changing the contents of a input element before uploading a file
 * @param event
 */
function preUpload(event) {

  // Clear report area
  document.getElementById("report").innerHTML = "";

  readmultifiles(event.target.files);

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

function createDiv(parent, className, innerHTML) {
  var tempNode = document.createElement("div");
  tempNode.className = className;
  tempNode.innerHTML = innerHTML;
  document.getElementById(parent).appendChild(tempNode);
}

function pageLoaded() {
	var fileInput = document.getElementById("fileUpload");
	if(supportsFileAPI()) {
		attachEvent(fileInput, "change", preUpload);
	}
	else {
		alert("Your browser does not support the HTML5 File API.");
	}

}

attachEvent(window, "load", pageLoaded);
