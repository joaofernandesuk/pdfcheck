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
  // clear existing fields
  document.getElementById("pdfStatus").innerHTML = "";
  document.getElementById("pdfVersion").innerHTML = "";
  document.getElementById("pdfSize").innerHTML = "";
  document.getElementById("pdfTagged").innerHTML = "";
  document.getElementById("pdfMarked").innerHTML = "";
  document.getElementById("pdfLang").innerHTML = "";
  document.getElementById("pdfTitle").innerHTML = "";

	// The file API supports the ability to reference multiple files in one <input> tag
	var file = event.target.files[0];
	var reader = new FileReader();

	attachEvent(reader, "load", (function(fileToCheck) {
		return function (evt) {
      var dataFull = evt.target.result;

      // Check if valid PDF file (read first 8 bytes, match regex)
      var dataHeader = dataFull.substr(0, 8);
			var regexHeader = /%PDF-(1.[0-7])/g;
      var matchHeader = regexHeader.exec(dataHeader);
      if (!matchHeader) {
        document.getElementById("pdfStatus").innerHTML = "<div class='failure'>Not a valid PDF file.</div>";
        return;
      }
      else {
        document.getElementById("pdfVersion").innerHTML = "<div class='default'><span>PDF Version:</span> <strong>" + matchHeader[1] + "</strong></div>";
      }

      // Display file name
      var fileName = file.name;
      document.getElementById("pdfName").innerHTML = "<strong>" + fileName + "</strong>";

      // Display file size
      var KBSize = Math.ceil(file.size / 1024);
      document.getElementById("pdfSize").innerHTML = "<div class='default'><span>File size:</span> <strong>" + KBSize + " KB</strong></div>";

      // Check if Lang is set, display value if set`
      var regexLang = /Lang\((\S*)\)/g;
      var matchLang = regexLang.exec(dataFull);
      if (!!matchLang) {
        document.getElementById("pdfLang").innerHTML = "<div class='success'><span>Language:</span> <strong>" + matchLang[1] + "</strong></div>";
      }
      else {
        document.getElementById("pdfLang").innerHTML = "<div class='failure'>Language not set</div>";
      }

      // Check MarkInfo exists and whether true or false
      var regexMarked = /\/MarkInfo\<\<\/Marked (true|false)/g;
      var matchMarked = regexMarked.exec(dataFull);
      if (!!matchMarked) {
        if (matchMarked[1] == "true") {
          document.getElementById("pdfMarked").innerHTML = "<div class='success'><span>Marked:</span> <strong>True</strong></div>";
        }
        else {
          document.getElementById("pdfMarked").innerHTML = "<div class='warning'><span>Marked:</span> <strong>False</strong></div>";
        }
      }
      else {
        document.getElementById("pdfMarked").innerHTML = "<div class='failure'>Not marked</div>";
      }

      // Check if StructTreeRoot is set
      var regexTree = /StructTreeRoot\s(\d*)\s(\d*)/g;
      var matchTree = regexTree.exec(dataFull);
      if (!!matchTree) {
        document.getElementById("pdfTagged").innerHTML = "<div class='success'><span>Tagged:</span> <strong>Yes (" + matchTree[1] + " tags)</strong></div>";
      }
      else {
        document.getElementById("pdfTagged").innerHTML = "<div class='failure'>Not tagged</div>";
      }

      // Check DisplayDocTitle exists and whether true or false
      var regexTitle = /\/DisplayDocTitle (true|false)/g;
      var matchTitle = regexTitle.exec(dataFull);
      if (!!matchTitle) {
        if (matchTitle[1] == "true") {
          document.getElementById("pdfTitle").innerHTML = "<div class='success'><span>Display Doc Title:</span> <strong>True</strong></div>";
        }
        else {
          document.getElementById("pdfTitle").innerHTML = "<div class='warning'><span>Display Doc Title:</span> <strong>False</strong></div>";
        }
      }
      else {
        document.getElementById("pdfTitle").innerHTML = "<div class='failure'>Display Document Title not set</div>";
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
