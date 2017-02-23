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
	console.log(file);
	var reader = new FileReader();

	attachEvent(reader, "load", (function(fileToCheck) {
		return function (evt) {
			var data = evt.target.result.substr(0, 256);
			var regex = new RegExp("%PDF-1.[0-7]");
			console.log(data);
			if(data.match(regex)) {
				alert(fileToCheck.name + " is a valid PDF File.");
			}
		}
	})(file));

	var MBSize = file.size / 1024 / 1024;
	if(MBSize > 10) {
		if(!confirm(file.name + " is " + MBSize + "MB big, and may cause your browser to stop responding while it parses it.\nContinue?")) {
			return;
		}
	}
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
