var Exporter = {
    LOCATIONS:["Bratislava Delivery Center", "Bucharest", "Prague"],
    
    exportToExcel: function(data, source) {
        var wb = {};
        var fileName = "";
        var sheetName = source.substr(0, source.indexOf("View"));
        switch (source) {
            case "peopleView": fileName = "People.xlsx"; break;
            case "profileView": fileName = data.header.Name + "_" + data.header.Surname + "_Profile.xlsx"; break;
            case "skillsView": fileName = "Skills.xlsx"; break;
            case "skillView": fileName = data.header.Name + ".xlsx"; break;
            default: fileName = "Export_SkillView_App.xlsx";
        }
         
        wb.SheetNames = [sheetName];
        wb.Sheets = {};
        wb.Sheets[sheetName] = this.getWorksheet(data);
        var wbout = XLSX.write(wb, {
        	bookType: "xlsx",
        	bookSST: true,
        	type: "binary"
        });

        saveAs(new Blob([this.s2ab(wbout)], {
        	type: "application/octet-stream"
        }), fileName);
    },
    
    s2ab: function(s) {
    	var buf = new ArrayBuffer(s.length);
    	var view = new Uint8Array(buf);
    	for (var i = 0; i !== s.length; ++i) {
    	    view[i] = s.charCodeAt(i) & 0xFF;
    	}
    	return buf;
    },
    
    getWorksheet: function(data) {
        var ws = {};
        var range;
        
        if(data.header) {
            var header = this.createHeader(data.header);
            $.extend(ws, header);
        }
        
        if(data.content) {
            var content = this.createContent(data);
            range = content.range;
            $.extend(ws, content);
        }
        
        ws['!ref'] = XLSX.utils.encode_range(range);
        return ws;
    },
    
    createHeader: function(header) {
	    var result = {};
	    var keys = Object.keys(header);
	    
        for(var i = 0; i < keys.length; i++) {
            // Label
            var cell = { v: keys[i] };
            var cellRef = XLSX.utils.encode_cell({c: 0, r: i});
            cell.t = "s";
            result[cellRef] = cell;
            
            // Value
            cell = { v: header[keys[i]] };
            cellRef = XLSX.utils.encode_cell({c: 1, r: i});
            cell.t = "s";
            result[cellRef] = cell;
        }
        return result;
    },
    
    createContent: function(data) {
        var content = data.content;
        var range = {
    		s: {
    			c: 0,
    			r: 0
    		},
    		e: {
    			c: 0,
    			r: 0
    		}
	    };
	    var result = {};
	    var contentShift = data.header ? 7 : 1;
	    var headerShift = contentShift > 1 ? contentShift - 1 : 0;

	    for(var row = 0; row < content.length ; row++) {
	        var col = 0;
            for(var val in content[row]) {
                // skip object stuff like __metadata __proto
    			if (val.indexOf("__") >= 0) {
    			    continue;
    			}
    			
    			if (range.e.r < row + contentShift) {range.e.r = row + contentShift;}
    			if (range.e.c < col) {range.e.c = col;}
    			
    			var cell, cellRef;
    			
    			// take the keys from the first row as a header
    			if (row === 0) {
    			    cell = { v: val };
                    cellRef = XLSX.utils.encode_cell({c: col, r: row + headerShift});
                    cell.t = "s";
                    result[cellRef] = cell;
    			}
    			
    			// fill the values to cells
    			var value = val === "LOCATION" ? this.LOCATIONS[content[row][val] - 1] : content[row][val]
                cell = { v: "" + value };
                cellRef = XLSX.utils.encode_cell({c: col, r: row + contentShift});
                cell.t = "s";
                result[cellRef] = cell;
    			
    			// increment column counter
                col++;
            }
	    }
	    result.range = range;
        return result;
    }
};