'use strict';

app.bolSearchView = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});

// START_CUSTOM_CODE_bolSearchView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
(function () {
    app.bolSearchView.set('title', 'Settings');
})();
// END_CUSTOM_CODE_bolSearchView