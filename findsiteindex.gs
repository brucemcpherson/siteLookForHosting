function findsiteindex() {
  
  var se = Settings.sites;
  var sr = Settings.report;
  var sf = Settings.sense;
  
  var fiddler = new cUseful.Fiddler();
  
  // get your site
  var site = SitesApp.getSite(se.domain,se.siteName);
  var pages = getAllPages (site);

  Logger.log(pages.length + ' pages in site');
  
  var hits = pages.map(function(d) {
    var c = d.getHtmlContent();
    return c.match("siteindex.xml") ? {
      url:d.getUrl(),
      size:c.length
    } : null;
  })
  .filter(function(d) {
    return d;
  })
  
  Logger.log(hits.length);
    // write out the result to a new sheet
  var ss = SpreadsheetApp.openById(sf.sheetId);
  var sh = ss.getSheetByName(sf.sheetName);
  
  // if if does exist, create it.
  if (!sh) {
    sh = ss.insertSheet(sf.sheetName);
  }
  
  // clear it
  sh.clearContents();

  fiddler
  .setData (hits)
  .getRange(sh.getDataRange())
  .setValues(fiddler.createValues());

}
