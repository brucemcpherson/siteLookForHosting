/**
 * copy the matched files from 
 * sheet created in look for hosting
 * make a new sheet with their new names
 */
function copyHostingFiles () {
  
  // get the data
  var sc = Settings.copy;
  var si = Settings.identify;
  //DriveApp.getFileById(id)
  var du = cUseful.DriveUtils.setService(DriveApp);
  var backoff = cUseful.Utils.expBackoff;
  
  var fiddler = new cUseful.Fiddler();
  
  fiddler.setValues (
    SpreadsheetApp.openById(si.sheetId)
    .getSheetByName(si.sheetFiles)
    .getDataRange()
    .getValues() 
  );
  
  // write the files
  var work = fiddler.getData().map(function (d) {
    // get the folder to write this to
    if (d.folderPath !== si.treatments.missingText) {
      
      // this is where the file is going
      var folder = du.getFolderFromPath(d.folderPath);
      
      // might need to create the receiving folder and its tree
      if (!folder) {
        Logger.log('creating ' + d.folderPath);
        var root = DriveApp;
        d.folderPath.split('/').forEach (function(e,i,a) {
          if (e) {
            var path =  a.slice(0,i+1).join("/");
            folder = du.getFolderFromPath (path);
            if (!folder) {

              folder = backoff (function () {
                return root.createFolder(e);
              });
              
              Logger.log('created ' + du.getPathFromFolder(folder));
            }
            root = folder;
          }  
        });
      }
      // now clear the folder if its required
      if (sc.treatments.clearFolders) {
        var files = backoff (function() {
          return folder.getFiles();
        });
        while(files.hasNext()) {
          return backoff(function() {
            return files.next().setTrashed(true);
          });
        }
      }

      // now copy the file
      var oldFile = du.getFileById(d.originId);
      
      // remove any previous versions of this file name if required
      if (sc.treatments.removePreviousVersions) {
        
        var files = backoff(function () {
          return folder.getFilesByName(d.fileName);
        });
        
        while(files.hasNext()) {
          backoff (function () {
            return files.next().setTrashed(true);
          });
        }
      }
      
      // copy
      var file = backoff(function() {
        return folder.createFile(oldFile.getBlob());
      });
      
      // register
      d.copiedId = file.getId();

    }
    else {
      d.copiedId = si.treatments.missingText;
    }
    return d;
  });


  // write out the result to a new sheet
  var ss = SpreadsheetApp.openById(sc.sheetId);
  var sh = ss.getSheetByName(sc.sheetCopied);
  
  // if if does exist, create it.
  if (!sh) {
    sh = ss.insertSheet(sc.sheetCopied);
  }
  
  // clear it
  sh.clearContents();
  var fileFiddler = new cUseful.Fiddler();
  fileFiddler.setData(work)
  .getRange(sh.getDataRange())
  .setValues(fileFiddler.createValues());
}
