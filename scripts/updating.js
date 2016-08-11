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
  var fiddler = new cUseful.Fiddler();
  var copyFiddler = new cUseful.Fiddler();
  var hostingFiddler = new cUseful.Fiddler();
  
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
  
  // we also need the hosting big sheet
  hostingFiddler.setValues (
    SpreadsheetApp.openById(sr.sheetId)
    .getSheetByName(sr.sheetHosting)
    .getDataRange()
    .getValues() 
  );
  

  // but lets test instead
  var page = cUseful.Utils.expBackoff (function () {
    return SitesApp.getPageByUrl('https://sites.google.com/a/mcpher.com/share/rubbishfortesting');
  });
  
  // get the html
  var html =  cUseful.Utils.expBackoff (function () {
    return page.getHtmlContent();
  });
  var htmlAfter = html;
  var url = page.getUrl();
  
  // find the changes that conern this page
  hostingFiddler.getData().filter(function (d) {
    return url === d.url;
  })
  .forEach(function(d) {
    var copy = copyFiddler.getData().filter(function(e) {
      return e.givenName === d.fileName && e.id === d.id;
    })[0];
    if (!copy) throw 'oop'
    //now replace the html
    Logger.log(copy.hostUrl);
    Logger.log(d.match);
    htmlAfter.replace(d.match,copy.hostUrl);
    Logger.log(htmlAfter === html);
  });
  Logger.log(htmlAfter);
  
    /*
  // write it with no modification
  cUseful.Utils.expBackoff (function () {
    return page.setHtmlContent(html);
  });
  
  // get it again
  var htmlAfter = cUseful.Utils.expBackoff (function () {
    return page.getHtmlContent();
  });
  */
  if (htmlAfter !== html) {
    // compare
    var diffs = cjsDiff.JsDiff.diffChars(
      html,htmlAfter 
    );
  
  
    Logger.log("\n" + diffs.map(function (d) {

      if (d.removed) {
        return 'removed--' + d.count + ' chars\n  '+d.value;
      }
      if (d.added) {
        return 'added--' + d.count + ' chars\n  '+d.value;
      }
    }).join ("\n"));
  }
  
}
