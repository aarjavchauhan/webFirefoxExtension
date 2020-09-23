class State {
	constructor(state, time){
		this.state = state;
		this.time = time;
	}
}

function saveState(value) {
  browser.storage.local.set({
    state: value
  });
}

function getState() {
  var storageItem = browser.storage.local.get('state');
  storageItem.then((res) => {
  	newState(res.state)
  });
}

// A useful way to extract the domain from a url.
function get_hostname(url) {
  var a = document.createElement('a');
  a.href = url;
  set_domain(a.hostname);
  return a.hostname;
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

// When the page is loaded find the current tab and then use that to query
// the history.
getActiveTab().then((tabs) => {

  getState();

  var list = document.getElementById('history');
  var table = document.getElementById('history-table');
  var hostname = get_hostname(tabs[0].url);

  // Search for all history entries for the current windows domain.
  // Because this could be a lot of entries, lets limit it to 5.

  var searchingHistory = browser.history.search(
    {text: "http", 
     startTime: startTime,
     endTime: Date.now(),
     maxResults: 50
     });
  searchingHistory.then((results) => {
    // What to show if there are no results.
    if (results.length < 1) {
      no_history(hostname);
      
    } else {
    
      for (var k in results) {

        var history = results[k];

        var row = table.insertRow(k);
        var deleteButton = row.insertCell(0);
        var historyTitle = row.insertCell(1);

        deleteButton.setAttribute("class", "button delete");
        deleteButton.innerText = "Delete";
        deleteButton.style.fontSize = "x-small";
        deleteButton.id = "delete-button-" + k;
        historyTitle.innerText = history.url;
      }
    }
  });
});

var startTime = 0;
 
document.addEventListener("click", (e) => {

	if (e.target.classList.contains("start")) { // State:Start, new->Stop
		newState(new State("Stop", Date.now()));
		saveState(new State("Stop", Date.now()));
	} else if (e.target.classList.contains("stop")) { // State:Stop, new->Save
		newState(new State("Save", 0));
		saveState(new State("Save", 0));
	} else if (e.target.classList.contains("save")) { // State:Save, new->Start
		newState(new State("Start", 0));
		saveState(new State("Start", 0));
	} else {
		document.getElementById("start-time-label").innerText = e.target.id;
	}
});

function newState(newState) {

	//document.getElementById("start-time-label").innerText = newState.time;
	if (newState.state == "Stop") {
		document.getElementById("button-start-stop").setAttribute("class", "button stop");
		document.getElementById("button-start-stop").innerText = "Stop";
		document.getElementById("helper-1").innerText = "Visited Websites : "
	} else if (newState.state == "Save") {
	
		document.getElementById("button-start-stop").setAttribute("class", "button save");
		document.getElementById("button-start-stop").innerText = "Save";

		var time = Date.now();
		document.getElementById("helper-1").innerText = time;		
	} else if (newState.state == "Start") {
	
		document.getElementById("button-start-stop").setAttribute("class", "button start");		
		document.getElementById("button-start-stop").innerText = "Start";
		document.getElementById("helper-1").innerText = "";	
		//document.getElementById("start-time-label").innerText = "";
	}
}
