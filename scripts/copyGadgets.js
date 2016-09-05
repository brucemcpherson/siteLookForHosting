function copyGadgetsBeVeryCareful() {
  
  // we've found that copying gadgets just doesnt work, so the approach is to have a template 
  // of a gadget with the changed urls, then copy that to every page that uses that gadget
  
  // get the sheet of work
  var su = Settings.host;
  var sg = Settings.gadgets;
  var si = Settings.identify;
  var sr = Settings.report;
  
  // you actually want to do it!!
  var REALLY = true;
  
  // get the hosting data
  var fiddlerList = new cUseful.Fiddler();
  
  fiddlerList.setValues (
    SpreadsheetApp.openById(sr.sheetId)
    .getSheetByName(sr.sheetHosting)
    .getDataRange()
    .getValues() 
  )
    
  var du = cUseful.DriveUtils.setService(DriveApp);
  var backoff = cUseful.Utils.expBackoff;
  
  var fiddler = new cUseful.Fiddler();
  
  // get the data and filter out anything thats not a potential gadget
  // and add a column for the result
  fiddler.setValues (
    SpreadsheetApp.openById(su.sheetId)
    .getSheetByName(su.sheetName)
    .getDataRange()
    .getValues() 
  )
  .filterRows(function(d) {
    return d.role === "xml";
  })
  .insertColumn ("template")
  .insertColumn ("status")
  .insertColumn ("pagesUpdated");
  

  fiddler.mapRows(function(row) {
  
    // find the template
    if (!sg.templates[row.name]) {
      row.template = si.treatments.missingText;
    }
    else {
      row.template = sg.templates[row.name];
      // now find the page
      var page = SitesApp.getPageByUrl(row.template);
      if (!page) {
        row.status = si.treatments.missingPage;
      }
      else {
        var html = page.getHtmlContent();
        
        // why? because filenames with spaces get double encoded when entered as gadget
        // no idea why - just another damned annoying thing to deal with
        var encodedName = "<img class='igm'.+?" +
          row.encodedUrl.replace(/%20/g, "%2520") + 
          ".+?\\/>";
        
        // this should find the target in the template
        var templateRx = new RegExp (encodedName,"igm");
        
        // and this should find it in the original
        var origRx = new RegExp ("<img class='igm'.+?" +
          row.match + 
          ".+?\\/>","igm");
        

        if (!html.match(templateRx)) {
          row.status = si.treatments.missingGadget;
        }
        else {
          // now we need to get all the pages that feature this gadget

          fiddlerList.getData().filter(function (d,i) {
            return d.match === row.match;
          })

          .forEach(function(d,i,a) {

            if (REALLY) {

              var page = backoff(function () {
                return SitesApp.getPageByUrl(d.url);
              });
              
              // the original content
              var origHtml = page.getHtmlContent();
              
              // see if it matches the original query
              if (!origHtml.match(origRx)) {
                //Logger.log( 'already done-no match in source page ' + d.url);
              }
              else {
                var newHtml = origHtml.replace (origRx, html.match(templateRx)[0]);
                Logger.log(d.url);
                Logger.log((origHtml.length- newHtml.length) +' ' + ' ' + d.url);
                if (origHtml.length- newHtml.length > 2000) {
                  Logger.log(html.match(templateRx)[0]);
                  Logger.log(origHtml.match(origRx)[0]);
                  Logger.log(row.name);
                  throw 'stopping';
                }
                backoff (function () {
                  //return page.setHtmlContent(newHtml);
                });
                row.pagesUpdated = row.pagesUpdated ? row.pagesUpdated+1 : 1;
              }
            }
          })
          
        }
      }
    }
    return row;
  })

  
  
  
  
  // write out the result to a new sheet
  var ss = SpreadsheetApp.openById(sg.sheetId);
  var sh = ss.getSheetByName(sg.sheetName);
  
  // if if does exist, create it.
  if (!sh) {
    sh = ss.insertSheet(sg.sheetName);
  }
  
  // clear it
  sh.clearContents();

  fiddler
  .getRange(sh.getDataRange())
  .setValues(fiddler.createValues());


  
}
