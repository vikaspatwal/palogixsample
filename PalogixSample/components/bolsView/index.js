'use strict';

var bolSource;
var bolid="";
var continuousScan=0;
var unsavedScans=0;
var rememberDeleteBin=0;

app.bolsView = kendo.observable({
    onShow: function() {loadBolList()}
});

app.singleBolView = kendo.observable({
});

app.scanView = kendo.observable({
    onShow: function() {}
});

// START_CUSTOM_CODE_loginView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
/*(function () {
})();
*/

function loadBolList()
{
    setCurrentDBName();
    // Resetting the previously loaded list on Grid
    app.bolsView.set('dataSource', "");
    var bolSource = window.localStorage.getItem("bolListing");
    showLoader();
    if(bolSource == null)
    {
        bolSource = new kendo.data.DataSource({
              transport: {
                read:  {
                  url: serverURL + "api/getAllBol",
                  dataType : "json",
                  type : "GET",
                  beforeSend: function (req) {
                            req.setRequestHeader('Content-Type', contentType);
                            req.setRequestHeader('Authorization', "Bearer " + accessToken);
                            req.setRequestHeader('dbSet', currentDB);
                      }
                },
              },
              schema : {
                type: "json",
                model: {
                    fields: {
                        response_code: {type: "string" }
                    }  
                }
              },
              error: function(e) {
                    CheckResponse(e.xhr.status, "20001");
              }
         });
        
        bolSource.fetch(function(){
            var view = bolSource.view();
            hideLoader();
              //var response_code = view[0].response_code; // displays "Jane Doe"
            //console.log(view[0].msg.total_count);
            CheckResponse(view[0].response_code, "20002");
            var data=view[0].msg.data;
            window.localStorage.setItem("bolListing", kendo.stringify(data));
            app.bolsView.set('dataSource', data); 

            if(view[0].msg.total_count===0)
            {
                document.getElementById("lblMessage").innerHTML = "No record found.";
                $('#lblNorecords').css("display","inline");  
            }
            else if(view[0].msg.total_count===100)
            {
                document.getElementById("lblMessage").innerHTML = "Showing last 100 BOLs";
                $('#lblNorecords').css("display","inline");  
            }
            else
            {
                document.getElementById("lblMessage").innerHTML = "";
                $('#lblNorecords').css("display","none");
            }

        });
    }
    else {
        app.bolsView.set('dataSource', JSON.parse(bolSource));
    }
    
}

function loadSingleBol(e)
{
    document.getElementById("bolView").innerHTML = "";
    showLoader();
    bolid = e.view.params.id;
    changeTitle("BOL " + bolid);
    
    var template = kendo.template($("#bolTemplate").html()); //create template
        
    var singleBolSource = new kendo.data.DataSource({
      transport: {
        read:  {
          url: serverURL + "api/getBol/" + bolid,
          type : "GET",
          beforeSend: function (req) {
                    req.setRequestHeader('Content-Type', contentType);
                     req.setRequestHeader('Authorization', "Bearer " + accessToken);
                    req.setRequestHeader('dbSet', currentDB);
              }
        },
      },
      schema : {
        type: "json",
        data: "msg.data",
        model: {
            fields: {
                id: { field: "id", type: "string" },
                status_label: { field: "status_label", type: "string" },
                from_biz_id: { field: "from_biz_id", type: "string" },
                to_biz_id: { field: "to_biz_id", type: "string" },
                out_date: { field: "out_date", type: "string" },
                in_date: { field: "in_date", type: "string" },
                sender_company_name: { field: "sender_company_name", type: "string" },
                receiver_company_name: { field: "receiver_company_name", type: "string" },
            }
        }
      },
      change: function() {
            if(this.view().length===0)
            {
                appAlert("Selected BOL "+ bolid +" not found.","0"); 
                app.mobileApp.navigate("components/bolSearchView/view.html");
            }
            else
            {
                $("#bolView").html(kendo.render(template, this.view())); // populate the content      
            }
            hideLoader();
      },
      error: function(e) {
            CheckResponse(e.xhr.status, "20003");
      }
    });
    singleBolSource.fetch();
    
    //unsavedScans = 0;
    //$('#totalUnsavedScan').css("display","none");
    //console.log(singleBolSource._data);
    //loadBolBins(bolid);
    
}

