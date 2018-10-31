function createHostUrls () {
  
  // get the data
  var sc = Settings.copy;
  var su = Settings.host;
  var si = Settings.identify;
  
  //DriveApp.getFileById(id)
  var du = cUseful.DriveUtils.setService(DriveApp);
  var backoff = cUseful.Utils.expBackoff;
  
  var fiddler = new cUseful.Fiddler();
  
  fiddler.setValues (
    SpreadsheetApp.openById(sc.sheetId)
    .getSheetByName(sc.sheetCopied)
    .getDataRange()
    .getValues() 
  );
  
  // write out the result to a new sheet
  var ss = SpreadsheetApp.openById(su.sheetId);
  var sh = ss.getSheetByName(su.sheetName);
  
  // if if does exist, create it.
  if (!sh) {
    sh = ss.insertSheet(su.sheetName);
  }
  
  // clear it
  sh.clearContents();

  fiddler
  .insertColumn ('hostUrl')
  .insertColumn('encodedUrl')
  .mapRows(function (row) {
    if (row.copiedId === si.treatments.missingText) {
      row.hostUrl = row.encodedUrl = "";
    }
    else {
      row.hostUrl =  su.urls[su.hostingType](row.copiedId,row.filePath);
      row.encodedUrl = escape (row.hostUrl).replace(/\//g,"%2F");
    }
    return row;
  })
  .getRange(sh.getDataRange())
  .setValues(fiddler.createValues());

}
