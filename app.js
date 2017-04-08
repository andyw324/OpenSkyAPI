var dateFormat = require('dateformat');
var https = require('https');

var bodyString = "";
var i,val;
var saveToPath = "";

// Get input parameters from command line initiation
var inputParams = process.argv.slice(2)

// Default filename to save API data
var saveToFile = dateFormat(Date.now(),"yyyy-mm-dd_HH-MM-ss") + "_OpenSkyAPIData.csv"

// Check parameters are valid and exit process if not
for (i = 0; i < inputParams.length; i++) {
	var param = inputParams[i];

	// loop through defined parameters, skipping over every other assuming pattern of --para value --para value etc.
	if (i+1 < inputParams.length) {
		i += 1;
		switch(param) {
			case '--saveToPath':
				var saveToPath = inputParams[i];
				if (saveToPath.slice(-1) === "/" ) {
					saveToPath = saveToPath.slice(0,saveToPath.length -1);
				};
				console.log('saveToPath: ',saveToPath);
				break;
			case '--saveToFile':
				console.log('saveToFile: ',inputParams[i]);
				saveToFile = inputParams[i];
				break;
			default:
				console.log('Error: Parameter tag - "' + param + '" unexpected - Exiting function');
				process.exit();
		}
	} else {
		// Write to console if there is an error with the input parameters
		console.log('Error: insufficient parameters supplied');
	}
}

// Check if a saveToPath has been defined - if not exit process
if (saveToPath === "") {
	console.log('Error: parameter "--saveToPath" is required');
	process.exit();
}

// Call the OpenSky API
https.get('https://opensky-network.org/api/states/all',(res) => {
	console.log('response: ',res.statusCode);
	
	// Create the CSV if a successful response
	if (res.statusCode === 200) {
		// Build up the response body form the GET request
		res.on('data', (data) => {
			bodyString += data;
		});

		// Once full response received and GET complete, begin parsing and building CSV
		res.on('end', () => {
			// value from GET is stored as a string - convert to JSON
			var jsonData = JSON.parse(bodyString);

			var outputCSV = "";
			var fs = require('fs');
			var outputLine = "";

			// store the timeStamp value of when the data was obtained - first value in JSON
			var ts = dateFormat(jsonData.time,"yyyy-mm-dd HH:MM:ss");
			// count number of flight details returned
			var numRec = jsonData.states.length;

			// Loop through each flight record and remove square brackets form start and end of array value
			for (i=0; i < numRec; i++) {
				outputLine = JSON.stringify(jsonData.states[i]);
				outputLine = outputLine.slice(1,outputLine.length - 1);
				// add in timeStamp value and line break
				outputLine += "," + ts + "\n";
				// add to overall output csv
				outputCSV += outputLine;
			}
			// write out the outputCSV to defined location and filename
			fs.writeFileSync(saveToPath + "/" + saveToFile, outputCSV);

		});

		console.log('Success');

	} else {
		console.log("Failiure");
	};

});

