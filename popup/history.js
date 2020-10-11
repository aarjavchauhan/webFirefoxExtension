class State {
	// state is string, should be either Start/Stop/Save
	// time is start time of session in long. 0 if none.
	constructor(state, startTime, stopTime){
		this.state = state;
		this.startTime = startTime;
		this.stopTime = stopTime;
	}
}

class HistoryItem {
	constructor(url, id) {
		this.url = url;
		this.id = id;
	}
}

class DListHolder {
	constructor(list) {
		this.list = list;
	}
}

// Running list of history items
var runningList = [];

// Running list of entries not to show
var deletedList = [];

// keep track of current state
var currentState;

function saveDeletedList() {
	browser.storage.local.set({
		dList: new DListHolder(deletedList)
	});
}

function updateDeletedList() {
	var storageItem = browser.storage.local.get('dList');
	return storageItem;
}

function saveState(value) {
  browser.storage.local.set({
    state: value
  });
}

function getState() {
  var storageItem = browser.storage.local.get('state');
  return storageItem;
  // storageItem.then((res) => {
  	// newState(res.state)
  // });
}

function set_domain(domain) {
  const spans = document.getElementsByClassName('domain');
  [].slice.call(spans).forEach((span) => {
    span.textContent = domain;
  });
}

function no_history(hostname) {
  var history_text = document.getElementById('history');
  while(history_text.firstChild)
    history_text.removeChild(history_text.firstChild);
  history_text.textContent = `No history for ${hostname}.`;
}

function getActiveTab() {
  return browser.tabs.query({active: true, currentWindow: true});
}

// Start
Promise.all([
	updateDeletedList(), 
	getActiveTab(),
	getState()
]).then((values) => {

	if (values[0].dList != null) {
		deletedList = values[0].dList.list;	
	}
	currentState = values[2].state;
	startTime = currentState.startTime;
	//log2(JSON.stringify(values[2].state.time));
	newState(currentState);
 	setupList(true);
}).catch(error => {
	if (currentState == null) {
		currentState = new State("Start", 0);
	}
	setupList(false);
});

function setupList(withFilteredList) {
	
 	var list = document.getElementById('history');
 	var table = document.getElementById('history-table');

   	if (currentState.state == "Start") {
    	log2("Click Start to begin recording the websites you websites.");
    } else {

    	// if no stop time we're currently recording, else use the saved stop time.
   		var stopTime = (currentState.stopTime == null || currentState.stopTime == 0 ? Date.now() : currentState.stopTime);
	  	searchHistoryFromEndDate(stopTime).then((results) => {
	    // What to show if there are no results.

		    if (results.length < 1) {
		    	log("Start browsing !");
		    } else {
				var list = results.filter(item => !deletedList.includes(item.url));
				showList(list);
		    }
  		});	
    }
};

function searchHistoryFromEndDate(stopTime) {
	return searchingHistory = browser.history.search({
				text: "http", 
	     		startTime: currentState.startTime,
	     		endTime: stopTime,
	     		maxResults: 50
			});
}

function showList(results) {

 	var list = document.getElementById('history');
  	var table = document.getElementById('history-table');

  	runningList	= results;
	
	results.forEach(function(currentValue, k, arr) {
			 		
		var history = results[k];

		var row = table.insertRow(k);
		row.containerId = "row-container-" + k;
		row.id = row.containerId;
		var deleteButton = row.insertCell(0);
		var historyTitle = row.insertCell(1);

		deleteButton.setAttribute("class", "button delete");
		deleteButton.innerText = "Delete";
		deleteButton.style.fontSize = "x-small";
		deleteButton.id = "delete-button-" + k;
		deleteButton.containerId = row.containerId;
		deleteButton.deletedItem = k;
		deleteButton.index = k; // to reference for the running lists
		deleteButton.type = "delete";
		deleteButton.url = history.url;
		historyTitle.innerText = history.url;

		var historyItem = new HistoryItem(history.url, row.containerId);
		deleteButton.historyData = historyItem;
	});
}
 
document.addEventListener("click", (e) => {

	if (e.target.classList.contains("start")) { // State:Start, new->Stop
	
		newState(new State("Stop", Date.now(), 0));
		saveState(new State("Stop", Date.now(), 0));
		
	} else if (e.target.classList.contains("stop")) { // State:Stop, new->Save
	
		newState(new State("Save", currentState.startTime, Date.now()));
		saveState(new State("Save", currentState.startTime, Date.now()));
		
	} else if (e.target.classList.contains("save")) { // State:Save, new->Start
	
		newState(new State("Start", 0, 0));
		saveState(new State("Start", 0, 0));

		// perform download on save
		download();
		
	} else if (e.target.type == "delete") {
		//document.getElementById("start-time-label").innerText = e.target.index;
		// perform delete
		deleteHistoryItem(e.target.url, e.target.containerId);
	}
});

function deleteHistoryItem(url, id) {

	deletedList.push(url);
	var toBeRemovedItem = document.getElementById(id);
	toBeRemovedItem.remove();
	// deletedList = []; // to reset the deletedList stored.
	saveDeletedList();
}

function newState(theNewState) {

	if (theNewState.state == "Stop") {
	
		document.getElementById("button-start-stop").setAttribute("class", "button stop");
		document.getElementById("button-start-stop").innerText = "Stop";
		
	} else if (theNewState.state == "Save") {
	
		document.getElementById("button-start-stop").setAttribute("class", "button save");
		document.getElementById("button-start-stop").innerText = "Save";
	
	} else if (theNewState.state == "Start") {
	
		document.getElementById("button-start-stop").setAttribute("class", "button start");		
		document.getElementById("button-start-stop").innerText = "Start";
		//document.getElementById("start-time-label").innerText = "";
	}
}

function download() {
	var blob = new Blob([JSON.stringify(runningList)], { type: "application/json" });
	var url = window.URL.createObjectURL(blob);
	//log(url);
	//document.getElementById("start-time-label").innerText = "";
	browser.downloads.download({url: url, filename: "data1.json"})
	log("Successfully saved file to the downloads folder");
}

function log(text) {
	document.getElementById("helper-1").innerText = text;
}

function log2(text) {
	document.getElementById("start-time-label").innerText = text;
}
