// server.js
// where your node app starts

// We're going to use the "Product Catalog and Orders" base template:
// https://airtable.com/templates/featured/expZvMLT9L6c4yeBX/product-catalog-and-orders
var Airtable = require("airtable");
var base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);
var tableName = "Cold_War";
var viewName = "Grid view";

var express = require("express");
var app = express();
const mustacheExpress = require("mustache-express");
app.engine("html", mustacheExpress());

app.set("view engine", "html");
app.set("views", __dirname + "/views");

// http://expressjs.com/en/starter/static-files.html
//app.use(express.static("public"));
app.use(express.static(__dirname + "/public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  // Old
  //response.sendFile(__dirname + "/views/index.html");
  // New
  /*  
   This is where we're calling the template, and passing our sample data along.
  */
  const sample_data = {
    //page: "practice"
    viewall: false
  };
  response.render("index.html", sample_data);
});

// Added 2020-07-28: Practice mode? -JJ
app.get("/all", function(request, response) {
  const sample_data = {
    viewall: true
  };
  //response.sendFile(__dirname + "/views/index.html");
  response.render("index.html", sample_data);
});

app.get("/data/group/:groupName", function(request, response) {
  response.send(request.params);
});

app.get("/data/person/:personName", function(request, response) {
  response.send(request.params);
});

// Cache the records in case we get a lot of traffic.
// Otherwise, we'll hit Airtable's rate limit.
var cacheTimeoutMs = 5 * 1000; // Cache for 5 seconds.
var cachedResponses = {};
var cachedResponseDates = {};

function getCachedData(endpoint, response) {
  if (
    cachedResponses["data"] &&
    new Date() - cachedResponseDates["data"] < cacheTimeoutMs
  ) {
    response.send(cachedResponses["data"]);
  } else {
    // Select records from the view.
    base(tableName)
      .select({
        //maxRecords: 10,
        view: viewName
      })
      .firstPage(function(error, records) {
        if (error) {
          response.send({ error: error });
        } else {
          cachedResponses["data"] = {
            records: records.map(record => {
              return {
                name: record.get("Name"),
                full_name: record.get("Stands_For"),
                desc: record.get("Short_Description"),
                notes: record.get("Notes"),
                type: record.get("Entity_Type")
              };
            })
          };
          cachedResponseDates["data"] = new Date();

          response.send(cachedResponses["data"]);
        }
      });
  }
}

app.get("/data", function(_, response) {
  getCachedData("data", response);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
