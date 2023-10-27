const addMapping = document.getElementById('add-mapping'),
	  colors = document.getElementById('color-select');
	  saveButton = document.getElementById('saveButton');

var colorMappings,
	regexMapping,
    host;

//TODO: remove duplicates in regexmapping
//TODO: chrome compatibility with browser -> chrome
//TODO: whole domain matching

saveButton.addEventListener('click',function (){
	let inp = document.getElementById("settingsArea");
	textToRegex(inp.value)
	browser.tabs.executeScript(
		{
			code:`window.location.reload()`
		})
});

browser.storage.local.get('useBorder').then(x => {
	let useBorderElement= document.getElementById("useBorder");
	if (x==null || x.useBorder==null){
		browser.storage.local.set({"useBorder":true});
	}
}, onError);
function textToRegex(text){
	let listOfTuples= text.trim().split(";");
	browser.storage.local.get('regexMapping').then(x=> {
		regexMapping = [];
		let error = false;
		for (e of listOfTuples) {
			if (e !== "") {
				let [domainRegex, color] = e.split(",")
				if (domainRegex === "" || color === "" || domainRegex === undefined || color === undefined) {
					document.getElementById("error").innerHTML = "<p style='background: red'> Error parsing list</p>"
					return
				} else {
					regexMapping.push([domainRegex.trim(), color.trim()])
					//colorMappings[domainRegex] = color
				}
			}
		}
		regexMapping = regexMapping.sort(a => -a[0].length)
		browser.storage.local.set({"regexMapping":regexMapping});
	},
		onError);
}

//get current hostname whenever switching windows, tabs, or navigating to new page
function getHostName() {
	browser.tabs.query( {currentWindow: true, active: true} ).then( setHostName, onError );
}

function updateDefaultThemeUI() {
	browser.storage.local.get('defaultTheme').then(x => {
		defaultTheme = x.defaultTheme || null;
		let selector = document.getElementById("colorDefaultSelect");
		let defaultColorOn = document.getElementById("defaultColorToggle");
		if (defaultTheme) {
			console.log(defaultTheme.color)
			selector.value = defaultTheme.color
			defaultColorOn.checked = 1;
		}
	}, onError);

	browser.storage.local.get('useBorder').then(x => {
		let useBorderElement= document.getElementById("useBorder");
		let useBorder= x.useBorder|| null;
		if(useBorder){
			useBorderElement.checked=1;
		}
	}, onError);
}

function updateUI() {
	browser.storage.local.get('regexMapping').then(x => {
		regexMapping = x.regexMapping || [];
		for (r of regexMapping) {
			let regex = RegExp(r[0]);
			if (host.match(regex)) {
				colors.value = r[1]
				return
			}
		}
	}, onError)
}

function setHostName( tabsObject ) {
	var currentURL = new URL( tabsObject[0].url );
	host = currentURL.host;
	updateDefaultThemeUI();
}

getHostName();

browser.tabs.onUpdated.addListener( handleUpdated) ;
browser.tabs.onActivated.addListener( handleActivated );
browser.windows.onFocusChanged.addListener( handleActivated );

function handleUpdated( tabId, changeInfo, tab ) {
  if( changeInfo.status === 'complete') {
	  getHostName();
	  updateUI();
  }
}
function handleActivated( e ){
	getHostName();
}

//load saved mappings
browser.storage.local.get('colorMappings').then( loadMappings, onError );

function loadMappings(item) {
  colorMappings = item.colorMappings || {};
}
//save new mapping
addMapping.addEventListener( 'click', function() {
	regexMapping.push([""+host,colors.value])
	browser.storage.local.set( {regexMapping} );
	updateInput()
	browser.tabs.executeScript(
		{
			code:`window.location.reload()`
		})
});

function onError(error) {
  console.log(`Error: ${error}`);
}
function updateInput(){
	browser.storage.local.get('regexMapping').then(x=> {
		regexMapping = x.regexMapping || [];
		let input = document.getElementById("settingsArea")
		html = ``;
		for ([domain,color] of regexMapping){
			html += `${domain},${color};\n`
		}
		input.value = html;
		},
		onError
	);
}

function switchColor() {
	colorMappings = browser.storage.local.get( 'regexMapping' ).then(x=>{
		regexMapping = x.regexMapping ||[];
		for (r of regexMapping){
			let regex = RegExp(r[0]);
			print(regex,host)
			if (host.match(regex)) {
				colors.value=r[1]
				return
			}
		}
	},onError)
}
updateInput()

document.getElementById("settingsSaveButton").addEventListener("click",saveSettings)

function saveSettings(e){
	let defaultColorOn=document.getElementById("defaultColorToggle");
	let selector=document.getElementById("colorDefaultSelect");
	let useBorderElement=document.getElementById("useBorder");
	if (defaultColorOn.checked==1){
		browser.storage.local.set({"defaultTheme":{color:selector.value}});
	}else{
		browser.storage.local.set({"defaultTheme":null});
	}

	if (useBorderElement.checked==1){
		browser.storage.local.set({"useBorder":true});
	}else{
		browser.storage.local.set({"useBorder":false});
	}

	browser.tabs.executeScript(
		{
			code:`window.location.reload()`
		})
	browser.theme.reset()
}

