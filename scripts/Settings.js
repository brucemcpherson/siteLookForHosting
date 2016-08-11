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
      path:"/hosting/{mime}/",                    // template for file path  can be  {id}-{name}-{drivePath}-{mime}
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
    hostingType:'drive',
    urls: {
      drive:function(id) { 
         return "https://drive.google.com/uc?id=" + id ;
      }
    }
  };
                
  return ns;
})(Settings || {});

