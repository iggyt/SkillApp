sap.ui.controller("controller.ProfileView", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf zit_skill_view_app.ProfileView
*/
	onInit: function() {
		// get the models for skills table and person-skill attribute view
	    var oSkillsModel = new sap.ui.model.odata.ODataModel("model/Skill.xsodata");
	    var oPersonSkillModel = new sap.ui.model.odata.ODataModel("model/perskill.xsodata");
		
	    // store those models into view
		this.getView().setModel(oSkillsModel, "skills");
		this.getView().setModel(oPersonSkillModel, "perskill");
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller"s View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf zit_skill_view_app.ProfileView
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf zit_skill_view_app.ProfileView
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf zit_skill_view_app.ProfileView
*/
//	onExit: function() {
//
//	}
	
	
	yearUsedArray: (function(){
		var result = [];
		var currentYear = new Date().getUTCFullYear();
		for(var i=0; i<8 ; i++) {
			var year = currentYear - i;
			result.push( new sap.ui.core.Item({
				 key: year,
		         text: year
		     	}));
		}
		
		return result;       
	}()),
	 
	getYearUsed: function() {
		var result = [];
		var currentYear = new Date().getUTCFullYear();
		for(var i = 0; i < 8 ; i++) {
			var year = currentYear - i;
			result.push( new sap.ui.core.Item({
				 key: year,
		         text: year
		     	}));
		}
		
		return result;
	},
	
	handlePhotoClick: function() {
	    var userId = this.getView().byId("idUserId").getText();
	    if(userId === sap.ui.getCore().user) {
	        if(!$("#uploadInput").length) {
	            $("body").append($("<input id='uploadInput' type='file' style='visibility:hidden;' />"));
	        }
	        $("#uploadInput").click();
	        
	        $(document).on("change", "#uploadInput", function(oEvent) {
	            if(oEvent.currentTarget.files.length) {
	                sap.ui.getCore().byId("idProfileView").getController().handleUploadPress(oEvent.currentTarget.files[0]);
	            }
	        });    
	    }
	},
	
	handleUploadPress: function(file) {
		var userPhotoFile = sap.ui.getCore().user + ".png";
		var token = sap.ui.getCore().token;
		$.ajax({
			url: "http://hxehost:8090/sap/hana/xs/dt/base/file/skillview/WebContent/img/",
			type: "POST",
			headers: {'X-CSRF-Token': token,
					  'Slug': userPhotoFile,
					  'SapBackPack': '{"Activate": true}'},
			success: function() {
				$.ajax({
					url: "http://hxehost:8090/sap/hana/xs/dt/base/file/skillview/WebContent/img/" + userPhotoFile,
					type: "PUT",
					headers: {'X-CSRF-Token': token,
							  'SapBackPack': '{"Activate": true}'},
					data: file,
					processData: false,
					success: function() {
						sap.ui.getCore().byId("idProfileView").getController().bindProfileValues(sap.ui.getCore().user);
					},
					error: function() {
						console.log("It was not possible to insert data to the file.");
					}
				});
			},
			error: function() {
				console.log("It was not possible to create file. ");
			}
		});
	},
	
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
	
	/**
	 * Opens the default browser print window
	 */	
	printView: function() {
	    window.print();
	},
	
	/**
	 * Exports shown profile to excel file. It will export unformatted text of header and skills without photo (for now).
	 * It calls the Exporter library located in js folder
	 */
	exportToExcel: function() {
	    var skillsList = this.getView().byId("skillsList");
	    var skills = skillsList.mBindingInfos.items.binding.oList;
	    var model = this.getView().getModel();
	    var userId = this.getView().byId("idUserId").getText();
	    var userData = model.getData().people[userId];
	    var header = {
	        "Name": userData.Name,
	        "Surname": userData.Surname,
	        "Level": userData.Level,
	        "Location": userData.Location,
	        "Specialty": userData.Speciality
	    };
	    
	    var data = {};
	    data.header = header;
	    data.content = skills;
	    
	    Exporter.exportToExcel(data, "profileView");
	},
	
	/**
	 * Handles the delete button click which is shown when skills list is in edit mode. It finds the corresponding
	 * item in the model, removes it from backend table Z_PERSKILL and refreshes skills list in profile view.
	 * @param oEvent click event on pushing delete button on item
	 */
	handleDeleteItem: function(oEvent) {
	    var model = this.getView().getModel("perskill");
	    var itemsModel = this.getView().getModel("realData");
	    var userId = this.getView().byId("idUserId").getText();
	    var itemBindPath = oEvent.getParameter("listItem").oBindingContexts.realData.sPath;
	    var skillId = itemsModel.getProperty(itemBindPath).ID_SKILL;
	    var sPath = "/Perskill(ID_PERSON='" + userId + "',ID_SKILL=" + skillId + ")";
	    	
		// remove selected row from table in backend
		model.remove(sPath, {async:false});
		
		// refresh the skills list after deletion
		this.bindProfileValues(userId);
	},
	
	/**
	 * Sets edit mode on skills list and disables other buttons
	 */
	editSkills: function() {
		var skillsList = this.getView().byId("skillsList");
		
		if(skillsList.getMode() === "Delete") {
			skillsList.setMode("None");
			this.handleButtons([ this.getView().byId("idAddSkillButton"),
			                     this.getView().byId("idPrintButton"),
			                     this.getView().byId("idExportButton") ], true );
			$.each(skillsList.getItems(), function(i,obj) {
				obj.getContent()[0].getItems()[1].getItems()[1].setEnabled(false);
				obj.getContent()[0].getItems()[1].getItems()[0].setEnabled(false);
			});
			this.updateModel();
		} else {
			skillsList.setMode("Delete");
			this.handleButtons([ this.getView().byId("idAddSkillButton"),
			                     this.getView().byId("idPrintButton"),
			                     this.getView().byId("idExportButton") ], false );
			$.each(skillsList.getItems(), function(i,obj) {
				obj.getContent()[0].getItems()[1].getItems()[1].setEnabled(true);
				obj.getContent()[0].getItems()[1].getItems()[0].setEnabled(true);
			});
		}
	},
	
	/**
	 * Changes the enabled property of all buttons on input
	 * @param buttons array of Buttons which enabled property should be changed
	 */	
	handleButtons: function(buttons, enabled) {
		$.each(buttons, function(i,obj) {
			obj.setEnabled(enabled);
		});
	},
	
	/**
	 * Creates a popup window (Dialog) for adding a new skill to users skills list. Popup window has combo box for selecting
	 * the skill, rating indicator for selecting proficiency and simple select for selecting last year used. Skills options
	 * are filtered, so the options list is only from skills users doesn't have yet. The Dialog has two buttons add and close.
	 */
	addSkill: function () {
	    var userId = sap.ui.getCore().byId("idProfileView").byId("idUserId").getText();
	    this.getAvailableSkills();
	    
//		var skillsInputBox = new sap.m.ComboBox("idSkillInput",{
//			width: "100%",
//			items: {
//			    path: "availableSkills>/Skills",
//			    sorter: "availableSkills>NAME",
//				template: new sap.ui.core.Item({
//				    key: "availableSkills>NAME",
//				    text: "{availableSkills>NAME}"
//				})
//			},
//			layoutData : new sap.ui.layout.GridData({
//				span: "L9 M9 S12"
//			})
//		});
	    var skillsInputBox = new sap.m.Select("idSkillInput", {
	    	width: "100%",
	    	items: {
			    path: "availableSkills>/Skills",
			    sorter: "availableSkills>NAME",
				template: new sap.ui.core.Item({
				    key: "availableSkills>NAME",
				    text: "{availableSkills>NAME}"
				})
			},
			layoutData : new sap.ui.layout.GridData({
				span: "L9 M9 S12"
			})
	    }); 
		
		var skillsInputBoxLabel = new sap.m.Label({
				text: "Skill",
				layoutData : new sap.ui.layout.GridData({
					span: "L3 M3 S12"
				})
		});
		
		skillsInputBoxLabel.addStyleClass("addSkillLabelProfile");

		var proficiency = new sap.m.RatingIndicator("idProficiencyAddSkill", {
			maxValue:5,   
			tooltip:"Proficiency",
			iconSelected:"sap-icon://study-leave",
			iconHovered:"sap-icon://study-leave",
			iconUnselected:"sap-icon://study-leave",
			layoutData : new sap.ui.layout.GridData({
				span: "L9 M9 S12"
			})
		});
		
		var proficiencyLabel = new sap.m.Label({
			text: "Proficiency",
			layoutData : new sap.ui.layout.GridData({
				span: "L3 M3 S12"
			})
		});
		
		proficiencyLabel.addStyleClass("addSkillLabelProfile");

		var lastUsed = new sap.m.Select("idLastUsed", {
			items: this.getYearUsed(),
			layoutData : new sap.ui.layout.GridData({
				span: "L9 M9 S12"
			})
		});
		
		var lastUsedLabel = new sap.m.Label({
			text: "Last year used",
			layoutData : new sap.ui.layout.GridData({
				span: "L3 M3 S12"
			})
		});
		
		lastUsedLabel.addStyleClass("addSkillLabelProfile");
		
		var addSkillLayout = new sap.ui.layout.Grid({
			//width: "90%",
			position: "Center",
			content: [skillsInputBoxLabel, skillsInputBox,
			          proficiencyLabel, proficiency,
			          lastUsedLabel, lastUsed]
		});
		
		var dialog = new sap.m.Dialog({
			title: "Add Skill",
			content: addSkillLayout, // [skillsInputBox, proficiency, lastUsed],
			beginButton: new sap.m.Button({
				text: "Add",
				press: function () {
				    var view = sap.ui.getCore().byId("idProfileView");
				    
				    var profileModel = view.getModel("realData");
					var perskillModel = view.getModel("perskill");
					var skillsModel = view.getModel("availableSkills");
					//var skillName = sap.ui.getCore().byId("idSkillInput").getValue();
					var skillName = sap.ui.getCore().byId("idSkillInput").getSelectedItem().getText();
					
					// filter out chosen skill to get the skill ID
					var skill = skillsModel.getData().Skills.filter(function(skills) {
						return skills.NAME === skillName;
					});
					
					// create new object for adding to table 
					var newObj = {};
					newObj.ID_PERSON = userId;
					newObj.ID_SKILL = skill[0].ID_SKILL;
					newObj.PROFICIENCY = "" + sap.ui.getCore().byId("idProficiencyAddSkill").getValue();
					newObj.LASTUSED = new Date("1.2." + sap.ui.getCore().byId("idLastUsed").getSelectedItem().getText());
					
					// call the create functionality of OData service
					perskillModel.create("/Perskill", newObj, {async: false, success: function(oData, response) {
						console.log("Skill succesffuly added.");
					}});
					
					
					view.getController().bindProfileValues(userId);
					
					dialog.close();
				}
			}),
			endButton: new sap.m.Button({
				text: "Close",
				press: function(oEvent) {
					skillsInputBox.destroy();
					proficiency.destroy();
					lastUsed.destroy();
					dialog.close();
				}
			}),
			
			afterClose: function() {
				dialog.destroy();
			}
		
		});

		//to get access to the global model
		this.getView().addDependent(dialog);
		dialog.open();
	},
	
	/**
	 * It prepares One skill view and then navigates to it. 
	 * @param oEvent click event of skill name in skills list
	 */
	goToSkill: function (oEvent) {
		var itemsModel = sap.ui.getCore().byId("idProfileView").getModel("realData");
		var itemBindPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.realData.sPath;
		var skillId = itemsModel.getProperty(itemBindPath + "/ID_SKILL");
	    sap.ui.getCore().byId("idOneSkillView").getController().prepareSkillValues(skillId);
		// navigate to one skill view
		var app = sap.ui.getCore().byId("app");
		app.to("idOneSkillView");
	},

	/**
	 * Filters out from all skills only skills user doesn"t have yet and puts them to availableSkills model
	 */
	getAvailableSkills: function() {
	    var skillsList = this.getView().byId("skillsList");
	    var haveSkills = [];
	    $.each(skillsList.mBindingInfos.items.binding.oList, function (index, obj) {
	        haveSkills.push(obj.ID_SKILL);
	    });

	    var oModelSkills = this.getView().getModel("skills");
	    oModelSkills.refresh();
	    var data;
	    var availableSkills = oModelSkills.read("/Skills",{async:false, success: function(oData, response) {
	    	data = oData;
	    }});
	    
	    var result = data.results.filter(function(obj) {
	    	if($.inArray(obj.ID_SKILL, haveSkills) < 0) {
	    		return obj;
	    	}
	    });
	    var oModelAvailableSkills = new sap.ui.model.json.JSONModel({ "Skills": result });
	    this.getView().setModel(oModelAvailableSkills, "availableSkills");
	},

	/**
	 * Binds the values for provided user to the Profile view ui elements. 
	 * @param userId ID of the user shown in Profile view
	 */
	bindProfileValues: function (userId) {
		var url = "model/PerSki_view.xsodata";
		var oDataModel = new sap.ui.model.odata.ODataModel(url);
		var personModel = new sap.ui.model.odata.ODataModel("model/person.xsodata");
		var filter = new sap.ui.model.Filter({path: "ID_PERSON", operator: sap.ui.model.FilterOperator.EQ, value1: userId});
		var sorter = new sap.ui.model.Sorter({path: "PROFICIENCY", descending: true});
		
		// handle buttons enablement based on user name 
		if(userId !== sap.ui.getCore().user) {
			this.handleButtons([ this.getView().byId("idAddSkillButton"),
			                     this.getView().byId("idEditSkillButton") ], false);
		} else {
			this.handleButtons([ this.getView().byId("idAddSkillButton"),
			                     this.getView().byId("idEditSkillButton") ], true);
		}
		
		// filters out data for one user from person skill attribute view and stores it in new JSON model called realData 
		oDataModel.read("/personskill", {filters: [filter], sorters: [sorter], async: false, urlParameters: {$expand: "Person,skill"}, success: function(oData, response){
			sap.ui.getCore().byId("idProfileView").setModel(new sap.ui.model.json.JSONModel(oData), "realData");
		}});

		// create UI element for proficiency selection. makes the icons as study hats instead of stars
	    var oProficiency = new sap.m.RatingIndicator({
	        maxValue: 5,
	        value: {
	            path: "realData>PROFICIENCY",
	            type: new sap.ui.model.type.String()
	        },
	        tooltip: "Proficiency",
	        iconSelected: "sap-icon://study-leave",
	        iconHovered: "sap-icon://study-leave",
	        iconUnselected: "sap-icon://study-leave",
	        enabled: false
	    });
	    
	    oProficiency.addStyleClass("proficiencyProfile");
	    
	    // create UI element for Last year used selection
	    var oLastUsed = new sap.m.Select({
	        enabled: false,
	        selectedKey: {
	        	path: "realData>LASTUSED",
	        	formatter: function(value) {
	        		return value.getFullYear();
	        	}  
	        },
	        items: this.yearUsedArray
	    });

	    // create UI element for Skill name. It is classic link.
	    var oSkillName = new sap.m.Link({
	        text: "{realData>skill/results/0/NAME}",
	        tooltip: "{realData>skill/results/0/NAME}",
	        width: "90%",
	        press: this.goToSkill
	    });
	    
	    oSkillName.addStyleClass("skillNameProfile");

	    // create UI element for vertical alignment of skill list items
	    var vBox = new sap.m.VBox({
	        items: [
                oSkillName,
                new sap.m.HBox({
                    items: [
                        oLastUsed,
                        oProficiency
                    ]
                })
	        ]
	    });
	    
	    vBox.addStyleClass("sapUiSmallMargin");

	    // template for skill list items
	    var oTemplate = new sap.m.CustomListItem({
	        content: vBox
	    });

	    // bind header values
	    var user = this.getView().byId("idUserId");
	    user.setText(userId);
	    user.addStyleClass("hidden");
	    personModel.read("/Person", {filters: [filter], async: false, success: function(oData) {
	    	var view = sap.ui.getCore().byId("idProfileView");
	    	var name = view.byId("idProfileName");
	    	name.setText(oData.results[0].NAME);
	    	var surname = view.byId("idProfileSurname");
	    	surname.setText(oData.results[0].SURNAME);
	    	var level = view.byId("idProfileLevel");
	    	level.setText(oData.results[0].LEVEL);
	    	var location = view.byId("idProfileLocation");
	    	location.setText(oData.results[0].LOCATION)
	    }});
	    
	    // set photo source depending on user ID and existence of the photo
	    var photo = this.getView().byId("idProfilePhoto");
	    photo.setSrc(this.photoPath(userId) + "?" + new Date().getTime());

	    // bind skills list
	    var skillsList = this.getView().byId("skillsList");
	    skillsList.bindItems("realData>/results", oTemplate);
	},
	
	/**
	 * Checks if there is a photo of the user requested. If yes, it will return the path to the picture. If not,
	 * it will return path for no photo
	 * @param value User ID for whom it should get the path to photo
	 * @returns {String} Returns the path for photo as String
	 */
	photoPath: function(value) {
    	var path = "img/" + value + ".png";
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
	 * Updates tables in backend according to changed skills data
	 */
	updateModel: function() {
		var model = this.getView().getModel("perskill");
		model.refresh();
		var skillsList = this.getView().byId("skillsList");
		var data = {};
		data.ID_PERSON = this.getView().byId("idUserId").getText();
		var items = skillsList.getItems();
		for (var i = 0; i < items.length; i++) {
			data.ID_SKILL = skillsList.mBindingInfos.items.binding.oList[i].ID_SKILL;
			data.PROFICIENCY = items[i].getContent()[0].getItems()[1].getItems()[1].getValue();
			data.LASTUSED = items[i].getContent()[0].getItems()[1].getItems()[0].getSelectedKey();
			var sPath = "/Perskill(ID_PERSON='" + data.ID_PERSON + "',ID_SKILL=" + data.ID_SKILL + ")";
			
			// update the table in backend for processed entity
			model.update(sPath, data, null, function() {console.log("Row succesfully updated.");}, function(oError) {console.log("There was an error: " + oError);});
 		}

	}
});