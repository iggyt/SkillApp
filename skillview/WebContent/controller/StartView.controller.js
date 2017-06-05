sap.ui.controller("controller.StartView", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf zit_skill_view_app.StartView
*/
	onInit: function() {
		$.ajax({
			url: "localService/getUser.xsjs",
			type: "GET",
			dataType: "json",
			contentType: "application/json",
			headers: {'X-CSRF-Token':'Fetch'},
			success: function(data, status, xhr) {
				sap.ui.getCore().user = data.user;
				sap.ui.getCore().token = xhr.getResponseHeader('X-CSRF-Token');
			},
			error: function(data) {
				console.log("It was not possible to get user. Error: " + data.message());
			}
			
		});
		
 	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf zit_skill_view_app.StartView
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf zit_skill_view_app.StartView
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf zit_skill_view_app.StartView
*/
//	onExit: function() {
//
//	}
	
	goTo: function(evt) {
		var appka = sap.ui.getCore().byId("app");
		var viewName = evt.getSource().data("navigation");
		switch (viewName) {
		    case "idProfileView":
		        sap.ui.getCore().byId(viewName).getController().bindProfileValues(sap.ui.getCore().user);
		        break;
		    case "idPeopleView":
		    case "idSkillsView":
            default:
		}
		appka.to(viewName);
	},
	
	printView: function() {
	    window.print();
	}

});