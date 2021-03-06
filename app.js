var express = require('express');
var exphbs  = require('express-handlebars');  // Handlebars template engine
var fs = require('fs');
var Classifier = require('./lib/classify.js').Classifier;

var app = express();

var classifier = new Classifier();

var testImages = fs.readdirSync('public/test-images');
testImages = testImages.filter(function(file) { return file.substr(-4) === '.png'});

// Set Handlebars as template engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Make the image directory static
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.render('home', {
    images: testImages
  });
});

app.get('/classify', function(req, res){

  classifier.classifyFile('public/' + req.query.file).then(function(result){
    res.send(result);
  });
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
