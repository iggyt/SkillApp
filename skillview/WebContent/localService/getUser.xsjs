//**** Example for basic REQUEST RESPONSE handling
var paramName; var paramValue; var headerName; var headerValue; var contentType;
//Implementation of GET call
function handleGet() {
	// Retrieve data here and return results in JSON/other format 
	$.response.status = $.net.http.OK;
	 return {"user": $.session.getUsername()};
}

// Request process 
function processRequest(){
	try {
	    switch ( $.request.method ) {
	        //Handle your GET calls here
	        case $.net.http.GET:
	            $.response.setBody(JSON.stringify(handleGet()));
	            break;
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
// Call request processing  
processRequest();