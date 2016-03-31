'use strict';

app.bolsView = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});

// START_CUSTOM_CODE_contactsView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
(function () {
    app.bolsView.set('title', 'Bols');

/*    var authSource = new kendo.data.DataSource({
      transport: {
        read:  {
          url: "http://palogix.stigasoft.biz/api/doAuth",
          dataType: "jsonp", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
          type : 'POST'
        },
      },
    });
    
    alert(JSON.stringify(authSource.read()));
    */
    var dataSource = new kendo.data.DataSource({
      transport: {
        read:  {
          url: "http://demos.telerik.com/kendo-ui/service/products",
          dataType: "jsonp"/*, // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
          data: { number: selectedCell[0] }*/
        },
      },
      schema: {
        model: {
                id: "ProductID",
                fields: {
                        "ProductName": {
                            type: "string"
                        },
                        "UnitPrice": {
                            type: "number"
                        },
                        "UnitsInStock": {
                                type: "number"
                            },
                    }
            
               }
      }
    });
    
    app.bolsView.set('dataSource', dataSource);
    
  
})();
// END_CUSTOM_CODE_contactsView