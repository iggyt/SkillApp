sap.ui.controller("controller.ReportingView", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf zit_skill_view_app.ReportingView
*/
	onInit: function() {
//		var oVizFrame = this.getView().byId("idChart");
//
//		// get the model
//		var oModel = new sap.ui.model.json.JSONModel("http://hxehost:8090/skillview/skillReport.xsjs");
//		
//		var oDataSet = new sap.viz.ui5.data.FlattenedDataset({
//			dimensions: [
//				{
//					name: "Location",
//					value: "{location}"
//				}
//			],
//			measures: [
//			    {
//					name: "Skills",
//					value: "{skill}"
//			    }
//			],
//			data: {path: "/"}
//		});
//		
//		oVizFrame.setDataset(oDataSet);
//		oVizFrame.setModel(oModel);
//		oVizFrame.setVizType("column");
		
//		oVizFrame.setVizProperties({
//			plotArea: {
//				colorPallete: d3.scale.category20().range()
//			}
//		});
//		
//		var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
//			'uid': "valueAxis",
//		      'type': "Measure",
//		      'values': ["Skills"]
//		    }); 
//		var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
//		      'uid': "categoryAxis",
//		      'type': "Dimension",
//		      'values': ["Location"]
//		    });
//		oVizFrame.addFeed(feedValueAxis);
//		oVizFrame.addFeed(feedCategoryAxis);
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf zit_skill_view_app.ReportingView
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf zit_skill_view_app.ReportingView
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf zit_skill_view_app.ReportingView
*/
//	onExit: function() {
//
//	}
	
	/**
	 * Navigates the application back where it came from.
	 */	
	goBack: function() {
		var app = sap.ui.getCore().byId("app");
		app.back();
	},

	/**
	 * Navigates the application to Start view
	 */
	goHome: function() {
	    var app = sap.ui.getCore().byId("app");
	    app.to("idStartView");
	},

});