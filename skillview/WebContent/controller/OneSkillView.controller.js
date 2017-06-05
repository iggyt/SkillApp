sap.ui.controller("controller.OneSkillView", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf zit_skill_view_app.OneSkillView
     */
    //	onInit: function() {
    //
    //	},

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf zit_skill_view_app.OneSkillView
     */
    // 	onBeforeRendering: function() {
    // 		this.handleFacetFilterReset();
    // 	},

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf zit_skill_view_app.OneSkillView
     */
    	onAfterRendering: function() {
    		this.getView().byId("peopleWithSkillList").getBinding("items").sort([new sap.ui.model.Sorter("NAME")]);
    	},

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf zit_skill_view_app.OneSkillView
     */
    //	onExit: function() {
    //
    //	}
    
//    getLocation: function(value) {
//		var locationText = "";
//		switch(value) {
//	    	case 1: locationText = "Bratislava"; break;
//	    	case 2: locationText = "Bucharest"; break;
//	    	case 3: locationText = "Prague"; break;
//	    	default: locationText = "No location info";
//		}
//		return locationText;
//	},

    handleSort: function () {
        if(! this._oDialog) {
           this._oDialog = sap.ui.xmlfragment("view.Sorter", this);
        } 
        
        var model = this.getView().getModel("users");
        var topics = Object.keys(model.getData().results[0].Person);
        
        var topicsArray = [];
        var sliced = $.grep( topics, function( n, i ) {
        	  return i > 1;
    	});
        
        $.each(sliced, function(index, value) {
        	topicsArray.push({"NAME": value});
        });
        
        topicsArray.push({"NAME": "PROFICIENCY"});
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
	    var peopleList = this.getView().byId("peopleWithSkillList");
	    var binding = peopleList.getBinding("items");
	    if (this._characteristic == 'PROFICIENCY') {
	    	var sPath = this._characteristic;
	    } else {
	    	var sPath = "Person/" + this._characteristic;
	    }
	    
	    aSorters.push(new sap.ui.model.Sorter(sPath, this._ascension));
	    binding.sort(aSorters);
	    this._oDialog.close();
	},
	
	onDialogCancelButton: function() {
	    this._oDialog.close();
	},

	/**
	 * navigates back one level
	 */
    goBack: function() {
        var app = sap.ui.getCore().byId("app");
        app.back();
    },

    /**
     * navigates directly to Start view
     */
    goHome: function() {
        var app = sap.ui.getCore().byId("app");
        app.to("idStartView");
    },

    /**
     * navigates to Profile view. It retrieves user ID from clicked item and calls the function for binding Profile view values
     * @param oEvent event object of click event
     */
    goToProfile: function(oEvent) {
    	var itemsModel = this.getView().getModel("users");
		var itemBindPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.users.sPath;
		var userId = itemsModel.getProperty(itemBindPath + "/ID_PERSON");
	    sap.ui.getCore().byId("idProfileView").getController().bindProfileValues(userId);
		// navigate to one skill view
	    var app = sap.ui.getCore().byId("app");
        app.to("idProfileView");
    },
    
    /**
     * calls standard print functionality of browser
     */
    printView: function() {
        window.print();
    },

    /**
     * checks if photo for user exists, if yes it will return the path to it. If not, it will return path to no photo image.
     * @param value User ID of processed user
     */
    photoPath: function(value) {
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

    /**
     * prepares models for filling the One Skill view. Header information about the skill stored in view model without name.
     * And info about users with that skill stored in JSON model called users. It also prepares unique values for filter.
     * @param skillId ID of the skill which should be shown 
     */
    prepareSkillValues: function(skillId) {
    	var oSkillsModel = new sap.ui.model.odata.ODataModel("model/Skill.xsodata");
    	var oPerskillModel = new sap.ui.model.odata.ODataModel("model/PerSki_view.xsodata");
    	var filter = new sap.ui.model.Filter({path: "ID_SKILL", operator: sap.ui.model.FilterOperator.EQ, value1: skillId});
    	
    	// read skill data from Skill table
    	oSkillsModel.read("/Skills", {filters: [filter], async: false, success: function(oData) {
    		sap.ui.getCore().byId("idOneSkillView").setModel(new sap.ui.model.json.JSONModel(oData));
    	}});
    	
    	// read filtered data from person-skill attribute view
    	oPerskillModel.read("/personskill", {filters: [filter], async: false, urlParameters: {$expand: "Person,skill"}, success: function(oData){
			sap.ui.getCore().byId("idOneSkillView").setModel(new sap.ui.model.json.JSONModel(oData), "users");
		}});
    	
    	// prepare unique filter data for filter model
        var filterData = this.prepareFilterValues(this.getView().getModel("users").getData());

        var filterModel = new sap.ui.model.json.JSONModel(filterData);
        this.getView().setModel(filterModel, "filter");
    },

    /**
     * prepares unique filter values for the filter ui element.
     * @param obj array of source data objects 
     * @return result final object with unique data objects
     */
    prepareFilterValues: function(obj) {
        var uniqueValues = {};
        var result = {};
        result.Proficiency = [];
        result.Level = [];
        result.Location = [];
        result.Specialty = [];
        $.each(obj.results, function(index, object) {
            if (!(object.PROFICIENCY in uniqueValues)) {
                uniqueValues[object.PROFICIENCY] = "";
                result.Proficiency.push({text: object.PROFICIENCY});
            }
            if (!(object.Person.LEVEL in uniqueValues)) {
                uniqueValues[object.Person.LEVEL] = "";
                result.Level.push({text: object.Person.LEVEL});
            }
            if (!(object.Person.LOCATION in uniqueValues)) {
                uniqueValues[object.Person.LOCATION] = "";
                result.Location.push({text: object.Person.LOCATION});
            }
            if (!(object.Person.SPECIALTY in uniqueValues)) {
                uniqueValues[object.Person.SPECIALTY] = "";
                result.Specialty.push({text: object.Person.SPECIALTY});
            }
        });
        return result;
    },

    /**
     * applies provided filter on skills list
     * @param oFilter filters array which should be applied
     */
    applyFilter: function(oFilter) {
        var skillsList = this.getView().byId("peopleWithSkillList");
        skillsList.getBinding("items").filter(oFilter);
    },

    /**
     * handles the event fired after clicking facet filter reset. removes all selections and applies empty filter
     */
    handleFacetFilterReset: function() {
        var filter = this.getView().byId("idFilterSkillView");
        var filterLists = filter.getLists();
        for (var i = 0; i < filterLists.length; i++) {
            filterLists[i].setSelectedKeys();
        }
        this.applyFilter([]);
        filter.rerender();
    },

    /**
     * handles the event fired after closing facet filter popup window. It takes all selected values and creates
     * filter objects from it. Then it applies those filters.
     * @param oEvent 
     */
    handleListClose: function(oEvent) {
        var filter = oEvent.getSource().getParent();
        var filterLists = filter.getLists().filter(function(oList) {
            return oList.getSelectedItems().length;
        });

        if (filterLists.length) {
            var oFilter = new sap.ui.model.Filter(filterLists.map(function(oList) {
                return new sap.ui.model.Filter(oList.getSelectedItems().map(function(oItem) {
                	var filterKey = "";
                	if(oList.getTitle() === "PROFICIENCY") {
                		filterKey = oList.getTitle();
                	} else {
                		filterKey = "Person/" + oList.getTitle();
                	}
                    return new sap.ui.model.Filter(filterKey, sap.ui.model.FilterOperator.EQ, oItem.getText());
                }), false);
            }), true);
            this.applyFilter(oFilter);
        } else {
            this.applyFilter([]);
        }
    }

});