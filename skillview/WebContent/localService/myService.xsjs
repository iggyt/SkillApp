//**** Example for basic REQUEST RESPONSE handling
var paramName; var paramValue; var headerName; var headerValue; var contentType;
//Implementation of GET call
function handleGet() {
     
}
//Implementation of POST call
function handlePost() {

//	var XSProc = $.import("sap.hana.xs.libs.dbutils", "procedures");
//    XSProc.setTempSchema($.session.getUsername().toUpperCase());
    var output = {};  
    var conn;
    try {
        
        var data = JSON.parse($.request.body.asString());
        conn = $.db.getConnection();
        var st = conn.prepareStatement("INSERT INTO \"SAP_HANA_DEMO\".\"Z_SKILL\" VALUES (?,?,?,?,?,?,?,?)");
        st.setString(1, data.ID_SKILL);
        st.setString(2, data.NAME);
        st.setString(3, data.DOMAIN);
        st.setString(4, data.SPECIALTY);
        st.setString(5, data.COST);
        st.setString(6, data.NEED);
        st.setString(7, data.PLATFORM);
        st.setString(8, data.DESCRIPTION);
        // var query = "INSERT INTO \"SAP_HANA_DEMO\".\"Z_SKILL\" VALUES (133,'name','domain','specialty',10.2,'need','platform','Description')";  
        //var result = conn.executeUpdate(query);
        var result = st.executeUpdate();
        conn.commit();  
        output.resultset = result;
    } catch(e) { 
        output.additional = e.message;
    }
    finally {
        conn.close();
    }
     
    return output; 	 

// 	}
// 	// Extract body insert data to DB and return results in JSON/other format
// 	$.response.status = $.net.http.CREATED;
//     return {"myResult":"POST success"};
}
// Check Content type headers and parameters
function validateInput() {
	var i; var j;
	// Check content-type is application/json
	contentType = $.request.contentType;
	if ( contentType === null || contentType.startsWith("application/json") === false){
		 $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		 $.response.setBody("Wrong content type request use application/json");
		return false;
	}
	// Extract parameters and process them 
	for (i = 0; i < $.request.parameters.length; ++i) {
	    paramName = $.request.parameters[i].name;
	    paramValue = $.request.parameters[i].value;
//      Add logic	    
	}
	// Extract headers and process them 
	for (j = 0; j < $.request.headers.length; ++j) {
	    headerName = $.request.headers[j].name;
	    headerValue = $.request.headers[j].value;
//      Add logic	    
	 }
	return true;
}
// Request process 
function processRequest(){
	if (validateInput()){
		try {
		    switch ( $.request.method ) {
		        //Handle your GET calls here
		        case $.net.http.GET:
		            $.response.setBody(JSON.stringify(handleGet()));
		            break;
		            //Handle your POST calls here
		        case $.net.http.POST:
		            $.response.setBody(JSON.stringify(handlePost()));
		            break; 
		        //Handle your other methods: PUT, DELETE
		        default:
		            $.response.status = $.net.http.METHOD_NOT_ALLOWED;
		            $.response.setBody("Wrong request method");		        
		            break;
		    }
		    $.response.contentType = "application/json";	    
		} catch (e) {
		    $.response.setBody("Failed to execute action: " + e.toString());
		}
	}
}
// Call request processing  
processRequest();