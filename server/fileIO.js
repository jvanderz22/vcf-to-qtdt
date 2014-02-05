var fs = require('fs')
var readline = require('readline')
var stream = require('stream')
var multiparty = require('multiparty')
var util = require('util')
var uuid = require('node-uuid')


var possibleNotSampleStrings = []
possibleNotSampleStrings.push("#")
possibleNotSampleStrings.push("#CHROM")
possibleNotSampleStrings.push("CHROM")
possibleNotSampleStrings.push("POS")
possibleNotSampleStrings.push("ID")
possibleNotSampleStrings.push("REF")
possibleNotSampleStrings.push("ALT")
possibleNotSampleStrings.push("QUAL")
possibleNotSampleStrings.push("FILTER")
possibleNotSampleStrings.push("INFO")
possibleNotSampleStrings.push("FORMAT")

exports.getFiles = function(req, res) {

	//console.log(req.params)
	var nameString = req.params.nameString
	nameString = nameString.substring(0, nameString.length-1)
	var familyIdString = req.params.familyIdString
	familyIdString = familyIdString.substring(0, familyIdString.length-1)
	var motherString = req.params.motherString
	motherString = motherString.substring(0, motherString.length-1)
	var fatherString = req.params.fatherString
	fatherString = fatherString.substring(0, fatherString.length-1)
	var sexString = req.params.sexString
	sexString = sexString.substring(0, sexString.length-1)
	var phenotypeString = req.params.phenotypeString
	phenotypeString = phenotypeString.substring(0, phenotypeString.length-1)
	
	var nameArray = nameString.split(";")
	var familyIdArray = familyIdString.split(";")
	var motherArray = motherString.split(";")
	var fatherArray = fatherString.split(";")
	var sexArray = sexString.split(";")
	var phenotypeArray = phenotypeString.split(";")


	var dataFileString = 'A\tAffected\n'
	var mapFileString = 'CHROMOSOME\tMARKER\tPOSITION\n'
	

	var peopleArray = []
	var skipped = 0
	var form = new multiparty.Form()
	form.parse(req, function(err, fields, files) {
	
		var readStream = fs.createReadStream(files.file[0].path);
		var outStream = new stream;
		outStream.readable = true;
		outStream.writable = true;
		
		var rl = readline.createInterface({
			input: readStream,
			output: outStream,
			terminal: false
		});
		var posInfo = []
		var people = []
		var markersArray = []


		for (var i = 0; i < nameArray.length; i++) {
			var person = ""
			person += familyIdArray[i] + '\t'
			person += nameArray[i] + '\t';
			person += fatherArray[i] + '\t';
			person += motherArray[i] + '\t';
			person += sexArray[i] + '\t';
			person += phenotypeArray[i];
			people.push(person)
			console.log(person)
		}

		var newLines = ""

		rl.on('line', function(line) {
			
			if (line.toString().substring(0, 2) == "##") {
				skipped += 1
			}
			else if (line.toString().substring(0,1) == "#") {
		   		importantLine = line.toString()
		    	splitImportant = importantLine.split(/[ \t]+/)
		    	for (var i = 0; i < splitImportant.length; i++) {
		    		if (possibleNotSampleStrings.indexOf(splitImportant[i]) == -1) {
		    			samplesBegin = i;
		    			break;
		    		}
		    	}
		    	numberSamples = splitImportant.length - samplesBegin;
			}
			else {
				var splitLine = line.split(/[ \t]+/)
		    	var markerID = splitLine[2]

		    	var altIds = splitLine[4]
		    	console.log("ALT IDS: " + altIds)
		    	var altIDsSplit = altIds.split(',')
		    	var altIdsObject = {}
		    	altIdsObject["markerID"] = markerID;
		    	altIdsObject["alleles"] = altIDsSplit;
		    	markersArray.push(altIdsObject)

			    dataFileString += 'M\t' + splitLine[2] + '\n'

			    mapFileString += splitLine[0] + '\t' + splitLine[2] + '\t' + splitLine[1]/100000 + '\n'

			    count = 0;
			    console.log("Samples Begin: " + samplesBegin)
			    console.log("Line length: " + splitLine.length)
			    for (var i = samplesBegin; i < splitLine.length; i++) {
			    	var individualInfo = splitLine[i].toString()
			    	


			    	var slashPos = individualInfo.indexOf('/')
			    	var colonPos = individualInfo.indexOf(':')
			    	var chromosomeString = individualInfo.substring(0, colonPos)
			    	people[count] = people[count] + "\t" + chromosomeString
			    	count++;
			    }
			    newLines += line
			}
		});
		
		rl.on('close', function() {
	    	var uuidGen = uuid.v1();
	    	var dataFileLoc = "data/data_" + uuidGen + ".dat"
	    	var mapFileLoc = "data/map_" + uuidGen + ".map"
	    	var pedigreeFileLoc = "data/pedigree_" + uuidGen + ".ped"

	    	fileLocs = {}
	    	fileLocs["dataFile"] = dataFileLoc
	    	fileLocs["mapFile"] = mapFileLoc
	    	fileLocs["pedigreeFile"] = pedigreeFileLoc
	    	var returnObject = {}
	    	returnObject["fileLocs"] = fileLocs;
	    	returnObject["markers"] = markersArray;

	    	if (dataFileString.length > 0) {
				dataFileString = dataFileString.substring(0, dataFileString.length-1)
			}
			fs.writeFile("client/" + dataFileLoc, dataFileString, function(err) {
				if (err) {
					console.log(err)
				}
				else {
					console.log("The file was saved to data.dat")
				}
			})

			if (mapFileString.length > 0) {
				mapFileString = mapFileString.substring(0, mapFileString.length-1)
			}
			fs.writeFile("client/" + mapFileLoc, mapFileString, function(err) {
				if (err) {
					console.log(err)
				}
				else {
					console.log("The file was saved to map.map")
				}
			})

			peopleFileString = ''
			for (var i = 0; i < people.length; i++) {
				peopleFileString += people[i] + '\n'
			}
			peopleFileString = peopleFileString.substring(0, peopleFileString.length-1)
			fs.writeFile("client/" + pedigreeFileLoc, peopleFileString, function(err) {
				if (err) {
					console.log(err)
				}
				else {
					console.log("The file was saved to pedigree.ped")
				}
			});



	    	res.send(returnObject)

			//console.log("Readline Closed")
		});
	});
}



