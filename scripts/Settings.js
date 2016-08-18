var Settings = (function(ns) {
  
  ns.sites = {
    search:"",                                 // enter a search term to concentrate on particular pages
    siteName:"share",                          // site name
    domain:"mcpher.com",                       // domain
    maxPages:0,                                // max pages - start low to test
    maxChunk:200                               // max children to read in one go
  };
  
  ns.report = {
    sheetId:"19kXFMUh0DNTde_qtvsZ6FH4dAJ4YDCJhIJroLNT3vGY",         // sheet id to write to
    sheetName:'site-' + ns.sites.domain + '-' + ns.sites.siteName,  // sheetName to write to
    sheetHosting:'hosting-' + ns.sites.domain + '-' + ns.sites.siteName
  };


  
  ns.identify = {
    sheetId:ns.report.sheetId,                  // where to write the results
    sheetFiles:"identify-" + ns.report.sheetHosting,
    treatments: {
      fileName:"{name}",                          // template for output file name - can be {id}-{name}
      path:"/public/hosting/sites/xliberation/{mime}/",             // template for file path  can be  {id}-{name}-{drivePath}-{mime}
      failOnMissing:false,                        // whether to fail if file is missing
      missingText:"MISSING"
    } 
  };
                
  ns.copy = {
    sheetId:ns.report.sheetId,                  // where to write the summary
    sheetCopied:"copy-" + ns.report.sheetHosting,
    treatments: {
      removePreviousVersions:true,
      clearFolders:false
    }
  };


  ns.host = {
    sheetId:ns.report.sheetId,
    sheetName:'drive-' + ns.report.sheetHosting,
    hostingType:'gcs',
    urls: {
      drive:function(id,path) { 
        return "https://drive.google.com/uc?id=" + id ;
      },
      gcs:function (id,path) {
        return "https://storage.googleapis.com/goinggas.com" + path;
      }
    }
  };

  ns.update = {
    testMode:{
      active:true,
      sampleRate:.01,
      testStub:'rubbishfortesting',
      deleteBefore:true,
      reportDiffs:true
    }
  };

ns.mimeShorts = function (mime) {
  var shorts = {
    "application/vnd.google-apps.script+json":"google",
    "application/vnd.google-apps.script":"google",
    "application/vnd.google-apps.folder":"google",
    "application/vnd.google-apps.audio":"media",
    "application/vnd.google-apps.document":"google",
    "application/vnd.google-apps.drawing":"google",
    "application/vnd.google-apps.file":"google",
    "application/vnd.google-apps.form":"google",
    "application/vnd.google-apps.photo":"media",
    "application/vnd.google-apps.presentation":"google",
    "application/vnd.google-apps.sites":"google",
    "application/vnd.google-apps.fusiontable":"google",
    "application/vnd.google-apps.spreadsheet":"google",
    "application/vnd.google-apps.unknown":"google",
    "application/vnd.google-apps.video":"media",
    "application/xml":"xml",
    "text/xml":"xml",
    "application/json":"json",
    "application/pdf":"pdf",
    "image/png":"image",
    "image/jpeg":"image",
    "image/gif":"image",
    "text/javascript":"js",
    "text/css":"css",
    "video/avi":"media",
    "video/mpeg":"media",
    "text/plain":"text",
    "video/quicktime":"media",
    "text/html":"markup",
    "image/bmp":"image",
    "image/x-icon":"image",
    "image/tiff":"tiff"
  };
  mime = mime.toLowerCase();
  return shorts[mime]  || mime;
  
};
                
  return ns;
})(Settings || {});

