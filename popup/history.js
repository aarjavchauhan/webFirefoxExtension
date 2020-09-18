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
  var list = document.getElementById('history');
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
        var li = document.createElement('p');
        var a = document.createElement('a');
        var url = document.createTextNode(history.url);
        a.href = history.url;
        a.target = '_blank';
        a.appendChild(url);
        li.appendChild(a);
        list.appendChild(li);
      }
    }
  });
});

var startTime = 0;
 
document.addEventListener("click", (e) => {

	if (e.target.classList.contains("start")) { // State:Start, new->Stop
	
		document.getElementById("button-start-stop").setAttribute("class", "button stop");
		document.getElementById("button-start-stop").innerText = "Stop";

		document.getElementById("helper-1").innerText = "Visited Websites : "
		
	} else if (e.target.classList.contains("stop")) { // State:Stop, new->Save
	
		document.getElementById("button-start-stop").setAttribute("class", "button save");
		document.getElementById("button-start-stop").innerText = "Save";
		
		var time = Date.now();
		document.getElementById("helper-1").innerText = time;
		
	} else if (e.target.classList.contains("save")) { // State:Save, new->Start
	
		document.getElementById("button-start-stop").setAttribute("class", "button start");		
		document.getElementById("button-start-stop").innerText = "Start";

		document.getElementById("helper-1").innerText = "";
		
	}
});

