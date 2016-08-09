'use strict';

app.loginView = kendo.observable({
    onShow: processAction,
    afterShow: function() {hideLoader();}
});

// START_CUSTOM_CODE_homeView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
(function () {
    //app.loginView.set('title', 'Login page to appear here'); 
    //$("btnlogout").style.display = "none";
    //getAccessToken();
    //accessToken="de88f817be7b87ac93705c0e0b4e78b1";
    
    
})();


// START_CUSTOM_CODE_loginView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
function getAccessToken() {

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
          window.localStorage.setItem("accessToken", accessToken);
        });

}


function login()
{
    showLoader();
    var encodedUsername="";
    var encodedPassword="" ;
    
    if(window.localStorage.getItem("rememberme")=="1")
    {
        encodedUsername = window.localStorage.getItem("username");   
        encodedPassword = window.localStorage.getItem("password"); 
        document.getElementById('chkRememberMe').checked = true;
    }
    else
    {
        encodedUsername = document.getElementById('txtUsername').value;   
        encodedPassword = document.getElementById('txtPassword').value;    
    }
    
    //var postBody = {"username": "rliebesman@palogix.com", "password": "Kunx2me"}
    //alert(accessToken);
    var args = new Object();
    //args.username = "rliebesman@palogix.com";
    //args.password = "Kunx2me";
    args.username = encodedUsername;
    args.password = encodedPassword;
    
     var loginSource = new kendo.data.DataSource({ 
          transport: {
            read:  {
              url: serverURL + "api/doLogin",
              dataType : "json",
              type : "POST",
              data: args,
              beforeSend: function (req) {
                        req.setRequestHeader('Content-Type', contentType);
                        //req.setRequestHeader('Authorization', "Bearer " + accessToken);
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
               CheckResponse(e.xhr.status, "10003");
          }
     });
        
    
     loginSource.fetch(function(){
          
         var view = loginSource.view();
         hideLoader();         
         CheckResponse(view[0].response_code, "10001");
         
         if (view[0].msg.data === undefined) {
            appAlert(view[0].msg,"0");
            return false; 
         }
         
         
         var data = view[0].msg.data;
         accessToken = view[0].msg.access_token;
         console.log(accessToken);
    
         window.localStorage.setItem("accessToken", accessToken); 
         window.localStorage.setItem("isLoggedIn", "1");
         rememberMe(encodedUsername,encodedPassword);
         // Making sure we have access to write to local storage.    
         if(window.localStorage.getItem("accessToken") == "") {
             appAlert("Problem getting Access Token from the server. Error number: 10002.", "1");
             return false;
         }

         if(data.length == 1){
             setCurrentDB(data[0].abrev);
             return false;
         }

         document.getElementById('page-ui-login').style.display = "none";
         document.getElementById('page-ui-dblisting').style.display = "inline";
         
         //$("#navbar").data("kendoMobileNavBar").title("SELECT DATABASE");
         changeTitle("SELECT DATABASE");
         document.getElementById('btnlogout').style.display = "inline";
         app.loginView.set('dataSource', data);
        });
    
    
    //app.mobileApp.navigate("components/bolsView/list.html");
}

function setCurrentDB(curdb, currentDBName)
{
    window.localStorage.removeItem("bolListing");
    window.localStorage.setItem("currentDB", curdb);
    currentDB = curdb;
    dbName = currentDBName;
    app.mobileApp.navigate("components/bolsView/list.html");
    loadMenu();
}

function processAction(e)
{
    document.getElementById('btnlogout').style.display = "none";
    if(e.view.params.action=="changedb")
    {
        document.getElementById('page-ui-login').style.display = "none";
        document.getElementById('page-ui-dblisting').style.display = "inline";
        document.getElementById('btnlogout').style.display = "inline";
    }
    else if(e.view.params.action=="logout")
    {
        logout();
    }
    else{
        if(window.localStorage.getItem("rememberme") == "1"){
            login();
        }
    }
    
    loadMenu();
    
}

function logout()
{
    window.localStorage.clear();
    document.getElementById('page-ui-login').style.display = "inline";
    document.getElementById('page-ui-dblisting').style.display = "none";
    document.getElementById('btnlogout').style.display = "none";   
    accessToken="";
    currentDB="";
    dbName="";
    isLoggedIn=false;
    hideLoader();
}

function rememberMe(username,password)
{
     if(document.getElementById('chkRememberMe').checked){
         window.localStorage.setItem("rememberme", "1");
         window.localStorage.setItem("username", username);
         window.localStorage.setItem("password", password);
     }
     else{
         window.localStorage.removeItem("rememberme");
         window.localStorage.removeItem("username");
         window.localStorage.removeItem("password");
    }
}


// END_CUSTOM_CODE_homeView