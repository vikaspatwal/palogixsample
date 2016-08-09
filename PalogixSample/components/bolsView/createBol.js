'use strict';
var newBolSource = ""
var companyData="";
var locationData="";
var contactData="";
var companyType="";
var nextStep = "";

var jsonBolBody = new Object();
var jsonBol = new Object();
var jsonReceipt = new Object();
var jsonSigned = new Object();
var jsonBolBin = new Object();
var jsonCompany = new Object();

app.createBolView = kendo.observable({
    onShow: function() {setUI();},
});

app.companyView = kendo.observable({
});

app.locationView = kendo.observable({
});

app.contactView = kendo.observable({
});


function loadTab(tabnumber)
{
     if(tabnumber===1){
         document.getElementById('page-ui-addCompanies').style.display = "inline";
         document.getElementById('page-ui-bolSummary').style.display = "none";
     }
    else{
         document.getElementById('page-ui-addCompanies').style.display = "none";
         document.getElementById('page-ui-bolSummary').style.display = "inline";
    }
    
    
}

function createBolInIt()
{
    console.log(jsonBolBody);
}

function loadCompanies(type)
{
    companyType = type;
    app.mobileApp.navigate("components/bolsView/Companies.html");
    /*if (type==='sender')
    {
        alert("loading senders");
         getAllCompany();
    }
    
    loadAddCompany();    */
}

function loadAddCompany()
{
    document.getElementById('tblSender').style.display = "none";    
    document.getElementById('tblReceiver').style.display = "none";    
    document.getElementById('tblCarrier').style.display = "none";    
    document.getElementById('selectCompany').style.display = "inline";
}



function loadCompanyList()
{
    //companyType = e.view.params.type;
    //setCurrentDBName();
    // Resetting the previously loaded list on Grid
    //app.bolsView.set('dataSource', "");
    //var bolSource = window.localStorage.getItem("bolListing");
    showLoader();
    nextStep = "Locations";
    if (companyType == "carrier")
    {
        nextStep = "Contacts";
    }

    var companySource;
    if(companySource == null)
    {
        var serviceAPI = "api/getAllCompany";
        if (companyType == "carrier"){
            serviceAPI = "api/getAllCarrier"
        }
        
        companySource  = new kendo.data.DataSource({
              transport: {
                read:  {
                  url: serverURL + serviceAPI,
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
                    CheckResponse(e.xhr.status, "CB0001");
              }
         });
        
        companySource.fetch(function(){
            var view = companySource.view();
            hideLoader();
              //var response_code = view[0].response_code; // displays "Jane Doe"
            //console.log(view[0].msg.total_count);
            CheckResponse(view[0].response_code, "CB0002");
            companyData=view[0].msg.data;
            console.log(companyData);
            //window.localStorage.setItem("bolListing", kendo.stringify(data));
            app.companyView.set('companySource', companyData); 

           /* if(view[0].msg.total_count===0)
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
            }*/

        });
    }
    
}

/*function loadCompanyList(e)
{
    document.getElementById('selectCompany').style.display = "none";
    $.each(companyData, function(i, v) {
        if (v.company_id == companyid) {
            var locationData = v.locations;
            showLocations(locationData);
            //app.locationsView.set('locationSource',locationData);
            //var contactData = v.contacts;
            console.log(locationData);
            return;
        }
    });
   
    
}
*/
function loadLocationsList(e)
{
    var companyid = e.view.params.companyid;
       
    $.each(companyData, function(i, v) {
        if (v.company_id == companyid) {
            locationData = v.locations;
            contactData = v.contacts;
            //console.log(contactData);
            app.locationView.set('locationSource',locationData);
            app.contactView.set('contactSource',contactData);
            return;
        }
    });
}


function loadContactsList(e)
{
    var companyid = e.view.params.companyid;
    if(companyType == "carrier")
    {
         $.each(companyData, function(i, v) {
            if (v.company_id == companyid) {
                //locationData = v.locations;
                contactData = v.contacts;
                //console.log(contactData);
                //app.locationView.set('locationSource',locationData);
                app.contactView.set('contactSource',contactData);
                return;
            }
        });
    }
    
}

function setBolSource(objID, objValue, companyName, locationName, address, cityStateZip, contactName, phone)
{
    if(companyType == "sender")
    {
        
        if(objID=="biz_id")
        {
            jsonBol.from_biz_id = objValue;
            //jsonCompany.lblSenderCompany = companyName;
            $('#lblSenderCompany').text(companyName);
            app.mobileApp.navigate("components/bolsView/Locations.html?companyid=" + objValue);
        }
        else if(objID=="loc_id")
        {
            jsonBol.from_loc_id = objValue;
            $('#lblSenderLocation').text(locationName);
            $('#lblSenderAddress').text(address);
            $('#lblSenderCityStateZip').text(cityStateZip);

            app.mobileApp.navigate("components/bolsView/Contacts.html");
        }
        else if(objID == "contact_id")
        {
            jsonBol.from_contact_id = objValue;
            //var contactText  = (phone == "" ? contactName :  contactName + " " + phone );
            
            $('#lblSenderContact').text(phone == "" ? contactName :  contactName + " " + phone);
            app.mobileApp.navigate("components/bolsView/createBOL.html");
        }
    }
    else if(companyType == "receiver")
    {
         if(objID=="biz_id")
        {
            jsonBol.to_biz_id = objValue;
            $('#lblReceiverCompany').text(companyName);
            app.mobileApp.navigate("components/bolsView/Locations.html?companyid=" + objValue);
        }
        else if(objID=="loc_id")
        {
            jsonBol.to_loc_id = objValue;
            $('#lblReceiverLocation').text(locationName);
            $('#lblReceiverAddress').text(address);
            $('#lblReceiverCityStateZip').text(cityStateZip);
            app.mobileApp.navigate("components/bolsView/Contacts.html");
        }
        else if(objID=="contact_id")
        {
            jsonBol.to_contact_id = objValue;
            $('#lblReceiverContact').text(phone == "" ? contactName :  contactName + " " + phone);
            app.mobileApp.navigate("components/bolsView/createBOL.html");
        }
    }
    else if(companyType == "carrier")
    {
         if(objID=="biz_id")
        {
            jsonBol.carrier_id = objValue;
            $('#lblCarrierCompany').text(companyName);
            app.mobileApp.navigate("components/bolsView/Contacts.html?companyid=" + objValue);
        }
        else if(objID=="contact_id")
        {
            jsonBol.car_contact_id = objValue;
            $('#lblCarrierContact').text(phone == "" ? contactName :  contactName + " " + phone);
            app.mobileApp.navigate("components/bolsView/createBOL.html");
        }
    }
}

function setUI()
{
  /*   alert(companyType);
    alert(jsonBolBody.from_biz_id);
    if(companyType == "sender")
    {
        $('#lblSenderCompany').text("vikas");
         alert("setting "  + jsonCompany.lblSenderCompany);
        if(jsonCompany.lblSenderCompany != undefined)
        {
           
            document.getElementById("lblSenderCompany").innerHTML = jsonCompany.lblSenderCompany;
            //$('#lblSenderCompany').html(jsonCompany.lblSenderCompany);
            //$('#lblSenderCompany').text(jsonCompany.lblSenderCompany);
        }
        
        //document.getElementById("lblSenderCompany").innerHTML = jsonCompany.lblSenderAddress;
    }
    */
}
