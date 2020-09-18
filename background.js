function handleClick() {
	console.log("Tis was clicked !!");
}

browser.browserAction.onClicked.addListener(handleClick);

