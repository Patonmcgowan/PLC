//
// PLCScanFunctions.js
// 
// Contains functions to interface the PLC registers to other software.
//
// Requires:
//   Nothing
//
//----------------------------------------------------------------------------
//  Revision History
//  ~~~~~~~~~~~~~~~~
//   17 Jul 2019 MDS Original
//----------------------------------------------------------------------------

function doScanFunctions(e) {
  e = mapPLCRegisters(e);

  // Update the date / time for the status display
  var d = new Date(); 
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  PLC.date = days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  PLC.time = "";
  if (d.getHours() < 10) PLC.time = "0" 
  PLC.time = PLC.time + d.getHours() + ":";
  if (d.getMinutes() < 10) PLC.time = PLC.time + "0";
  PLC.time = PLC.time + d.getMinutes() + ":";
  if (d.getSeconds() < 10) PLC.time = PLC.time + "0";
  PLC.time = PLC.time + d.getSeconds();

  // Update the scan times
  PLC.thisTime = d;
  PLC.thisScan = PLC.thisTime - PLC.lastTime;
  if (PLC.thisScan > PLC.maxScan) PLC.maxScan = PLC.thisScan;
  if (PLC.thisScan < PLC.minScan) PLC.minScan = PLC.thisScan;

  if (typeof(PLC.lastTime) !== "undefined") {

    // updateStatusPage()
    if (document.getElementById("plcStatus").style.display === "block") {
      document.getElementById("thisScan").innerHTML = window.PLC.thisScan;
      document.getElementById("minScan").innerHTML = PLC.minScan;
      document.getElementById("maxScan").innerHTML = PLC.maxScan;
      document.getElementById("plcDate").innerHTML = PLC.date;
      document.getElementById("plcTime").innerHTML = PLC.time;
      if (window.logicValid === true) {
        var l = Object.keys(window.e.logic.elements).length - 24;  // First 24 are instruction definitions
        if (l == 1) { 
          document.getElementById("plcElements").innerHTML = l + " instruction "; 
        } else {
          document.getElementById("plcElements").innerHTML = l + " instructions "; 
        }

        if (window.e.logic.ladder.length == 1) {
          document.getElementById("plcRungs").innerHTML = "in " + window.e.logic.ladder.length + " rung";
        } else {
          document.getElementById("plcRungs").innerHTML = "in " + window.e.logic.ladder.length + " rungs";
        }
      }
    }

  } else {
    // First time through: build status page and our tools
    window.showPage = function(pageName, showIt) {
      if (showIt === true) {
        document.getElementById(pageName).style.display = "block";
      } else {
        document.getElementById(pageName).style.display = "none";
      }
    }

    window.copyLogicToClipboard = function() {
      if (window.logicValid === false) {
        setTimeout(copyLogicToClipboard, 10);
      } else {
        textToClipboard(JSON.stringify(window.e) + ";");
        window.alertBox('PLC Configuration Copied', 'The PLC configuration has been copied to the clipboard as a JSON stringified object.  ' +
          ' This object contains the ladder logic, defined registers and metadata.');
      }
    };

    // Display an alert box in the style of the document containing the passed title and text
    window.alertBox = function(title, text) {
      document.getElementById("alertTitle").innerHTML = title;
      document.getElementById("alertText").innerHTML = text;
      showPage("alertBox", true);
    };

    // Copy the passed text to the clipboard
    window.textToClipboard = function(text) {
      var dummy = document.createElement("textarea");
      document.body.appendChild(dummy);
      dummy.value = text;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
    }

    // buildToolsMenu()
    var mdsTools = document.createElement("div");
    mdsTools.classList.add("mdsTools");
    mdsTools.innerHTML = 
      '<div class = "mdsWrapper">' + 
      '<input type="button" value="Copy PLC To Clipboard" onclick="' +
            'window.logicValid = false;' +
            'window.logicRequest = true;' +
            'copyLogicToClipboard();"' +
          'class="button" />' +
      '<input type="button" value="Show PLC Status" onclick="' + 
            'window.logicValid = false;' +
            'window.logicRequest = true;' +
            'showPage(\'plcStatus\', true);' +
          '" class="button" /><br />' +
      '<input type="button" id="registerButton" value="Show PLC Registers" onclick="' + 
            'if (document.getElementsByClassName(\'tag-list\')[0].style.display === \'none\') {' +
              'document.getElementsByClassName(\'tag-list\')[0].style.display = \'block\';' +
              'document.getElementById(\'registerButton\').value=\'Hide PLC Registers\';' +
              'document.getElementById(\'printButton\').disabled=true;' +
            '} else {' +
              'document.getElementsByClassName(\'tag-list\')[0].style.display = \'none\';' +
              'document.getElementById(\'registerButton\').value=\'Show PLC Registers\';' +
              'document.getElementById(\'printButton\').disabled=false;' +
            '}' +
          '" class="button" />' +
      '<input type="button" id="printButton" value="Print Ladder Logic" onclick="' + 
            'document.getElementsByClassName(\'toolbox\')[0].style.display = \'none\';' +
            'document.getElementsByClassName(\'mdsTools\')[0].style.display = \'none\';' +
            'window.print();' +
            'document.getElementsByClassName(\'toolbox\')[0].style.display = \'block\';' +
            'document.getElementsByClassName(\'mdsTools\')[0].style.display = \'block\';' +
          '" class="button" />' +
      '</div>';
    document.body.appendChild(mdsTools);

    // buildStatusPage()
    var plcStatus = document.createElement("div");
    plcStatus.id = "plcStatus";
    plcStatus.classList.add("plcStatus");
    plcStatus.innerHTML = 
      '<div class="mdsWrapper">' +
        '<h2>PLC Status</h2>' +
        '<span class="col1">Node Address : ' + PLC.address + ' </span><span class = "col2">Node ID : ' + PLC.name + '</span>' +
        '<span class="fullWidth">' + PLC.description + ' </span>' +
        '<span class="fullWidth"><br/></span>' +
        '<span class="col1">Scan Time : <span id="thisScan">' + PLC.thisScan + '</span> ms </span>' +
        '<span class="col1">Min Scan Time : <span id="minScan">' + PLC.minScan + '</span> ms</span><span class = "col2">Max Scan Time : <span id="maxScan">' + PLC.maxScan + '</span> ms</span>' +
        '<span class="col1">PLC Engine Revision : ' + PLC.software + '</span>' + 
        '<span class="col2"><span id = "plcElements"></span><span id = "plcRungs"></span></span>' +
        '<span class = "col1">Date : <span id = "plcDate">' + PLC.date + '</span></span>' +
        '<span class = "col2">Time : <span id = "plcTime">' + PLC.time + '</span></span>' +
        '<span class="fullWidth"><br/></span>' +
        '<span class="fullWidth">This software was modified from the PLCFiddle.com PLC Engine by Michael Scott 2019</span>' +
        '<input type="button" value="OK" onclick="' + 
          'window.logicRequest = false;' +
          'showPage(\'plcStatus\', false);' +
          '" class="button right" />' + 
      '</div>';
    document.body.appendChild(plcStatus);
    showPage("plcStatus", false);

    // buildAlertBox()
    var alertBox = document.createElement("div");
    alertBox.id = "alertBox";
    alertBox.classList.add("alertBox");
    alertBox.innerHTML = 
      '<div class="mdsWrapper">' +
        '<h2><span id="alertTitle">Alert</span></h2>' +
        '<span class="fullWidth" id="alertText"></span>' +
        '<input type="button" value="OK" onclick="showPage(\'alertBox\', false)" class="button right" />' + 
      '</div>';
    document.body.appendChild(alertBox);
    showPage("alertBox", false);

    document.getElementsByClassName("tag-list")[0].style.display = "none"; // Hide register list
  }

  PLC.lastTime = PLC.thisTime;
  return e;
}

//-----------------------------------------------------------------------------
// Map PLC I/O registers back to the other software modules
//-----------------------------------------------------------------------------
// This is the function where we inject the logic states and code.  This function is called every 100mS or so.  
// Note that the update to the outputs is one scan behind.  All registers are available through the variable e
function mapPLCRegisters(e) {

  // Wait for PLC to get it's memory map if it's on a network
  if ((window.name.length > 0) && ((typeof(window.PLCInitialised) === "undefined") || (window.PLCInitialised !== true)))
    return;

  switch(PLC.address) {
    case 0 : // Main PLC
      break;
    case 1 : // Scheduler PLC
      break;
  }
  // Write inputs to PLC
/*
eg e[0].name, e[0].value
*/


  // Read outputs from PLC and write back to code.  This writes on change of state only
  JSONe = JSON.stringify(e);
  if (typeof(mapPLCRegisters.lastState) !== "undefined") {
    if (JSONe !== mapPLCRegisters.lastState) {
      // Write outputs here

      // console.log("Changed");
    }
  }
  mapPLCRegisters.lastState = JSONe;
  return e;
}

// ------------------------------- End of file --------------------------------
