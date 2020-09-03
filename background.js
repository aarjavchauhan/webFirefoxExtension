function handleClick() {
	console.log("Tis was clicked !!");
	console.error("mx");
  	browser.sidebarAction.open();
}

browser.browserAction.onClicked.addListener(handleClick);