exports.getFilesFromFile = function(req, res) {
	var importFile = "client/data/" + req.params.file
	var dataFileString = 'A\tAffected\n'
	var mapFileString = 'CHROMOSOME\tMARKER\tPOSITION\n'

	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files) {
		
		var outStream1 = new stream;
		outStream1.readable = true;
		outStream1.writable = true;


		var inputStream = fs.createReadStream(importFile);
		var inputLines = readline.createInterface({
			input: inputStream,
			output: outStream1,
			terminal: false
		})

		var people = []
		var sampleNames = []
		var skipped = 0

		var inputCount = 0

		inputLines.on('line', function(inputLine) {
			if (inputLine.indexOf('\t') > -1) {
				split = inputLine.split(/[ \t]+/);
				sampleNames.push(split[0])
				if (split.length != 6) {
					res.send(inputLine, 498)
				}
				person = split[1] + '\t' + split[0] + '\t'
				split.splice(0,2)
				person += split.join('\t');
				people.push(person)
				inputCount++
			}
		})
		inputLines.on('error', function() {
			res.send(inputLine, 498)
		})
		inputLines.on('close', function() {
			var newLines = ''
			var vcfStream = fs.createReadStream(files.file[0].path);
			var outStream = new stream;
			outStream.readable = true;
			outStream.writable = true;
			
			var vcfLines = readline.createInterface({
				input: vcfStream,
				output: outStream,
				terminal: false
			});

			var markersArray = []

			vcfLines.on('line', function(vcfLine){
				if (vcfLine.substring(0, 2) == "##") {
					//console.log(line)
					skipped += 1
				}
				else if (vcfLine.substring(0,1) == "#") {
					//console.log(line)

			    	var split = vcfLine.split(/[ \t]+/)
			    	for (var i = 0; i < split.length; i++) {
			    		if (possibleNotSampleStrings.indexOf(split[i]) == -1) {
			    			samplesBegin = i;
			    			break;
			    		}
			    	}
			    	numberSamples = split.length - samplesBegin;
			    	if (numberSamples != inputCount) {
			    		res.send("Mismatch between number of samples. " + numberSamples + " in the VCF file and " + inputCount + " in input file", 496)
			    	}
			    	for (var i = samplesBegin; i < split.length; i++) {
			    		if (sampleNames.indexOf(split[i]) == -1) {
			    			console.log("sample names: " + sampleNames[0])
			    			console.log("Split" + split[i])
			    			res.send(split[i] + " ID in VCF file not defined in input file", 495)
			    		}
			    	}
			    	//rl.close();
				}
				else {
			    	var split = vcfLine.split(/[ \t]+/)
			    	var markerID = split[2]

			    	var altIds = split[4]
			    	console.log("ALT IDS: " + altIds)
			    	var altIDsSplit = altIds.split(',')
			    	var altIdsObject = {}
			    	altIdsObject["markerID"] = markerID;
			    	altIdsObject["alleles"] = altIDsSplit;
			    	markersArray.push(altIdsObject)
			    

				    dataFileString += 'M\t' + split[2] + '\n'
				    mapFileString += split[0] + '\t' + split[2] + '\t' + split[1]/100000 + '\n'
				    count = 0;
				    for (var i = samplesBegin; i < split.length; i++) {
				    	var individualInfo = split[i].toString()
				    	var slashPos = individualInfo.indexOf('/')
				    	var colonPos = individualInfo.indexOf(':')
				    	var chromosomeString = individualInfo.substring(0, colonPos)
				    	people[count] = people[count] + "\t" + chromosomeString
				    	count++;
				    }
				    newLines += vcfLine
				    //lose += 1;
				}
			

			});
			vcfLines.on('close', function(){
				var uuidGen = uuid.v1();
		    	var dataFileLoc = "data/data_" + uuidGen + ".dat"
		    	var mapFileLoc = "data/map_" + uuidGen + ".map"
		    	var pedigreeFileLoc = "data/pedigree_" + uuidGen + ".ped"

		    	var fileLocs = {}
		    	fileLocs["dataFile"] = dataFileLoc
		    	fileLocs["mapFile"] = mapFileLoc
		    	fileLocs["pedigreeFile"] = pedigreeFileLoc
		    	var returnObject = {}
		    	returnObject["fileLocs"] = fileLocs;
		    	returnObject["markers"] = markersArray;

		    	if (dataFileString.length > 0) {
					dataFileString = dataFileString.substring(0, dataFileString.length-1)
				}
				fs.writeFile("client/" + dataFileLoc, dataFileString, function(err) {
					if (err) {
						console.log(err)
					}
					else {
						console.log("The file was saved to data.dat")
					}
				})

				if (mapFileString.length > 0) {
					mapFileString = mapFileString.substring(0, mapFileString.length-1)
				}
				fs.writeFile("client/" + mapFileLoc, mapFileString, function(err) {
					if (err) {
						console.log(err)
					}
					else {
						console.log("The file was saved to map.map")
					}
				})

				peopleFileString = ''
				for (var i = 0; i < people.length; i++) {
					peopleFileString += people[i] + '\n'
				}
				peopleFileString = peopleFileString.substring(0, peopleFileString.length-1)
				fs.writeFile("client/" + pedigreeFileLoc, peopleFileString, function(err) {
					if (err) {
						console.log(err)
					}
					else {
						console.log("The file was saved to pedigree.ped")
					}
				});



		    	res.send(returnObject)
		    });


		});
	});

}

