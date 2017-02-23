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
			var regexHeader = /%PDF-1.[0-7]/g;
      var matchHeader = regexHeader.exec(dataHeader);
      if (!matchHeader) {
        document.getElementById("status").innerHTML = "<div class='warning'>Not a valid PDF file.</div>";
        return;
      }

      // Display file size
      var KBSize = Math.ceil(file.size / 1024);
      document.getElementById("pdfSize").innerHTML = "<div class='default'>File size: <strong>" + KBSize + " KB</strong></div>";

      // Check if Lang is set, display value if set`
      var regexLang = /Lang\((\S*)\)/g;
      var matchLang = regexLang.exec(dataFull);
      if (!!matchLang) {
        document.getElementById("pdfLang").innerHTML = "<div class='success'>Language: <strong>" + matchLang[1] + "</strong></div>";
      }
      else {
        document.getElementById("pdfLang").innerHTML = "<div class='warning'>Language not set</div>";
      }

      // Check if /MarkInfo<</Marked true>>
      if (dataFull.indexOf("/MarkInfo<</Marked true>>") !== -1) {
        document.getElementById("pdfMarked").innerHTML = "<div class='success'>Marked: <strong>Yes</strong></div>";
      }
      else {
        document.getElementById("pdfMarked").innerHTML = "<div class='warning'>Not marked</div>";
      }

      // Check if StructTreeRoot is set
      var regexTree = /StructTreeRoot\s(\d*)\s(\d*)/g;
      var matchTree = regexTree.exec(dataFull);
      if (!!matchTree) {
        document.getElementById("pdfTagged").innerHTML = "<div class='success'>Tagged: <strong>Yes &mdash; " + matchTree[1] + " tags</strong></div>";
      }
      else {
        document.getElementById("pdfTagged").innerHTML = "<div class='warning'>Not tagged</div>";
      }
		};
	})(file));
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
