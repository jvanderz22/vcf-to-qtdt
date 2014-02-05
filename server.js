if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development"
}
var fs = require('fs');
var express = require('express')
  , http = require('http')
  , path = require('path')
  , reload = require('reload')
  , colors = require('colors')
  , sys = require('sys')
  , multiparty = require('multiparty')
  , file = require('./server/fileIO')

var app = express()

var clientDir = path.join(__dirname, 'client')


app.configure(function() {
  app.set('port', process.env.PORT || 3000)
  app.use(express.favicon())
  app.use(express.logger('dev'))
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(app.router) 
  //app.use(express.multipart());
  app.use(express.static(clientDir)) 


})

app.configure('development', function(){
  app.use(express.errorHandler());
})



app.get('/', function(req, res) {
  console.log("Sending");
  res.sendfile(path.join(clientDir, 'index.html'))
})


//var filepath = "CEU.low_coverage.2010_10.deletions.genotypes.vcf"

app.post('/api/getFiles/:nameString/:familyIdString/:motherString/:fatherString/:sexString/:phenotypeString', file.getFiles)
app.post('/api/getSamples', file.getSamples)
app.post('/api/getFilesFromFile/:file', file.getFilesFromFile)
app.post('/api/uploadInfoFile', file.uploadInfoFile)
app.post('/api/createFreq/:markerString', file.createFreq)

var dirPath = clientDir + '/data/'
var minutes = 5
var interval = minutes*60*1000

setInterval(function() {
  fs.readdir( dirPath, function( err, files ) {
      if ( err ) return console.log( err );
      files.forEach(function( file ) {
          var filePath = dirPath + file;
          console.log(filePath)
          fs.stat( filePath, function( err, stat ) {
              if ( err ) return console.log( err );
              var livesUntil = new Date();
              livesUntil.setHours(livesUntil.getHours() - 1);
              if ( stat.ctime < livesUntil ) {
                  fs.unlink( filePath, function( err ) {
                      if ( err ) return console.log( err );
                  });
              }
          });
      });
  })
}, interval)



var server = http.createServer(app)

reload(server, app)

server.listen(app.get('port'), function(){
  console.log(process.env.NODE_ENV)
  console.log("Web server listening in %s on port %d", colors.red(process.env.NODE_ENV), app.get('port'));
});