exports.uploadInfoFile = function(req, res) {
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files) {

		var inputStream = fs.createReadStream(files.file[0].path);
		var outStream = new stream;
		outStream.readable = true;
		outStream.writable = true;
		
		var lines = readline.createInterface({
			input: inputStream,
			output: outStream,
			terminal: false
		});

		var uuidGen = uuid.v1();
		var returnFile = "uploadFile" + uuidGen + ".txt"
		var fileLoc = "client/data/" + returnFile
		var people = ''

			
		lines.on('line', function(line) {
			console.log(line)
			if (line.indexOf('\t') > -1 || line.indexOf(' ') > 1) {
				split = line.split(/[ \t]+/);
				if (split.length != 6) {
					console.log(split.length)
					res.send(line, 498)
				}
				person = split.join('\t');
				//console.log(person)
				people += person + '\n'
			}
		});
		lines.on('error', function() {
			res.send(line, 498)
		});
		lines.on('close', function() {
			fs.writeFile(fileLoc, people, function(err) {
				if (err){
					console.log(err)
				}
				else {
					console.log("File saved")
				}
			})
			res.send(returnFile)
		});
	

	});


}

exports.getSamples = function(req, res) {
	var peopleArray = []
	var skipped = 0
	var form = new multiparty.Form()
	form.parse(req, function(err, fields, files) {


      	console.log(files.file[0])
		var readStream = fs.createReadStream(files.file[0].path);
		var outStream = new stream;
		outStream.readable = true;
		outStream.writable = true;
		
		var rl = readline.createInterface({
			input: readStream,
			output: outStream,
			terminal: false
		});

		rl.on('line', function(line) {
			
			//console.log(line)
			if (line.toString().substring(0, 2) == "##") {
				skipped += 1
			}
			else if (line.toString().substring(0,1) == "#") {
				importantLine = line.toString()
		    	splitImportant = importantLine.split(/[ \t]+/)
		    	for (var i = 0; i < splitImportant.length; i++) {
		    		if (possibleNotSampleStrings.indexOf(splitImportant[i]) == -1) {
		    			samplesBegin = i;
		    			break;
		    		}
		    	}
		    	numberSamples = splitImportant.length - samplesBegin;
		    	for (var i = samplesBegin; i < samplesBegin+numberSamples; i++){
		    		peopleArray.push(splitImportant[i]);
		    	}
		    	console.log(peopleArray)
		    	rl.close();
		    	//console.log("Close")
			}
		});

		rl.on('close', function() {
	    	res.send(peopleArray)

		})
		rl.on('error', function(err) {
			console.log(err)
			res.send("Error")
		})
	});	
}


exports.createFreq = function(req, res) {
	var markerString = req.params.markerString
	console.log(markerString)
	markerString = markerString.split("$$").join('\t')
	markerString = markerString.split("@@").join('\n')
	console.log(markerString)
	var uuidGen = uuid.v1();
	var returnFile = "/data/freqsFile" + uuidGen + ".txt"
	var fileLoc = "client" + returnFile
	var people = ''
	fs.writeFile(fileLoc, markerString, function(err) {
		if (err){
			console.log(err)
		}
		else {
			console.log("File saved")
			res.send(returnFile)

		}
	})


}


