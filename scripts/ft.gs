
function ft () {
  
  
  // simulate spreadsheet data
  var fiddler = new cUseful.Fiddler();
  
  // you can populate a fiddler like this
  //fiddler.setValues (
  //  SpreadsheetApp.openById(id)
  //  .getSheetByName(name)
  //  .getDataRange()
  //  .getValues() 
  //);
  
  // but I'll just simulate data for the test
  var testData = [
    ['name','id','score'],
    ['john','a',100],
    ['mary','b',200],
    ['john','c',300],
    ['terry','d',200]
  ];
  
  
  // filter out duplicate names, keep the first one.
  // [[name, id, score], [john, a, 100.0], [mary, b, 200.0], [terry, d, 200.0]]
  Logger.log(fiddler
             .setValues (testData)
             .filterUnique ('name')
             .createValues());  
   
  // filter out duplicate names, keep the last one.
  // [[name, id, score], [mary, b, 200.0], [john, c, 300.0], [terry, d, 200.0]]
  Logger.log(fiddler
             .setValues (testData)
             .filterUnique ('name',true)
             .createValues());  
  
  // add a duplicate name and id, but different score
  testData.push (['john','c',400]);
  
  // filter out duplicates where name & id match, keep last one
  //  [[name, id, score], [john, a, 100.0], [mary, b, 200.0], [john, c, 300.0], [terry, d, 200.0]]
  Logger.log(fiddler
             .setValues (testData)
             .filterUnique (['name','id'])
             .createValues()); 
  
  // add a couple of complete duplicate rows
  testData.push (['john','c',400]);
  testData.push (['terry','d',200]);
  // filter out completely duplicated rows
  // [[name, id, score], [john, a, 100.0], [mary, b, 200.0], [john, c, 300.0], [john, c, 400.0], [terry, d, 200.0]]
  Logger.log(fiddler
             .setValues (testData)
             .filterUnique ()
             .createValues()); 
  
  // or as a json object
  //[{score=100.0, name=john, id=a}, {score=200.0, name=mary, id=b}, 
  // {score=300.0, name=john, id=c}, {score=400.0, name=john, id=c}, 
  // {score=200.0, name=terry, id=d}]
  Logger.log(fiddler
             .setValues (testData)
             .filterUnique ()
             .getData()); 
  
  // get unique values
  fiddler.setValues (testData);
  
  // [john, mary, terry]
  Logger.log(fiddler.getUniqueValues("name"));
  // [a, b, c, d]
  Logger.log(fiddler.getUniqueValues("id"));
  // [100.0, 200.0, 300.0, 400.0]
  Logger.log(fiddler.getUniqueValues("score"));
  
  // you would write to a spreadsheet like this
  //  var sh = SpreadsheetApp.openById(id)
  //  .getSheetByName(name)
  // clear it if you want
  //  sh.clearContents();
  // write it out
  //  fiddler.getRange(sh.getDataRange())
  //  .setValues(fiddler.createValues());
  
}
