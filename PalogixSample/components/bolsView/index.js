'use strict';

var serverURL = "http://palogix.stigasoft.biz/";
    var accessToken = "";
    var authString = "YXBpdXNlcjphcGlwYXNz";
    var contentType = "application/json";

app.bolsView = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
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
    
    authSource = new kendo.data.DataSource({
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
   
    
    
    //alert(authSource.read());
    
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
    
  
})();


function singleBolInit(e)
{
    var bolid = e.view.params.id; 
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
          data: function(data) {              // the data which the data source will be bound to is in the values field
                console.log(data.msg.data);
                return data.msg.data;
            }
      }
    });
    console.log(bolid);
    console.log(singleBolSource);
    
    singleBolSource.fetch(function(){

            console.log(singleBolSource);
    });
   
    
}
// END_CUSTOM_CODE_contactsView