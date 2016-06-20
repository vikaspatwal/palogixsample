'use strict';

app.bolSearchView = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});

// START_CUSTOM_CODE_bolSearchView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
(function () {
})();

function searchBOL()
{
    app.mobileApp.navigate("components/bolsView/viewBol.html?id=" + document.getElementById('txtBOL').value);
}
// END_CUSTOM_CODE_bolSearchView