function redirectToScan(bolid)
{
    app.mobileApp.navigate("components/bolsView/scan.html?id=" + bolid);
    //components/bolsView/scan.html?id=#:data.id#
}




/**************SCAN BOLS *******************/

function loadAssetsListInIt(e)
{
    $('#scanView').css("display","none");
    showLoader();
    bolid=e.view.params.id;
    //changeTitle("SCAN ASSETS FOR "+ bolid);
    
    document.getElementById("lblBolDescription").innerHTML = "BOLID: " + bolid;
    
    var dataSourceAsset = window.localStorage.getItem("Objects");
    if(dataSourceAsset == null)
    {
         dataSourceAsset = new kendo.data.DataSource({
          transport: {
            read:  {
              url: serverURL + "api/getAllObject",
              type : "GET",
              beforeSend: function (req) {
                        req.setRequestHeader('Content-Type', contentType);
                        req.setRequestHeader('Authorization', "Bearer " + accessToken);
                        req.setRequestHeader('dbSet', currentDB);
                  }
            },
          },
          schema : {
            type: "json",
            data: "msg.data",
            model: {
                fields: {
                    obj_id: { field: "obj_id", type: "number" },
                    object_name: { field: "object_name", type: "string" }
                }
            }
          },
          error: function(e) {
            CheckResponse(e.xhr.status, "20004");
          }
        });
        //dataSourceAsset.read();
    }
    
 //   alert(JSON.stringify(dataSourceAsset.data().toJSON));
        dataSourceAsset.fetch(function(){
           var data = dataSourceAsset.data();
            var option = "<option value='0'>Select Asset</option>";
             for (var i=0; i<data.length; i++) {
                option += "<option value='"+data[i].obj_id+"'>"+data[i].object_name+"</option>";
             }
            $('#mySelect').html(option);
            $('#scanView').css("display","inline");
        });
    
 
    var scanButton = document.getElementById("scanButton");
    scanButton.addEventListener("click",
                                    function() { 
                                        scanBins(0); 
                                    });
    
    var mySelect = document.getElementById("mySelect");
    mySelect.addEventListener("change",
                                    function() { 
                                        loadBolObjectBins(bolid); 
                                    });
    
    var btnUpdateBins = document.getElementById("btnUpdateBins");
    btnUpdateBins.addEventListener("click",
                                    function() { 
                                        updateBolBins(bolid); 
                                    });
    
    var btnCancel = document.getElementById("btnCancelScan");
    btnCancel.addEventListener("click",
                                    function() { 
                                        loadBolBins(bolid); 
                                    });
    
    //alert(document.getElementsByClassName('km-view-title').innerHtml);
    //$("#navbar").data("kendoMobileNavBar").title("SCAN ASSETS FOR " + bolid);
}

function loadBolBinsScan(e){
    document.getElementById("lblBolDescription").innerHTML = "BOLID: " + bolid;
    loadBolBins(e.view.params.id);
}

var scantemplate;
var scannedBinDataSource; // = new kendo.data.DataSource();

/*scannedBinDataSource.bind("change", function(e) { 
    var html = kendo.render(scantemplate, this.view());
    $("#bolBinView").html(html);
  });
*/

function loadBolBins(bolid)
{
    showLoader();

    //var template = kendo.template($("#bolBinsTemplate").html()); //create template
     scantemplate = kendo.template($("#scantemplate").html());

    scannedBinDataSource = new kendo.data.DataSource({
      transport: {
        read:  {
          url: serverURL + "api/getBolBinDetails/" + bolid,
          type : "GET", 
          beforeSend: function (req) {
                    req.setRequestHeader('Content-Type', contentType);
                    req.setRequestHeader('Authorization', "Bearer " + accessToken);
                    req.setRequestHeader('dbSet', currentDB);
              }
        },
      },
      schema : {
        type: "json",
        data: "msg.data"
      },
      change: function() {
            $("#bolBinView").html("<div class='rTable' style='width:100%'><div class='rTableHeading'><div class='rTableHead rTableHeadEdgeLeft'>Asset</div><div class='rTableHead'>BinID</div><div class='rTableHead rTableHeadEdgeRight'>&nbsp;</div></div><div class='rTableBody'>" + kendo.render(scantemplate, this.view()) + "</div></div>"); // populate the content
            hideLoader();
            //$("#bolTitle").html('BOL ' + bolid);
      }
    });
    scannedBinDataSource.fetch();
    activateDeactivateActionButtons(0);
}


