/**
 * copy the matched files from 
 * sheet created in look for hosting
 * make a new sheet with their new names
 */
function identifyHostingFiles () {
  
  // get the data
  var sr = Settings.report;
  var si = Settings.identify;
  //DriveApp.getFileById(id)
  var du = cUseful.DriveUtils.setService(DriveApp);
  var fiddler = new cUseful.Fiddler();
  
  fiddler.setValues (
    SpreadsheetApp.openById(sr.sheetId)
    .getSheetByName(sr.sheetHosting)
    .getDataRange()
    .getValues() 
  );
  
  // map the file names
  var work = fiddler.getData().reduce(function (p,c) {
    
    // this may be a folder/filename kind of deal
    if (!p.files.hasOwnProperty(c.id + c.fileName)) {
      
      // now find the file
      var file = du.getFileById (c.id);
      var fob = p.files[c.id+c.fileName] = { 
        id:c.id,
        givenName:c.fileName
      };
      fob.referenceCount = 0;
      if (file) {
        // if its the folder/name model, then we're not yet done
        if (c.fileName && du.getShortMime(file.getMimeType()) !== "folder") {
          // this is going to be a missing file
          file = null;
        }
        else if (du.getShortMime(file.getMimeType()) === "folder") {
          // in this cae the id refers to the parent.
          var folder = DriveApp.getFolderById(file.getId());
          file = folder.getFilesByName(c.fileName);
          if (!file.hasNext()) {
            file = null;
          }
          else {
            file = file.next();
          }
        }
      }
      
      if (file) {
        fob.originId = file.getId();
        fob.name = file.getName();
        fob.path = du.getPathFromFolder(file.getParents().next());
        
        // set up the new names and paths
        fob.fileName = si.treatments.fileName
        .replace(/\{id\}/g,fob.id)
        .replace(/\{name}/g,fob.name);
        
        fob.folderPath = si.treatments.path
        .replace(/\{id\}/g,fob.id)
        .replace(/\{drivePath}/g,fob.path)
        .replace(/\{mime}/g,du.getShortMime(file.getMimeType()));
        
        fob.filePath = fob.folderPath + fob.fileName;
        
        // what to do if we already have this file path?
        if (p.paths.hasOwnProperty(fob.filePath)) {
          if (p.paths[fob.filePath].id !== file.getId()) {
            throw new Error('Would create ambigous filepath for ' + file.getId() + ' ' + fob.filePath);
          }
        }
        else {
          p.paths[fob.filePath] = file.getId();
        }
        
      }
      else {
        if (si.treatments.failOnMissing) {
          throw new Error ('cant find file id ' + c.id + " " + c.fileName);
        }
        fob.name = fob.path = fob.filePath = fob.fileName = fob.folderPath = fob.originId = si.treatments.missingText;
      }

    }
    p.files[c.id+c.fileName].referenceCount++;

    return p;
  },{files:{}, paths:{}});
  
  // copy them to new location
  
  // write out the result to a new sheet
  var ss = SpreadsheetApp.openById(si.sheetId);
  var sh = ss.getSheetByName(si.sheetFiles);
  
  // if if does exist, create it.
  if (!sh) {
    sh = ss.insertSheet(si.sheetFiles);
  }
  
  // clear it
  sh.clearContents();
  var fileFiddler = new cUseful.Fiddler();
  fileFiddler.setData(Object.keys(work.files).map(function(k) {
    return work.files[k];
  }))
  .filterColumns(function (name) {
    // get rid of stuff not required
    return name !== "url" && name !== "index";
  })
  .getRange(sh.getDataRange())
  .setValues(fileFiddler.createValues());
}
