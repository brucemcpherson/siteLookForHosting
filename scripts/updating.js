// dont set this to true unless you are absolutely sure
// some gadgets and other things get badly sanitized
// when rewritten
// always test on a copy of a page first
// STILL UNDER DEV _ DONT USE
var REALLY_UPDATE = false;

function beVeryCareful () {
  
  // read the work from the sheet.
  var se = Settings.sites;
  var sr = Settings.report;
  var su = Settings.host;
  var sx = Settings.update;
  var ss = Settings.sites;
  
  var fiddler = new cUseful.Fiddler();
  var copyFiddler = new cUseful.Fiddler();
  var hostingFiddler = new cUseful.Fiddler();
  var siteFiddler = new cUseful.Fiddler();
  
  // get all the data from the summary sheet
  fiddler.setValues (
    SpreadsheetApp.openById(sr.sheetId)
    .getSheetByName(sr.sheetName)
    .getDataRange()
    .getValues() 
  );
  
  Logger.log(fiddler.getData().length + ' pages to process');
  
  // we also need the copy sheet
  copyFiddler.setValues (
    SpreadsheetApp.openById(su.sheetId)
    .getSheetByName(su.sheetName)
    .getDataRange()
    .getValues() 
  );
  
  // for test mode we need the site summary
  siteFiddler.setValues (
    SpreadsheetApp.openById(sr.sheetId)
    .getSheetByName(sr.sheetName)
    .getDataRange()
    .getValues() 
  );
  
  // we also need the hosting big sheet
  hostingFiddler.setValues (
    SpreadsheetApp.openById(sr.sheetId)
    .getSheetByName(sr.sheetHosting)
    .getDataRange()
    .getValues() 
  );
  
  
  // if in test mode then the universe of testing are pages copied for the event
  if (sx.testMode.active) {
    // get the root of the testing area
    var site = SitesApp.getSite(ss.domain, ss.siteName);
    var root = site.getChildByName(sx.testMode.testStub);
    if (!root.getName() === sx.testMode.testSub) {
      throw - 'unexpected test root ' + root.getName();
    }
    // delete any rubbish from before
    if (sx.testMode.deleteBefore) {
      root.getChildren().forEach (function (d) {
        d.deletePage();
        Logger.log ('deleted page ' + d.getName());
      });
    }
    // now copy some pages  
    siteFiddler.getData().forEach(function (d,i) {
      if (Math.random() < sx.testMode.sampleRate) {
        var page = SitesApp.getPageByUrl(d.url);
        var html = page.getHtmlContent();
        var htmlAfter =  modifyThisPage (html,d.url);
        if (htmlAfter === html) throw 'no change';
        var newPage = root.createWebPage(root.getName() + i, root.getName() + i, htmlAfter);
        Logger.log('created ' + root.getName() + i);
        if (sx.testMode.reportDiffs) {
          // get it back
          var writtenHtml = page.getHtmlContent();
         
          if (writtenHtml !== htmlAfter) {
            Logger.log("what got written is not what I wrote");
              // compare
              var diffs = cjsDiff.JsDiff.diffChars(htmlAfter,writtenHtml);
              
              Logger.log("\n" + diffs.map(function (d) {
                if (!d.removed && !d.added) {
                  return d.value;
                }
                if (d.removed) {
                  try {
                    return 'removed--'+ decodeURIComponent(d.value);
                  }
                  catch(err) {
                    return 'removed--'+ d.value;
                  }
                }
                if (d.added) {
                  try {
                    return 'added--'+ decodeURIComponent(d.value);
                  }
                  catch(err) {
                    return 'added--'+ d.value;
                  }
                }
                  
              }).join ("\n"));
          }
        }
      }
    });
    
    
  }
  
  function modifyThisPage (html,url) {
    
    // find the changes that conern this page
    hostingFiddler.getData().filter(function (d) {
      return url === d.url;
    })
    .forEach(function(d) {
      var copy = copyFiddler.getData().filter(function(e) {
        return e.givenName === d.fileName && e.id === d.id;
      })[0];
      if (!copy) throw 'couldnt find a copy file to use for ' + d.fileName;
      
      //now replace the html
      var rx = new RegExp(d.match,"m");
      html = html.replace(rx,d.match.match("%3A%2F%2F") ? copy.encodedUrl : copy.hostUrl);
      
    });
    
    return html;
  }
  
  
}
