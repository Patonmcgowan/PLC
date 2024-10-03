//
// PLCInit.js
// 
// Initialises a PLC by either using a default config if it is standalone, or
// downloads the specific PLC config from the PLC Network launcher if started 
// from the launcher
//
// Requires:
//   Nothing
//
//----------------------------------------------------------------------------
//  Revision History
//  ~~~~~~~~~~~~~~~~
//   17 Jul 2019 MDS Original
//----------------------------------------------------------------------------

var PLC = {};
PLC.description = "This is an emulation of a PLC5, complete with some extensible functions.";
PLC.title = "Base PLC";
PLC.developerNotes = false;
PLC.address = 0;
PLC.thisScan = -1;
PLC.maxScan = -1;
PLC.minScan = 100000;

if (window.name.length > 0) {
  var bc = new BroadcastChannel('PLC_Network');
  var msg = {};


  // We are on a network of PLCs, so we wait for the PLC memory to come across from the network launcher

  // Get the time I started.  This is transmitted with every message and used for duplicate address resolution
  myStartupTime = Date.now(); 

  msg.src = window.name;
  msg.dst = "Launcher";
  msg.command = "Initialise me";

  bc.postMessage(msg); // I'm up, please give me my memory map

  bc.onmessage = function(ev) {
    // console.log(ev);
    // Check for duplicate addresses on the network, and shut me down if I'm the oldest with the same address
    if (ev.data.src === window.name) { if (ev.data.startup > myStartupTime) { window.close(); } }

    // Process commands for me
    if (window.name === ev.data.dst) {
      if (ev.data.command === "Memory map") {
        if (typeof(ev.data.dst) !== "undefined") { document.title = ev.data.dst; };
        if (typeof(ev.data.PLC.description) !== "undefined") { PLC.description = ev.data.PLC.description; };
        if (typeof(ev.data.PLC.title) !== "undefined") { PLC.title = ev.data.PLC.title; };
        if (typeof(ev.data.PLC.developerNotes) !== "undefined") { PLC.developerNotes = ev.data.PLC.developerNotes; };
        if (typeof(ev.data.r) !== "undefined") { r = ev.data.r; };
        if (typeof(ev.data.PLC.address) !== "undefined") { PLC.address = ev.data.PLC.address; };
        if (typeof(ev.data.PLC.name) !== "undefined") { PLC.name = ev.data.PLC.name; };
        developerNotes = ev.data.developerNotes;
        if (developerNotes === true) { 
          console.log("\r\nLadder logic initialised from 'PLCMemoryMaps.js' is as follows:\r\nr = {logic:"+JSON.stringify(r.logic)+'};');
          console.log("\r\nTo modify the ladder logic, use the GUI to build the rungs, then hit the 'Save' button on the " + 
            "'Other' tab to write the logic to the console.  Cut and paste the new logic into the file 'PLCLadderLogic.js'");
        };
        window.PLCInitialised = true;
        msg.src = window.name;
        msg.dst = "Launcher";
        msg.command = "Initialised";
        msg.startup = myStartupTime;
        bc.postMessage(msg); // I'm loaded and ready
      }
    }
  }
}
r = map[5].map
developerNotes = false; 
map = null;

// ------------------------------- End of file --------------------------------
