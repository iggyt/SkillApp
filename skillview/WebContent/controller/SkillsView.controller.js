sap.ui.controller("controller.SkillsView", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf zit_skill_view_app.SkillsView
*/
	onInit: function() {
		var oHanaModel = new sap.ui.model.odata.ODataModel("model/Skill.xsodata");
		this.getView().setModel(oHanaModel);
		this.prepareFilterValues();
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf zit_skill_view_app.SkillsView
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf zit_skill_view_app.SkillsView
*/
	onAfterRendering: function() {
		this.getView().byId("idSkillsList").getBinding("items").sort([new sap.ui.model.Sorter("NAME")]);
	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf zit_skill_view_app.SkillsView
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
	goHome: function () {
	    var app = sap.ui.getCore().byId("app");
	    app.to("idStartView");
	},

	/**
	 * Sets a filter on skills list based on input in search field. The filter is not case sensitive.
	 * @param oEvent event fired when a character is written into search field
	 */
	onSearch : function (oEvent) {
		var aFilters = [];
		var sQuery = oEvent.getSource().getValue();
		sQuery = sQuery.toLowerCase();
		if (sQuery && sQuery.length > 0) {
			var filter = new sap.ui.model.Filter("tolower(NAME)", sap.ui.model.FilterOperator.Contains, "'" + sQuery + "'");
			aFilters.push(filter);
		}

		// update list binding
		var skillsList = this.getView().byId("idSkillsList");
		var binding = skillsList.getBinding("items");
		binding.filter(aFilters, "Application");
	},

	/**
	 * Calls function for preparation One skill view depending on clicked item. Then it navigates application to 
	 * One skill view. It happens after clicking on skill name in skills list.
	 * @param oEvent click event for skill name in skill item in skills list
	 */
	goToSkill: function (oEvent) {
		var skillsModel = this.getView().getModel();
		var itemBindPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.undefined.sPath;
		var skillId = "";
		skillsModel.read(itemBindPath, {async: false, success: function(oData, response) {
	    	skillId = oData.ID_SKILL;
	    }});
		
	    sap.ui.getCore().byId("idOneSkillView").getController().prepareSkillValues(skillId);
		// navigate to one skill view
		var app = sap.ui.getCore().byId("app");
		app.to("idOneSkillView");
	},
	
	prepareFilterValues: function() {
		var oModel = this.getView().getModel();
		oModel.read("/Skills", {async: false, success: function(oData, response) {
			var uniqueValues = {};
	        var result = {};
	        result.Name = [];
	        result.Need = [];
	        result.Cost = [];
	        result.Specialty = [];
	        result.Domain = [];
	        result.Platform = [];
	        $.each(oData.results, function(index, object) {
	            if (!(object.NAME in uniqueValues)) {
	                uniqueValues[object.NAME] = "";
	                result.Name.push({text: object.NAME});
	            }
	            if (!(object.NEED in uniqueValues)) {
	                uniqueValues[object.NEED] = "";
	                result.Need.push({text: object.NEED});
	            }
	            if (!(object.COST in uniqueValues)) {
	                uniqueValues[object.COST] = "";
	                result.Cost.push({text: object.COST});
	            }
	            if (!(object.SPECIALTY in uniqueValues)) {
	                uniqueValues[object.SPECIALTY] = "";
	                result.Specialty.push({text: object.SPECIALTY});
	            }
	            if (!(object.DOMAIN in uniqueValues)) {
	                uniqueValues[object.DOMAIN] = "";
	                result.Domain.push({text: object.DOMAIN});
	            }
	            if (!(object.PLATFORM in uniqueValues)) {
	                uniqueValues[object.PLATFORM] = "";
	                result.Platform.push({text: object.PLATFORM});
	            }
	        });
	        
	        sap.ui.getCore().byId("idSkillsView").setModel(new sap.ui.model.json.JSONModel(result), "filter");
		}});
	},
	
	/**
	 * Applies the filter from input on skills list items
	 * @param oFilter provided filter which should be applied on skills list items
	 */
	applyFilter: function(oFilter) {
		var skillsList = this.getView().byId("idSkillsList");
		skillsList.getBinding("items").filter(oFilter);
	},
	
	/**
	 * Handler for reset event of facet filter used on skills list. It goes through all filters and resets the keys selection. 
	 * At the end it applies empty filter.
	 * @param oEvent click event of facet filter reset button 
	 */
	handleFacetFilterReset: function(oEvent) {
		var filter = sap.ui.getCore().byId(oEvent.getParameter("id"));
		var filterLists = filter.getLists();
		for (var i = 0; i < filterLists.length; i++) {
			filterLists[i].setSelectedKeys();
		}
		this.applyFilter([]);
	},
	
	/**
	 * Handler for closing event of facet filter used on skills list. It gets selected items, creates filters according to
	 * these selected items and at the end it applies these filters. 
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
					return new sap.ui.model.Filter(oList.getTitle(), sap.ui.model.FilterOperator.EQ, oItem.getText());
				}), false);
			}), true);
			this.applyFilter(oFilter);
		} else {
			this.applyFilter([]);
		}
	},
	
	/**
	 * Calls the browser print window
	 */
	printView: function() {
	    window.print();
	},
	
	/**
	 * Exports skills list to excel file. The data are not formatted (for now). It calls exportToExcel function from Exporter library.
	 */
	exportToExcel: function() {
	    var skillsList = this.getView().byId("idSkillsList");
	    var dataArray = $.map(skillsList.mBindingInfos.items.binding.oLastContextData, function(value) {
	        return [value];
	    });
	    
	    var data = {};
	    data.content = dataArray;
	    
	    Exporter.exportToExcel(data, "skillsView");
	}
});