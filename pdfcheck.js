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

	// The file API supports the ability to reference multiple files in one <input> tag

  var uploadedFileNum = event.target.files.length;
  var file;
  var i;
  var j;
  var pdfName;
  var reader;

  document.getElementById("report").innerHTML = "";

  for (i = 0; i < uploadedFileNum; i++) {
    file = event.target.files[i];
    reader = new FileReader();


    attachEvent(reader, "load", (function(fileToCheck) {

  		return function (evt) {

        for (j = 0; j < uploadedFileNum; j++) {

          var dataFull = evt.target.result;

          // Display file name
          //pdfName = evt.target.file.name;

            pdfName = event.target.files[j].name;
            markup = "<strong>" + pdfName + "</strong>";
            createDiv("report", "title", markup);
          // pdfName = "hi";
          // console.log(event.target.files);
          // console.log(i);
          // console.log(file);
          // markup = "<strong>" + pdfName + "</strong>";
          // createDiv("report", "title", markup);

          // Check if valid PDF file (read first 8 bytes, match regex)
          var dataHeader = dataFull.substr(0, 8);
    			var regexHeader = /%PDF-(1.[0-7])/g;
          var matchHeader = regexHeader.exec(dataHeader);
          if (!matchHeader) {
            markup = "Not a valid PDF file.";
            createDiv("report", "failure", markup);
            return;
          }
          else {
            markup = "<span>PDF Version:</span> <strong>" + matchHeader[1] + "</strong>";
            createDiv("report", "default", markup);
          }

          // Display file size
          var KBSize = Math.ceil(file.size / 1024);
          markup = "<span>File size:</span> <strong>" + KBSize + " KB</strong>";
          createDiv("report", "default", markup);

          // Check if Lang is set, display value if set`
          var regexLang = /Lang\((\S*)\)/g;
          var matchLang = regexLang.exec(dataFull);
          if (!!matchLang) {
            markup = "<span>Language:</span> <strong>" + matchLang[1] + "</strong>";
            createDiv("report", "success", markup);
          }
          else {
            markup = "Language not set";
            createDiv("report", "failure", markup);
          }

          // Check MarkInfo exists and whether true or false
          var regexMarked = /\/MarkInfo\<\<\/Marked (true|false)/g;
          var matchMarked = regexMarked.exec(dataFull);
          if (!!matchMarked) {
            if (matchMarked[1] == "true") {
              markup = "<span>Marked:</span> <strong>True</strong>";
              createDiv("report", "success", markup);
            }
            else {
              markup = "<span>Marked:</span> <strong>False</strong>";
              createDiv("report", "warning", markup);
            }
          }
          else {
            markup = "Not marked";
            createDiv("report", "failure", markup);
          }

          // Check if StructTreeRoot is set
          var regexTree = /StructTreeRoot\s(\d*)\s(\d*)/g;
          var matchTree = regexTree.exec(dataFull);
          if (!!matchTree) {
            markup = "<span>Tagged:</span> <strong>Yes (" + matchTree[1] + " tags)</strong>";
            createDiv("report", "success", markup);
          }
          else {
            markup = "Not tagged";
            createDiv("report", "failure", markup);
          }

          // Check DisplayDocTitle exists and whether true or false
          var regexTitle = /\/DisplayDocTitle (true|false)/g;
          var matchTitle = regexTitle.exec(dataFull);
          if (!!matchTitle) {
            if (matchTitle[1] == "true") {
              markup = "<span>Display Doc Title:</span> <strong>True</strong>";
              createDiv("report", "success", markup);
            }
            else {
              markup = "<span>Display Doc Title:</span> <strong>False</strong>";
              createDiv("report", "warning", markup);
            }
          }
          else {
            markup = "Display Document Title not set";
            createDiv("report", "failure", markup);
          }
        }
  		};
  	})(file));
  	reader.readAsText(file);
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
