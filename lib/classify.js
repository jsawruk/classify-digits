// Image classifier

var brain = require('brain');
var fs = require('fs');
var PNG = require('node-png').PNG;
var Q = require('q');
_ = require("lodash");

var networkFile = 'nets/network.json';

// Constructor
var Classifier = exports.Classifier = function() {

  // Initialize the network
  this.net = new brain.NeuralNetwork();
  var networkJson = fs.readFileSync(networkFile, 'utf8');
  this.net.fromJSON(JSON.parse(networkJson));

};

Classifier.prototype.classifyFile = function(filename) {

  var deferred = Q.defer();

  var that = this;
  // Load the PNG file
  fs.createReadStream(filename).pipe(new PNG()).on('parsed', function(){

    var classifyBuffer = new Buffer(this.width * this.height);
    var bufferOffset = 0;

    // Convert the data
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var index = (this.width * y + x) << 2;

        // Only write one channel (network expects greyscale)
        classifyBuffer.writeUInt8(this.data[index], bufferOffset);

        bufferOffset++;

      }
    }

    // Get the classification result
    var result = that.classifyBuffer(classifyBuffer);
    deferred.resolve(result);
  });

  return deferred.promise;
};

Classifier.prototype.classifyBuffer = function(buffer) {

  // Normalize the input
  var input = _.map(buffer, function(byte) {
    return byte / 255;
  });

  var output = this.net.run(input);

  var probability = 0;
  var classification = -1;
  var index = 0;

  _.forEach(output, function(item) {

    if (item > probability) {
      probability = item;
      classification = index;
    }

    index++;

  });

  //console.log(classification + " (" + probability + ")");

  //return classification;

  return {classification: classification, probability: probability};

};
