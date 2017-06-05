var selectSkills = 
				"SELECT TOP 1000 \"NAME\", \"SURNAME\", \"LEVEL\", \"LOCATION\", \"SPECIALTY\", \"PLATFORM\", \"DOMAIN\", \"PROFICIENCY\", \"LASTUSED\", \"FULLNAME\", count(\"SKILL\") AS \"SKILL\"" +
				"FROM \"_SYS_BIC\".\"HANA/calc_skill\" " + 
				"GROUP BY \"NAME\", \"SURNAME\", \"LEVEL\", \"LOCATION\", \"SPECIALTY\", \"PLATFORM\", \"DOMAIN\", \"PROFICIENCY\", \"LASTUSED\", \"FULLNAME\" ";
function close(closables) { 
          var closable; 
          var i; 
          for (i = 0; i < closables.length; i++) { 
                    closable = closables[i]; 
                    if(closable) { 
                              closable.close(); 
                    }  
          } 
} 
function getSkills(){ 
          var skillsList = []; 
          var connection = $.db.getConnection(); 
          var statement = null; 
          var resultSet = null; 
          try{ 
                    statement = connection.prepareStatement(selectSkills); 
                    resultSet = statement.executeQuery(); 
                    var skillSet; 
                 
                    while (resultSet.next()) { 
                              skillSet = {}; 
                              skillSet.name = resultSet.getString(1); 
                              skillSet.surname = resultSet.getString(2); 
                              skillSet.level = resultSet.getInteger(3);
                              skillSet.location = resultSet.getString(4);
                              skillSet.specialty = resultSet.getString(5);
                              skillSet.platform = resultSet.getString(6);
                              skillSet.domain = resultSet.getString(7);
                              skillSet.proficiency = resultSet.getInteger(8);
                              skillSet.lastUsed = resultSet.getDate(9);
                              skillSet.fullname = resultSet.getString(10);
                              skillSet.skill = resultSet.getInteger(11);
                              skillsList.push(skillSet); 
                    } 
          } finally { 
                    close([resultSet, statement, connection]); 
          } 
          return skillsList; 
} 
function doGet() { 
          try{ 
                    $.response.contentType = "application/json"; 
                    $.response.setBody(JSON.stringify(getSkills())); 
          } 
          catch(err){ 
                    $.response.contentType = "text/plain"; 
                    $.response.setBody("Error while executing query: [" + err.message + "]"); 
                    $.response.returnCode = 200; 
          } 
}
doGet();