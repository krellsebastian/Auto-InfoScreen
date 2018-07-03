const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
let chromeInstance;
let chromeClient;
let emergency = 0;



function launchChrome()
{
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
		//Add Debug Key
		setTimeout(function(){
			const {Runtime} = chromeClient;
		        Runtime.evaluate({
		            expression: '$(document).keypress(function(e){if(e.keyCode===101){Infoscreen.Manager.cycle._onSuccess({"CurrentState":"data","EinsatzData":[{"EinsatzID":"KS 0815","Status":2,"Alarmstufe":"T1","Meldebild":"Fahrzeugbergung","Nummer1":"15","Plz":"3500","Strasse":"Kremstalstraße","Ort":"Krems","Abschnitt":"BasisAbschnitt","Bemerkung":"","EinsatzErzeugt":"2018-05-07T14:23:39.0215599+02:00","Melder":"Franz Müller","MelderTelefon":"06641234567","EinsatzNummer":1,"Dispositionen":[{"Name":"KS-Krems Hauptwache Schleife 3","IsEigenalarmiert":true,"DispoTime":"2012-05-10T08:55:00","AusTime":"2012-05-10T08:58:00","EinTime":"2012-05-10T09:30:00","IsBackground":false}],"Rsvp":{"Yes":14,"No":4}}]},"")}});'
		        });
		},10000);
	        setInterval(callAndExtract,5000);
	        console.log("chrome and Debug initiated");
	    }).on('error', (err) => {
	        console.error(err);
	    });
	});
}

setTimeout(launchChrome,5000);

async function callAndExtract()
{
    const {Network, Page, Runtime} = chromeClient;
    try {
        const result = await Runtime.evaluate({
            expression: '$("div.einsatz").length > 0'
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
			//cec.send("as");
			cec.send("on 0");
			setTimeout(function(){
				cec.sendCommand(0x1F,0x82,0x10,00);
				console.log(`CEC act sent`);
			},2000);
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
		//cec.send("is");
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
    cec = new NodeCec( 'InfoScreen' );

    console.log("cec init success");
    try{
        cec.start( 'cec-client', '-b', 'r');
    }catch (e) {
        console.log("cec not started");
    }
    console.log("cec start done");
}catch (err) {
    console.log(`ERROR: No CEC`);
}

cec.once( 'ready', function(client) {
  console.log( ' -- CEC READY -- ' );
  //client.sendCommand( cec_src_and_dest, CEC.Opcode.GIVE_DEVICE_POWER_STATUS );
});

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});