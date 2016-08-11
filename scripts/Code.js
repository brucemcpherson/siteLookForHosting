/**
 * look for places that hosting is being used in site pages
 */
function lookForHosting() {
  
  var se = Settings.sites;
  var sr = Settings.report;
  var fiddler = new cUseful.Fiddler();
  
  // get your site
  var site = SitesApp.getSite(se.domain,se.siteName);
  var pages = getAllPages (site);
  
  // getalldescendants doesnt work properly, so I need to do this as a tree
  function getAllPages (root, pages) {
    // store the pages here
    pages = pages || [];
    
    // get all the children taking account of max chunks and pages so far
    for (var chunk, chunks = [];  
         (!se.maxPages || pages.length + chunks.length < se.maxPages) && 
           (chunk = cUseful.Utils.expBackoff(function (d) {
               return root.getChildren({
                 start:chunks.length,
                 search:se.search,
                 max:se.maxPages ? Math.min(se.maxPages - pages.length + chunks.length, se.maxChunk) : se.maxChunk
               }) 
           })
        ).length; Array.prototype.push.apply (chunks , chunk)) {}
    
    // recurse for all the children of them.
    chunks.forEach (function (d) {
      pages.push (d);
      getAllPages (d , pages);
    });
    
    return pages;
  
  }
  
  Logger.log(pages.length + ' pages in site');
  
  // find those with hosted stuff
  var work = pages.map(function (d) {
    
    // get the content
    var html = cUseful.Utils.expBackoff ( function () {
      return d.getHtmlContent();
    });
    
    // set up the regex for execution
    var rx = /https(?:(?:%3A%2F%2F)|(?:\:\/\/))googledrive\.com(?:(?:%2F)|(?:\/))host(?:(?:\/)|(?:%2F))([\w-]{8,})(\/[\w\.-]+)?/gmi

    // store the matches on this pages
    var match,matches=[];
    while (match = rx.exec(html)) {
      matches.push ({
        id:match[1],
        fileName: match.length > 2  && match[2]  && match[2].slice(0,1) === "/" ? match[2].slice(1) : "",
        match:match[0]
      });
    }
    
    // the description of the match
    return matches.length ? {
      matches:matches,
      name:d.getName(),
      url:d.getUrl()
    } : null;
    
  })
  .filter (function (d) {
    return d;
  });

  Logger.log(work.length + ' pages in site with hosting');
  
  // write to a sheet
  var ss = SpreadsheetApp.openById(sr.sheetId);
  var sh = ss.getSheetByName(sr.sheetHosting);
  
  // if if does exist, create it.
  if (!sh) {
    sh = ss.insertSheet(sr.sheetHosting);
  }
  
  // clear it
  sh.clearContents();
  
  // set up the data to write to a sheet
  if (work.length) {
    fiddler.setData (work.reduce(function(p,c) {
      // blow out the records to one per match
      Array.prototype.push.apply (p , c.matches.map(function(d,i) {
        return {
          name:c.name,
          url:c.url,
          index:i,
          id:d.id,
          fileName:d.fileName,
          match:d.match
        };
      }));
      return p;
    },[]).sort(function (a,b) {
      return a.url > b.url ? 1 : ( a.url < b.url ? -1 : 0);
    }))
    .getRange(sh.getDataRange())
    .setValues(fiddler.createValues());
    
    Logger.log(fiddler.getData().length + ' hosting changes need to be made');
    
    // lets also write a summary sheet of pages on the site that need to be worked
    var sh = ss.getSheetByName(sr.sheetName);
    
    // if if does exist, create it.
    if (!sh) {
      sh = ss.insertSheet(sr.sheetName);
    }
    
    // clear it
    sh.clearContents();
    
    fiddler.setData(work)
    .mapRows(function (row) {
      row.matches = row.matches.length;
      return row;
    })
    .getRange(sh.getDataRange())
    .setValues(fiddler.createValues());
    
  }

 
}
