/**
 * Baseline functions from:
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
		element.attachEvent('on' + event, callbackFunction);
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
	var file = event.target.files[0];
	var reader = new FileReader();

	attachEvent(reader, "load", (function(fileToCheck) {
		return function (evt) {
      var dataFull = evt.target.result;

      // Check if valid PDF file (read first 8 bytes, match regex)
      var dataHeader = dataFull.substr(0, 8);
			var regexHeader = new RegExp("%PDF-1.[0-7]");
      if(dataHeader.match(regexHeader)) {
        document.getElementById("pdfValid").innerHTML = "Yes";
			}
      else {
        document.getElementById("pdfValid").innerHTML = "No";
      }

      // Check if Lang is set, display value if set`
      var regexLang = /Lang\((\S*)\)/g;
      var matchLang = regexLang.exec(dataFull);
      if (!!matchLang) {
        document.getElementById("pdfLang").innerHTML = matchLang[1];
      }
      else {
        document.getElementById("pdfLang").innerHTML = "Not set";
      }

      // Check if /MarkInfo<</Marked true>>
      if (dataFull.indexOf("/MarkInfo<</Marked true>>") !== -1) {
        document.getElementById("pdfMarked").innerHTML = "Yes";
      }
      else {
        document.getElementById("pdfMarked").innerHTML = "No";
      }

      // Check if StructTreeRoot is set
      var regexTree = /StructTreeRoot\s(\d*)\s(\d*)/g;
      var matchTree = regexTree.exec(dataFull);
      if (!!matchTree) {
        document.getElementById("pdfTagged").innerHTML = "Yes, " + matchTree[1] + " tags";
      }
      else {
        document.getElementById("pdfTagged").innerHTML = "No";
      }
		}
	})(file));

  var KBSize = Math.ceil(file.size / 1024);
  document.getElementById("pdfSize").innerHTML = KBSize + " KB";
	reader.readAsText(file);
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
