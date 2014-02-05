app.post('/upload',function(req,res) {
	var newLines = ""
  var skipped = 0
  var importantLine
  var people = {}
  var posInfo = []

  //console.log(req.files);
	new lazy(fs.createReadStream(req.files.displayImage.path))
    .lines
    .forEach(function(line) {
      if (line.toString().substring(0, 2) == "##") {
        skipped += 1
      }
      else if (line.toString().substring(0,1) == "#") {
        importantLine = line.toString()
        numberSamples = importantLine.match(/NA/g).length
        splitImportant = importantLine.split("\t")
        samplesBegin = splitImportant.length - numberSamples;
        chromPos = splitImportant.indexOf("CHROM")
        if (chromPos == -1) {
          chromPos = splitImportant.indexOf("#CHROM")
        }
        posPos = splitImportant.indexOf("POS")
        idPos = splitImportant.indexOf("ID")
        refPos = splitImportant.indexOf("REF")
        altPos = splitImportant.indexOf("ALT")
        for (var i = 0; i < numberSamples; i++) {
          people[i] = "";
        }

      }
      else {
        thisLine = line.toString()
        splitLine = thisLine.split("\t")
        var info = {}
        info.chromosome = splitLine[chromPos]
        info.position = splitLine[posPos]
        info.id = splitLine[idPos]
        info.ref = splitLine[refPos]
        info.alt = splitLine[altPos]
        posInfo.push(info)



        count = 0;
        for (var i = samplesBegin; i < splitLine.length; i++) {
          var individualInfo = splitLine[i].toString()
          var slashPos = individualInfo.indexOf('/')
          var chromosomeString = individualInfo.substring(slashPos-1, slashPos+2)
          people[count] = people[count] + " " + chromosomeString
          count++;
        }
        newLines += line
        //lose += 1;
      }
    })
    .on('pipe', function() {
      var peoplePath = "people.txt";
      var locusPath = "locus.txt"


      var peopleString = ""
      var chromosomeString = ""
      for (var person in people) {
        peopleString += people[person].substring(1,people[person].length) + '\n'

      }

      for (var i = 0; i < posInfo.length; i ++) {
        for (var data in posInfo[i]) {
          chromosomeString += posInfo[i][data] + ' '
        }
        chromosomeString += '\n'

      }



      fs.writeFile(peoplePath, peopleString, function (err) {
        ///console.log(newLines)
        res.redirect("back");
      });
      fs.writeFile(locusPath, chromosomeString, function (err) {

      });
    });

  // ...
	  

});


function processFile(data) {

  console.log(data.toString())
}
