var host,
    hostname,
    port;
var DEBUG_MODE = true;

//settings at some Point (have to Build UI)


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

function toggleColor(color,prefersdark){
    browser.storage.local.get('useBorder').then(x => {
        let useBorderElement= document.getElementById("useBorder");
        let useBorder= x.useBorder|| null;

        if (useBorder){
            let timer = 0.5;
            let opacity = 0.5;
            let borderWidth = "15px";
            //simmilar to UrlColors plugin
            chrome.tabs.executeScript(
                {
                    code:`
              var style = document.createElement('style');
              style.type = 'text/css';
              style.innerHTML = '.urlColorAnimate { animation: blinker ${timer}s linear infinite; } @keyframes blinker { 0% { opacity: ${opacity}; } 50% { opacity: 0; } 100% { opacity: ${opacity}; } }';
              document.getElementsByTagName('head')[0].appendChild(style);
              var leftDiv = document.createElement('div');
              var rightDiv = document.createElement('div');
              var topDiv = document.createElement('div');
              var bottomDiv = document.createElement('div');

              var divs = [leftDiv, rightDiv, topDiv, bottomDiv];
              var horizontal = [topDiv, bottomDiv];
              var vertical = [rightDiv, leftDiv];

              divs.forEach(function(div, index) {
                div.setAttribute('class', 'colordiv');
                div.style.background = '${color}';
                div.style.position = 'fixed';
                div.style.opacity = ${opacity};
                div.style.zIndex = '99999999999999';
                div.style.pointerEvents = 'none';
              });

              horizontal.forEach(function(div) {
                div.style.left = '0';
                div.style.right = '0';
                div.style.height = '${borderWidth}';
              });

              vertical.forEach(function(div) {
                div.style.top = '0';
                div.style.bottom = '0';
                div.style.width = '${borderWidth}';
              });

              leftDiv.style.left = '0';
              rightDiv.style.right = '0';
              topDiv.style.top = '0';
              bottomDiv.style.bottom = '0';

              divs.forEach(function(div) {
                document.body.appendChild(div);
              });
            `});
        }else{
            let prefers_dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            browser.theme.update({
                colors: {
                    frame: color,
                    backgroundtext: '#000'
                },
                properties: {
                    color_scheme: prefers_dark ? 'dark' : 'light'
                }
            })
        }
    }, onError);
}


function getStyle(themeInfo) {
    if (themeInfo.colors) {
        console.log(`accent color: ${themeInfo.colors.frame}`);
        console.log(`toolbar: ${themeInfo.colors.toolbar}`);
    }
}

function switchColor() {
    browser.storage.local.get( 'regexMapping' ).then(x=>{
        regexMapping = x.regexMapping ||[];
        regexMapping = regexMapping.sort(a => a[0].length)
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
    browser.storage.local.get( 'defaultTheme' ).then(x=> {
        defaultTheme = x.defaultTheme || null;
        if (defaultTheme) {
            toggleColor(defaultTheme.color)
        } else {
            browser.theme.reset()
        }
    },onError);
}


//open sidebar from Toolbar Button (aka browser action)
browser.browserAction.onClicked.addListener( function() {
	browser.sidebarAction.open();
} );

function onError(error) {
  console.log(`Error: ${error}`);
}
