//
// PLCLauncher.js
// 
// Launches all PLCs connected to the network then shuts down.
//
// Requires:
//   PLCMemoryMaps.js
//
//----------------------------------------------------------------------------
//  Revision History
//  ~~~~~~~~~~~~~~~~
//   17 Jul 2019 MDS Original
//----------------------------------------------------------------------------

document.title = "PLC Network Launcher";
var bc = new BroadcastChannel('PLC_Network');
var i;
PLC = [];

PLC[0] = { };
PLC[0].name = "Main";
PLC[0].description = "This PLC contains all of the main logic.  It reads inputs from the Burglar alarm data structure " +
  "and the Hue bridge data structure and writes to the Hue bridge light outputs upon change of state";
PLC[0].mapIndex = 6;

PLC[1] = { };
PLC[1].name = "New main";
PLC[1].description = "This PLC contains all of the main logic.  It reads inputs from the Burglar alarm data structure " +
  "and the Hue bridge data structure and writes to the Hue bridge light outputs upon change of state";
PLC[1].mapIndex = 7;

var msg = {};
msg.src = "Launcher";
msg.developerNotes = false;


for (i = 0; i < PLC.length; i++) {
  PLC[i].initialised = false;
  PLC[i].address = i;
  PLC[i].description = PLC[i].name + " PLC. (PLC address " + i + ").  " + PLC[i].description;
  window.open("PLC.html", "PLC" + i);
  window.focus();
  document.write("Opening PLC" + i + "<br/>");
}

bc.onmessage = function(ev) {
  var ind = -1;
  for (i = 0; i < PLC.length; i++) {
    if (ev.data.src === "PLC" + i) ind = i;
  }
  if (ind < 0) return; // Invalid PLC

  if (ev.data.command === "Initialise me") {
    // A PLC is asking for it's memory map
    msg.command = "Memory map";
    document.write("Got a request to initialise from " + ev.data.src + ".  Sending memory map " + PLC[ind].mapIndex + "<br/>");
    msg.PLC = {};
    msg.PLC.description = PLC[ind].description;
    msg.r = map[PLC[ind].mapIndex].map;
    msg.dst = "PLC" + ind;
    msg.PLC.address = PLC[ind].address;
    msg.PLC.title = PLC[ind].title;
    msg.PLC.name = PLC[ind].name;
    bc.postMessage(msg);
  } else if (ev.data.command === "Initialised") {
    document.write(PLC[ind].name + " PLC (" + ev.data.src + ") has confirmed that it is initialised<br/>");
    PLC[ind].initialised = true;
  }
}

// if all PLCs initialised then shut this page down
function checkIfDone() {
  var done = true;
  for (i = 0; i < PLC.length; i++) {
    if (PLC[i].initialised !== true) done = false;
  }
  if (done === true) {
    document.write("Terminating the Launcher in 2 seconds...<br/>");
    setTimeout(function() { window.close(); }, 2000);
  } else {
    setTimeout(checkIfDone, 100);
  }
}

checkIfDone();

// ------------------------------- End of file --------------------------------
