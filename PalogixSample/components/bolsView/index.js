'use strict';

var serverURL = "http://palogix.stigasoft.biz/";
    var accessToken = "";
    var authString = "YXBpdXNlcjphcGlwYXNz";
    var contentType = "application/json";

app.bolsView = kendo.observable({
    onShow: function() {loadBolList()}
});

app.singleBolView = kendo.observable({
});

app.bolBinsView = kendo.observable({
});


// START_CUSTOM_CODE_contactsView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
(function () {
   
       var authSource = new kendo.data.DataSource({
          transport: {
            read:  {
              url: serverURL + "api/doAuth",
              type : "POST",
              beforeSend: function (req) {
                        req.setRequestHeader('Content-Type', contentType);
                        req.setRequestHeader('Authorization', "Basic " + authString);
                  }
            },
          },
          schema : {
            type: "json",
            model: {
                fields: {
                    response_code: {type: "string" },
                    msg: [
                             { access_token : { type: "string" } }
                         ]
                }  
            }
          }
        });
        
        authSource.fetch(function(){
          var view = authSource.view();
          accessToken = view[0].msg.access_token; // displays "Jane Doe"
        });
  
})();


function loadBolList()
{
     var bolSource = new kendo.data.DataSource({
      transport: {
        read:  {
          url: serverURL + "api/getAllBol",
          type : "GET",
          beforeSend: function (req) {
                    req.setRequestHeader('Content-Type', contentType);
                    req.setRequestHeader('Authorization', "Bearer " + accessToken);
              }
        },
      },
      schema : {
        data: "msg.data"
      }
    });
    
    app.bolsView.set('dataSource', bolSource);
        
}

function loadSingleBol(e)
{
    var bolid = e.view.params.id; 
    var template = kendo.template($("#bolTemplate").html()); //create template
   
    var singleBolSource = new kendo.data.DataSource({
      transport: {
        read:  {
          url: serverURL + "api/getBol/" + bolid,
          type : "GET",
          beforeSend: function (req) {
                    req.setRequestHeader('Content-Type', contentType);
                    req.setRequestHeader('Authorization', "Bearer " + accessToken);
              }
        },
      },
      schema : {
        type: "json",
        data: "msg.data",
        model: {
            fields: {
                id: { field: "id", type: "string" },
                status: { field: "status", type: "string" },
                from_biz_id: { field: "from_biz_id", type: "string" },
                to_biz_id: { field: "to_biz_id", type: "string" },
                out_date: { field: "out_date", type: "string" },
                in_date: { field: "in_date", type: "string" }
            }
        }
      },
      change: function() {
            $("#bolView").html(kendo.render(template, this.view())); // populate the content
      }
    });
    
    singleBolSource.fetch();
    loadBolBins(bolid);
}

function loadBolBins(bolid)
{
    var template = kendo.template($("#bolBinsTemplate").html()); //create template
    
    var bolSource = new kendo.data.DataSource({
      transport: {
        read:  {
          url: serverURL + "api/getBolBinDetails/" + bolid,
          type : "GET", 
          beforeSend: function (req) {
                    req.setRequestHeader('Content-Type', contentType);
                    req.setRequestHeader('Authorization', "Bearer " + accessToken);
              }
        },
      },
      schema : {
        type: "json",
        data: "msg.data"
      },
      change: function() {
            $("#bolBinView").html(kendo.render(template, this.view())); // populate the content
      }
    });
    bolSource.fetch();
//    app.bolBinsView.set('dataSourceBolBin', bolSource);
    
}

function scanBins(bolid)
{
    
 var that = this;
        if (window.navigator.simulator === true) {
            alert("Not Supported in Simulator.");
        }
        else {
            cordova.plugins.barcodeScanner.scan(
                function(result) {
                    if (!result.cancelled) {
                        //that._addMessageToLog(result.format + " | " + result.text);  
                        //$('#bolbins').val(result.text);
                        document.getElementById('bolbins').value = document.getElementById('bolbins').value + ',' + result.text;
                        that._addMessageToLog(result.text);    
                    }
                }, 
                function(error) {
                    console.log("Scanning failed: " + error);
                });
        }   
}
// END_CUSTOM_CODE_contactsView