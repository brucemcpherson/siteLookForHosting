// extending sense gadget to a table of 3
// specific to my site.
function patchItUpDontUse() {
  
  var se = Settings.sites;
  var sr = Settings.report;
  var su = Settings.host;
  var fiddler = new cUseful.Fiddler();
  
  // you actually want to do it!!
  var REALLY = true;
  var du = cUseful.DriveUtils.setService(DriveApp);
  var backoff = cUseful.Utils.expBackoff;
  
  
  // get your site
  var site = SitesApp.getSite(se.domain,se.siteName);
  var pages = getAllPages (site);

  Logger.log(pages.length + ' pages in site');
  
  // get the template page
  var sg = Settings.gadgets;
  var target = 'sitesense.xml';
  var template = sg.templates[target];
  var templatePage = SitesApp.getPageByUrl(template);
  if (!templatePage) throw 'missing template page ' + templateUrl;
  
   // find the row for the requested gadget
  fiddler.setValues (
    SpreadsheetApp.openById(su.sheetId)
    .getSheetByName(su.sheetName)
    .getDataRange()
    .getValues() 
  )
  .filterRows(function(d) {
    return d.name === target;
  });
  
  if (fiddler.getData().length !== 1) throw 'should have been one entry in hosting file'+JSON.stringify(fiddler.getData());
  var templateRow = fiddler.getData()[0];
  
  
  // find those with hosted stuff
  var work = pages.map(function (d) {
    
    // get the content
    var html = backoff ( function () {
      return d.getHtmlContent();
    });
    
    
  });
}
