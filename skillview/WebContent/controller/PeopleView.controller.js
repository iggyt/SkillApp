sap.ui.controller("controller.PeopleView", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf zit_skill_view_app.PeopleView
*/
	onInit: function() {
		var oHanaModel = new sap.ui.model.odata.ODataModel("model/person.xsodata");
		this.getView().setModel(oHanaModel, "users");
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf zit_skill_view_app.PeopleView
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf zit_skill_view_app.PeopleView
*/
	onAfterRendering: function() {
		this.getView().byId("idPeopleList").getBinding("items").sort([new sap.ui.model.Sorter("SURNAME")]);
	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf zit_skill_view_app.PeopleView
*/
	onExit: function() {
        if(this._oDialog) {
            this._oDialog.destroy();
        }
	},
	
	goBack: function() {
		var app = sap.ui.getCore().byId("app");
		app.back();
	},

	goHome: function () {
	    var app = sap.ui.getCore().byId("app");
	    app.to("idStartView");
	},
	
	openProfile: function() {
		var app = sap.ui.getCore().byId("app");
		app.to("idProfileView");
	},
	
	
	handleSort: function () {
        if(! this._oDialog) {
           this._oDialog = sap.ui.xmlfragment("view.Sorter", this);
        } 
        
        var model = this.getView().getModel("users");
        var topics = model.getServiceMetadata().dataServices.schema[0].entityType[0].property;
        
        var topicsArray = [];
        var sliced = $.grep( topics, function( n, i ) {
        	  return i > 0;
    	});
        
        $.each(sliced, function(index, value) {
        	topicsArray.push({"NAME": value.name});
        });
        var topicsJSON = {"TOPICS": topicsArray};
        
        var sortTopics = new sap.ui.model.json.JSONModel(topicsJSON);
        this._oDialog.setModel(sortTopics);
        
        this._oDialog.open();
	},
	
	handleSelectAsc: function(oEvent) {
        this._ascension = !(oEvent.getSource().getText() === "Ascending");
	},
	
	handleSelectChar: function(oEvent) {
	    this._characteristic = oEvent.getSource().getText();
	},
	
	onDialogSelectButton: function() {
	    var aSorters = [];
	    var peopleList = this.getView().byId("idPeopleList");
	    var binding = peopleList.getBinding("items");
	    var sPath = this._characteristic;
	    aSorters.push(new sap.ui.model.Sorter(sPath, this._ascension));
	    binding.sort(aSorters);
	    this._oDialog.close();
	},
	
	onDialogCancelButton: function() {
	    this._oDialog.close();
	},
	
	onSearch: function (oEvent) {
		var aFilters = [];
	    var peopleList = this.getView().byId("idPeopleList");
	    var binding = peopleList.getBinding("items");

		var sQuery = oEvent.getSource().getValue();
		sQuery = sQuery.toLowerCase();
		if (sQuery && sQuery.length > 0) {
		    var filter1 = new sap.ui.model.Filter("tolower(NAME)", sap.ui.model.FilterOperator.Contains, "'" + sQuery + "'");
		    var filter2 = new sap.ui.model.Filter("tolower(SURNAME)", sap.ui.model.FilterOperator.Contains, "'" + sQuery + "'");
			
		    aFilters.push(filter1);
		    aFilters.push(filter2);
		    binding.filter(new sap.ui.model.Filter(aFilters));
		} else {
		    binding.filter([]);
		}
	},

	photoPath: function (value) {
		var path = "img/" + value + ".png?" + new Date().getTime();
    	var result = '';
    	try {
	    	$.ajax({
	    	    url: path,
	    	    async: false,
	    	    success: function() {
	    	        result = path; 
	    	    },
	    	    error: function() {
	    	        result = "img/nophoto.png";
	    	    }
	    	});
    	} catch(e) {
    		console.log("There was a problem finding photo. Probably it doesn't exist")
    	}
    	
    	return result;
	},

	pictureToProfile: function (oEvent) {
	    var oModel = this.getView().getModel("users");
	    var clickedUser = '';
	    var clickedUserPath = oEvent.getSource().mBindingInfos.src.binding.oContext.sPath;
	    oModel.read(clickedUserPath, {async: false, success: function(oData) {
	    	clickedUser = oData.ID_PERSON;
	    }});
	    sap.ui.getCore().byId("idProfileView").getController().bindProfileValues(clickedUser);
	    var app = sap.ui.getCore().byId("app");
	    app.to("idProfileView");
	},

	goToProfile: function (oEvent) { 
	    var oModel = this.getView().getModel("users");
	    var clickedUser = '';
	    var clickedUserPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.users.sPath;
	    oModel.read(clickedUserPath, {async: false, success: function(oData) {
	    	clickedUser = oData.ID_PERSON;
	    }});
	    
        sap.ui.getCore().byId("idProfileView").getController().bindProfileValues(clickedUser);
        var app = sap.ui.getCore().byId("app");
        app.to("idProfileView");
	},
	
	printView: function() {
	    window.print();
	},
	
	exportToExcel: function() {
	    var peopleList = this.getView().byId("idPeopleList");
	    var dataArray = $.map(peopleList.mBindingInfos.items.binding.oLastContextData, function(value) {
	        return [value];
	    });
	    
	    var data = {};
	    data.content = dataArray;
	    
	    Exporter.exportToExcel(data, "peopleView");
	}

});