var host,
    hostname,
    port,
    colorMappings;

//settings at some Point (have to Build UI)
var defaultTheme="#00ff00"


browser.tabs.onUpdated.addListener( handleUpdated) ;
browser.tabs.onActivated.addListener( handleActivated );
browser.windows.onFocusChanged.addListener( handleActivated );

function handleUpdated(tabId, changeInfo, tab) {
  if( changeInfo.status === 'complete') {
  	browser.tabs.query({currentWindow: true, active: true}).then(getURL, onError);
  }
}

function handleActivated( e ){
	browser.tabs.query({currentWindow: true, active: true}).then(getURL, onError);
}

function getURL( tabs ) {
    var currentURL = new URL( tabs[0].url );

    host = currentURL.host;
    hostname = currentURL.hostname;
    port = currentURL.port;

    switchColor();
}

function toggleColor(color){
    browser.theme.update({
        colors: {
            frame: color,
            backgroundtext: '#000',
        }
    })
}

function switchColor() {
    colorMappings = browser.storage.local.get( 'regexMapping' ).then(x=>{
        regexMapping = x.regexMapping ||{};
        for (r of regexMapping){
            let regex = RegExp(r[0]);
            if (host.match(regex)) {
                toggleColor(r[1])
                return
            }
        }
        resetTheme()
    },onError)
}



async function resetTheme(){
    if (defaultTheme){
        toggleColor(defaultTheme)
    }else{
        browser.theme.reset()
    }
}


//open sidebar from Toolbar Button (aka browser action)
browser.browserAction.onClicked.addListener( function() {
	browser.sidebarAction.open();
} );

function onError(error) {
  console.log(`Error: ${error}`);
}