function loadBolObjectBins(bolid)
{
    console.log(bolid);
    console.log(document.getElementById("mySelect").value);
}


 
function scanBins(resetContinuousScan)
{
    continuousScan = resetContinuousScan;
    
        if (window.navigator.simulator === true) {
            alert("Not Supported in Simulator. Adding dummy records to datasource.");
            var obj_id = $('#mySelect').val();
            var obj_name;
            
            if (obj_id == 0){
                obj_id = null;
                obj_name = "N/A";
            }
            else
                obj_name = $('#mySelect option:selected').text();
            
            var dataFromList = scannedBinDataSource.data();
                var alreadyExists = false;
                for (var item in dataFromList) {
                    if (dataFromList[item].bin_id == "autoscan1") {
                      alreadyExists = true;
                      break;
                  }
                }
            
            if(alreadyExists){
                 appAlert("Error! Scanned BIN ID 'autoscan1' already exists.");
            }
            else{
                unsavedScans = unsavedScans + 1;
                            
                document.getElementById("totalUnsavedScan").innerHTML = unsavedScans + " unsaved scans. Click 'Save' icon to save.";
                
                scannedBinDataSource.insert(0,{
                          obj_id: obj_id,
                          obj_name: obj_name,
                          bin_id: "autoscan1"
                        });

                activateDeactivateActionButtons(1);
            }
        }
        else {
            cordova.plugins.barcodeScanner.scan(
                function(result) {
                    if (!result.cancelled) {
                        var newbinid = result.text;
                        //$("#bolBinView").append("<div class='bolbinrow'>"+ result.text +"</div><div class='bolbindeleterow'>[X]</div>");
                        //newbinids = newbinid + "," + newbinids;
                        var obj_id = $('#mySelect').val();
                        var obj_name;
                        
                        if (obj_id == 0){
                            obj_id = null;
                            obj_name = "N/A";
                        }
                        else
                            obj_name = $('#mySelect option:selected').text();
                        
                        var dataFromList = scannedBinDataSource.data();
                        var alreadyExists = false;
                        for (var item in dataFromList) {
                            if (dataFromList[item].bin_id == newbinid) {
                              alreadyExists = true;
                              break;
                          }
                        }
                    
                        if(alreadyExists){
                             window.navigator.notification.confirm(
                                    "Error! Scanned BIN ID '"+ newbinid +"' already exists.", // the message
                                    function( index ) {
                                        switch ( index ) {
                                            case 1:// The third button was pressed
                                                scanBins(1);
                                            case 2:// The second button was pressed
                                                break;
                                        }
                                    },
                                    "Duplicate Scan", // a title
                                    [ "Got it! Continue Scanning", "Cancel"]    // text of the buttons
                                );
                        }
                        else{
                            scannedBinDataSource.insert(0,{
                              obj_id: obj_id,
                              obj_name: obj_name,
                              bin_id: newbinid
                            });
                            
                            unsavedScans ++;
                            document.getElementById("totalUnsavedScan").innerHTML = "* Total unsaved scans: " + unsavedScans + ". Please click on 'Save' icon to save bins.";
                            activateDeactivateActionButtons(1);
                            
                           /*
                            scannedBinDataSource.add({
                              obj_id: $('#mySelect').val(),
                              obj_name: $('#mySelect option:selected').text(),
                              bin_id: newbinid
                            });
                            */
                            if(continuousScan==1) {
                                scanBins(1);
                            }
                            else
                            {
                                 window.navigator.notification.confirm(
                                    "", // the message
                                    function( index ) {
                                        switch ( index ) {
                                            case 1:// The first button was pressed
                                                break;
                                            case 2:// The second button was pressed
                                                scanBins(0);
                                                break;
                                            case 3:// The third button was pressed
                                                scanBins(1);
                                        }
                                    },
                                    "Scan another bin?", // a title
                                    [ "No", "Yes", "Yes, don't ask again" ]    // text of the buttons
                                );
                            }
                        }
                    }
                }, 
                function(error) {
                    alert(error);
                    console.log("Scanning failed: " + error);
                });
        }   
}



