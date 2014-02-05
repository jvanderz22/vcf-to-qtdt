app.controller('UploadController', function($location, $http, $scope, $upload, $rootScope) {
	$rootScope.myModelObj = {}
	$scope.onFileSelect = function($files) {
    
		$rootScope.$file = $files[0];
		$scope.upload = $upload.upload({
	        url: 'api/getSamples', 
	        
	        file: $rootScope.$file,
	        
    	}).progress(function(evt) {
    		var percent = parseInt(100.0 * evt.loaded / evt.total)
    		console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
    		alert
    	}).success(function(data, status, headers, config) {
        // file is uploaded successfully
        	if (typeof(data) == "object") {
        		if (Object.prototype.toString.call(data) == "[object Array]") {
    				if (data.length > 0) {
    					$rootScope.samples = data;
        				console.log($rootScope)
        				$location.path("/defineSamples")
    				}
    				else {
    					alert("No samples found in file input. Please try again.")

    				}
    			}
    			else {
	   				alert("No samples found in file input. Please try again.")

    			}
			}
			else {
				alert("No samples found in file input. Please try again.")

        	}


        	
        });
	      //.error(...)
	      //.then(success, error, progress);
	}
});


app.controller('DefineSamplesController', function($location, $http, $scope, $upload, $rootScope) {
	$scope.sampleData = []
	for (var i = 0; i < $rootScope.samples.length; i++) {
		sample = {}
		sample["Name"] = $rootScope.samples[i];
		sample["FamilyId"] = ""
		sample["Mother"] = ""
		sample["Father"] = ""
		sample["Sex"] = ""
		sample["Phenotype"] = ""
		$scope.sampleData.push(sample)
	}


	$scope.submitAsFile = function($files) {
		console.log($files)
		$scope.upload = $upload.upload({
			url:'api/uploadInfoFile',
			file: $files[0],


		}).progress(function(evt) {
    		console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
    	}).success(function(data, status, headers, config) {
        // file is uploaded successfully
			var importFile = data;
			console.log(importFile)
			$scope.upload = $upload.upload({
				url:'api/getFilesFromFile/' + importFile,
				file: $rootScope.$file,

			}).progress(function(evt) {
				console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
			}).success(function(data, status, headers, config) {
				// file is uploaded successfully
				

				console.log(data)
        		$rootScope.fileLocs = data.fileLocs;
        		$rootScope.markers = data.markers
        		//console.log($rootScope)
        		$location.path("/downloadFiles")
			}).error(function(data, status, headers, config) {
				alert(data)

			}); 
        }).error(function(data, status, headers, config) {
        	alert(data)
        }); 


	}



	$scope.submitSamples = function() {
		var nameString = ''
		var familyIdString = ''
		var motherString = ''
		var fatherString = ''
		var sexString = ''
		var phenotypeString = ''
		for (var i = 0; i < $scope.sampleData.length; i++) {
			var sample = $scope.sampleData[i]
			var emptyString = '';
			if (sample["Name"] == emptyString) {
				alert("Name Field Missing")
				return
			}
			if (sample["FamilyId"] == emptyString) {
				alert("FamilyId field missing. Make sure all information is filled in before submitting.");
				return
			}
			if (sample["Mother"] == emptyString) {
				alert("Mother field missing. Make sure all information is filled in before submitting.");
				return
			}
			if (sample["Father"] == emptyString) {
				alert("Father field missing. Make sure all information is filled in before submitting.");
				return
			} 
			if (sample["Sex"] == emptyString) {
				alert("Sex field missing. Make sure all information is filled in before submitting.");
				return;
			}
			if (sample["Phenotype"] == emptyString) {
				alert("Phenotype entry incomplete. Please fill out all fields");
				return;
			}
			nameString += sample["Name"] + ";"
			familyIdString += sample["FamilyId"] + ";"
			motherString += sample["Mother"] + ";"
			fatherString += sample["Father"] + ";"
			sexString += sample["Sex"] + ";"
			phenotypeString += sample["Phenotype"] + ";"

		}

		urlString = 'api/getFiles/' + nameString + '/' + familyIdString + '/' 
		urlString += motherString + '/' + fatherString + '/' + sexString + '/' + phenotypeString

		$scope.upload = $upload.upload({
	        url: urlString, //upload.php script, node.js route, or servlet url
	        // method: POST or PUT,
	        // headers: {'headerKey': 'headerValue'}, withCredential: true,
	       // data: {myObj: $scope.myModelObj},
	        file: $rootScope.$file,
	        /* set file formData name for 'Content-Desposition' header. Default: 'file' */
	        //fileFormDataName: myFile,
	        /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
	        //formDataAppender: function(formData, key, val){} 
    	}).progress(function(evt) {
    		console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
    	}).success(function(data, status, headers, config) {
        	 
        	console.log(data)
        	$rootScope.fileLocs = data.fileLocs;
        	$rootScope.markers = data.markers
        	$location.path("/downloadFiles")
        }); 


	}
});

app.controller('DownloadController', function($location, $http, $scope, $upload, $rootScope) {
	$scope.createFreq = function() {
		$location.path("/createFreq")
	}

});

app.controller('PenetranceController', function($scope) {
	$scope.diseaseAffected = ''
	$scope.withMutation = ''

	$scope.calculate = function(diseaseAffected, withMutation) {
		$scope.penetrance = diseaseAffected/withMutation;

	}
})

app.controller('FrequencyController', function($scope, $rootScope, $http, $location) {
	$scope.uploadMarkers = []
	for (var i = 0; i < $rootScope.markers.length; i++) {
		var marker = {}
		marker.markerID = $rootScope.markers[i].markerID
		var alleles = []
		for (var j = 0; j < $rootScope.markers[i].alleles.length; j++) {
			var allele = {}
			allele.sequence = $rootScope.markers[i].alleles[j]
			allele.freq = ''
			alleles.push(allele)
		}
		marker.alleles = alleles
		marker.refFreq = ''
		$scope.uploadMarkers.push(marker)
	}

	$scope.submitFrequencies = function() {
		var markers = $scope.uploadMarkers;
		var markerString = ''
		for (var i = 0; i < markers.length; i++) {
			var refVal;
			markerString += "M$$" + markers[i].markerID + "@@"
			if (markers[i].refFreq == '') {
				alert("All Frequencies Must Be Given Values")
			}
			else {
				refVal = parseFloat(markers[i].refFreq)
				var alleleFreqCount = 0
				markerString += "F$$" + refVal + "@@"
				for (var j = 0; j < markers[i].alleles.length; j++) {
					if (markers[i].alleles[j].freq == '') {
						break;
					}
					var alleleVal = parseFloat(markers[i].alleles[j].freq)
					alleleFreqCount += alleleVal;
					markerString += "F$$" + alleleVal + "@@"
				}
				var totalCount = alleleFreqCount + refVal
				if (totalCount != 1) {
					alert("Frequencies For Each Marker Must Add Up To 1")
					return;
				}
			}
		}
		$http.post('/api/createFreq/' + markerString).then(function(data) {
			$rootScope.frequencyFile = data.data
			$location.path('/downloadFreq')
		})


	}


})
