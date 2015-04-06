/* global QUnit */
/* global require */
// dead stupid script to format test output from nw.js to the console
var totalTestCount = 0;

if(!window._phantom){
  QUnit.log(function( details ) {
    console.log(details.module + ": " + details.name);
    if(details.result !== true){
      console.log("FAIL");
      console.log("   ---");
      console.log("    actual: -");
      console.log("      " + details.actual);
      console.log("    expected: -");
      console.log("      " + details.expected);
      console.log("    message: -");
      console.log("      " + details.message);
      console.log("      " + details.source);
      console.log("    Log:");
      if(details.log){
        console.log("      " + details.log);
      }
    }
  });

  QUnit.done(function( details ){
    console.log("TEST SUMMARY:");
    console.log("PASSED: " + details.passed);
    console.log("FAILED: " + details.failed);
    console.log("TOTAL: " + details.total);
    console.log("Runtime: " + details.runtime + "ms");

    var gui = require('nw.gui');
    if(details.failed === 0){
      // quit with no error
      gui.App.quit();
    }
    else{
      // fail out
      gui.App.crashRenderer();
    }
  });
}
