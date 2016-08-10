var Settings = (function(ns) {
  
  ns.sites = {
    useCache:true,                             // whether to use cache for folder maps
    cacheSeconds:60*60,                        // how long to allow cache for
    search:"",                                 // enter a search term to concentrate on particular pages
    siteName:"share",                          // site name
    domain:"mcpher.com",                       // domain
    maxPages:0,                                // max pages - start low to test
    maxChunk:200                               // max children to read in one go
  };
  
  ns.report = {
    sheetId:"1Ef4Ac5KkipxvhpcYCe9C_sx-TnD_kvV2E_a211wS6Po",  // sheet id to write to
    sheetName:'site'                                         // sheetName to write to
  };
   
  return ns;
})(Settings || {});

