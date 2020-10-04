function handleClick() {
	console.log("Tis was clicked !!");
}

var backgroundVar = 0;

browser.browserAction.onClicked.addListener(handleClick);

function getActiveTab() {
  return browser.tabs.query({active: true, currentWindow: true});
}

getActiveTab().then((tabs) => {
	//document.getElementById("helper-1").innerText = "from background"
});
