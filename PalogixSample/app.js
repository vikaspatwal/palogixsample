'use strict';
var serverURL = "http://palogix.stigasoft.biz/";
var authString = "YXBpdXNlcjphcGlwYXNz";
var contentType = "application/json";

var accessToken="";
var currentDB="";
var isLoggedIn=false;

(function() {
    var app = {
        data: {}
    };

    var bootstrap = function() {
        $(function() {
            app.mobileApp = new kendo.mobile.Application(document.body, {
                skin: 'flat',
                initial: 'components/loginView/view.html'
            });
        });
    };

    if (window.cordova) {
        document.addEventListener('deviceready', function() {
            if (navigator && navigator.splashscreen) {
                navigator.splashscreen.hide();
            }

            var element = document.getElementById('appDrawer');
            if (typeof(element) !== 'undefined' && element !== null) {
                if (window.navigator.msPointerEnabled) {
                    $('#navigation-container').on('MSPointerDown', 'a', function(event) {
                        app.keepActiveState($(this));
                    });
                } else {
                    $('#navigation-container').on('touchstart', 'a', function(event) {
                        app.keepActiveState($(this));
                    });
                }
            }

            bootstrap();
        }, false);
    } else {
        bootstrap();
    }

    app.keepActiveState = function _keepActiveState(item) {
        var currentItem = item;
        $('#navigation-container li a.active').removeClass('active');
        currentItem.addClass('active');
    };

    window.app = app;

    app.isOnline = function() {
        if (!navigator || !navigator.connection) {
            return true;
        } else {
            return navigator.connection.type !== 'none';
        }
    };
}());

// START_CUSTOM_CODE_kendoUiMobileApp
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

function loadMenu()
{  
    if(window.localStorage.getItem("isLoggedIn")=="1")
    {
        document.getElementById('navigation-container').style.display = "inline";
    }
    else
    {
         document.getElementById('navigation-container').style.display = "none";
    }
    
    
}

function CheckResponse(responseCode, errorNumber)
{
    if(responseCode == "200"){
        return true;
    }
    else{
     navigator.notification.alert("Due to technical difficulties your action cannot be completed at this time. Please try again. Error number: " + errorNumber);
     window.localStorage.clear();
     app.mobileApp.navigate("components/loginView/view.html?action=logout");
     return false;
    }    
}

function appAlert(errMsg, redirectToLogin)
{
    navigator.notification.alert(errMsg);
    if(redirectToLogin=="1")
    {
        app.mobileApp.navigate("components/loginView/view.html?action=logout");
        return false;
    }
}

// END_CUSTOM_CODE_kendoUiMobileApp