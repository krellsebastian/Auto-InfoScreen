var DEBUG_STDIN = false;

const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
let chromeInstance;
let chromeClient;
let emergency = 0;

console.log("chrome_launch");
chromeLauncher.launch({
    startingUrl: 'https://infoscreen.florian10.info/ows/infoscreen/v3',
    userDataDir: false,
    chromeFlags: ['--disable-infobars', '--disable-background-networking', '--disable-extensions', '--kiosk']
}).then(chrome => {
    console.log(`Chrome debugging port running on ${chrome.port}`);
    chromeInstance = chrome;

    CDP({port: chrome.port}, async (client) => {
        chromeClient = client;
        console.log("initiated");
        setInterval(callAndExtract,5000);
    }).on('error', (err) => {
        console.error(err);
    });
});


async function callAndExtract()
{
    const {Network, Page, Runtime} = chromeClient;
    try {
        const result = await Runtime.evaluate({
            expression: '$("div.einsatz.aktiv").length > 0'
        });
        console.log("checked");
        if(result.result.value){
            //we are in an emergency!
            if(emergency === 0)
            {
                //we have switched
                console.log(`Switched! We are in danger.`);
                //use cec!
                try{
                    if(cec != null ) {
                        cec.sendCommand(0xf0, CEC.Opcode.USER_CONTROL_PRESSED, CEC.UserControlCode.POWER_ON_FUNCTION);
                        console.log(`CEC Power sent`);
                        cec.sendCommand(0xf0, CEC.Opcode.ACTIVE_SOURCE);
                        console.log(`CEC ActiveSource sent`);
                    }
                }catch (e) {
                    console.log("cec-error");
                    console.log(e);
                }
            }
            emergency = 1;
        }else{
            //we are not in an emergency....
            if(emergency === 1)
            {
                //we have switched
                console.log(`Switched! Now off duty.`);
            }
            emergency = 0;
        }
    } catch (err) {
        console.error(err);
    }
}


let cec  = null;

console.log("start cec");
try{
    nodecec = require( 'node-cec' );
    NodeCec = nodecec.NodeCec;
    CEC     = nodecec.CEC;
    cec = new NodeCec( 'node-cec-monitor' );

    console.log("cec init success");
    try{
        cec.start( 'cec-client', '-b', 'r', '-o', 'FF Infoscreen' );
    }catch (e) {
        console.log("cec not started");
    }
    console.log("cec start done");
}catch (err) {
    console.log(`ERROR: No CEC`);
}

cec.once( 'ready', function(client) {
  console.log( ' -- CEC READY -- ' );
  client.sendCommand( 0xf0, CEC.Opcode.GIVE_DEVICE_POWER_STATUS );
});


//-----------------------DEBUG

if(DEBUG_STDIN == true){

	var stdin = process.stdin;
	
	// without this, we would only get streams once enter is pressed
	stdin.setRawMode( true );
	
	// resume stdin in the parent process (node app won't quit all by itself
	// unless an error or process.exit() happens)
	stdin.resume();
	
	// i don't want binary, do you?
	stdin.setEncoding( 'utf8' );
	
	// on any data into stdin
	stdin.on( 'data', function( key ){
	    // write the key to stdout all normal like
	    if ( key === '\u0003' ) {
	        if ( cec != null ) {
	            cec.stop();
	        }
	        if ( chromeClient != null ) {
	            chromeClient.close();
	        }
	        if ( chromeInstance != null ) {
	            chromeInstance.kill();
	        }
	        process.exit();
	    }
	    if (key === 'k')
	    {
	        const {Runtime} = chromeClient;
	        try {
	            Runtime.evaluate({
	                expression: 'Infoscreen.Manager.cycle._onSuccess({"CurrentState":"data","EinsatzData":[{"EinsatzID":"KS 0815","Status":2,"Alarmstufe":"T1","Meldebild":"Fahrzeugbergung","Nummer1":"15","Plz":"3500","Strasse":"Kremstalstraße","Ort":"Krems","Abschnitt":"BasisAbschnitt","Bemerkung":"","EinsatzErzeugt":"2018-05-07T14:23:39.0215599+02:00","Melder":"Franz Müller","MelderTelefon":"06641234567","EinsatzNummer":1,"Dispositionen":[{"Name":"KS-Krems Hauptwache Schleife 3","IsEigenalarmiert":true,"DispoTime":"2012-05-10T08:55:00","AusTime":"2012-05-10T08:58:00","EinTime":"2012-05-10T09:30:00","IsBackground":false}],"Rsvp":{"Yes":14,"No":4}}]},"")'
	            });
	            console.log("OK key");
	        }catch (e) {
	            console.log("error on key");
	        }
	    }
	    process.stdout.write( key );
	});
}

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});