function updateBolBins(bolid)
{
    showLoader();
    var jsonBolBinBody = new Object();
    jsonBolBinBody.bolid = bolid;
    jsonBolBinBody.binids = scannedBinDataSource.view();
    
         var updateBolBinSource = new kendo.data.DataSource({
          transport: {
            read:  {
              url: serverURL + "api/createBolBinDetails",
              dataType : "json",
              type : "POST",
              data: jsonBolBinBody,
              beforeSend: function (req) {
                        req.setRequestHeader('Content-Type', contentType);
                        req.setRequestHeader('Authorization', "Bearer " + accessToken);
                        req.setRequestHeader('dbSet', currentDB);
                  },
            },
            parameterMap: function(data, type) { 
              return kendo.stringify(data);
            }
          },
          schema : {
            type: "json",
            model: {
                fields: {
                    response_code: {type: "string" }
                }  
            }
          },
          error: function(e) {
               CheckResponse(e.xhr.status, "20006");
          }
     });
        
    
     updateBolBinSource.fetch(function(){
         var view = updateBolBinSource.view();
         hideLoader();
         if(view[0].msg == "success"){
                appAlert("Assets updated successfully.","0"); 
                activateDeactivateActionButtons(0)
         }
         else{
                appAlert(view[0].msg,"0");    
         }

         console.log(view);
        });
    
    
}

function confirmDeleteBin(bolid, binid)
{
    if(rememberDeleteBin===0){
        window.navigator.notification.confirm(
                                        "Are you sure, you want to delete?", // the message
                                        function( index ) {
                                            switch ( index ) {
                                                case 1:// The first button was pressed
                                                    break;
                                                case 2:// The second button was pressed
                                                    deleteBin(bolid,binid);
                                                    break;
                                                case 3:// The third button was pressed
                                                    rememberDeleteBin = 1;
                                                    deleteBin(bolid,binid);
                                                    break;
                                            }
                                        },
                                        "Confirm Delete", // a title
                                        [ "No", "Yes", "Yes, don't ask again" ]    // text of the buttons
        );
    }
    else{
        deleteBin(bolid, binid)
    }
    
}

function deleteBin(bolid, binid){
    
    var bolBinToDelete = new Object();
    bolBinToDelete.bolid = bolid;
    bolBinToDelete.binids = [binid];
    
    //console.log(kendo.stringify(bolBinToDelete));
    //return;
    
    var deleteBolBinSource = new kendo.data.DataSource({
          transport: {
            read:  {
              url: serverURL + "api/deleteBolBinDetails",
              dataType : "json",
              type : "DELETE",
              data: bolBinToDelete,
              beforeSend: function (req) {
                        req.setRequestHeader('Content-Type', contentType);
                        req.setRequestHeader('Authorization', "Bearer " + accessToken);
                        req.setRequestHeader('dbSet', currentDB);
                  },
            },
            parameterMap: function(data, type) { 
              return kendo.stringify(data);
            }
          },
          schema : {
            type: "json",
            model: {
                fields: {
                    response_code: {type: "string" }
                }  
            }
          },
          error: function(e) {
               CheckResponse(e.xhr.status, "20005");
          }
     });
     
    
     deleteBolBinSource.fetch(function(){
          var view = deleteBolBinSource.view();
          //var response_code = view[0].response_code; // displays "Jane Doe"
         var data = view[0].msg.data;
         console.log(view);
        });
    
    var raw = scannedBinDataSource.data();
    var length = raw.length;

    // iterate and remove "done" items
    var item, i;
    for(i=0; i<=length; i++){
      item = raw[i];
      console.log(item.bin_id + " == " + binid);
      if (item.bin_id == binid){
        scannedBinDataSource.remove(item);
          return;
      }
        
    }
        
    
}

function activateDeactivateActionButtons(activate)
{   
    if(activate===1){
        $('#btnUpdateBins').css("display","inline");
        $('#btnUpdateBinsDisabled').css("display","none");
        $('#btnCancelScan').css("display","inline");
        $('#btnCancelScanDisabled').css("display","none");
        $('#totalUnsavedScan').css("display","inline");
    }
    else{
        $('#btnUpdateBins').css("display","none");
        $('#btnUpdateBinsDisabled').css("display","inline");
        $('#btnCancelScan').css("display","none");
        $('#btnCancelScanDisabled').css("display","inline");
        unsavedScans = 0;
        $('#totalUnsavedScan').css("display","none");
    }
    
}
// END_CUSTOM_CODE_loginView