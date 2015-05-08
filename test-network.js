var brain = require('brain');
var fs = require('fs');
var Q = require('q');
_ = require("lodash");

var networkFile = 'nets/network.json';
var testFile = 'data/t10k-images-idx3-ubyte';

// Image dimensions
var imageWidth = 28;
var imageHeight = 28;
var bufferSize = imageWidth * imageHeight; // 28^2 = 784

// In the MNIST test file, images start at byte 16
var imageOffset = 16;

// Number of images to extract from MNIST test file (max = 10000)
var numberOfImagesToExtract = 22;

// Array of expected classifications (for measuring performance accuracy)
var expectedResults = [7, 2, 1, 0, 4, 1, 4, 9, 5, 9, 0,
                       6, 9, 0, 1, 5, 9, 7, 3, 4, 9, 6];
var numberCorrect = 0;

// Initialize the network
var net = new brain.NeuralNetwork();

// Load the saved network from disk
var loadNetwork = function() {

  var networkJson = fs.readFileSync(networkFile, 'utf8');

  net.fromJSON(JSON.parse(networkJson));
};

// Load images and test them against the network
var testImages = function() {

  // fs.open is async, so use a promise
  var deferred = Q.defer();

  fs.open(testFile, 'r', function(status, fileDescriptor){

    if (status) {
      console.log(status);
      return;
    }

    for(var fileIndex = 0; fileIndex < numberOfImagesToExtract; fileIndex++) {

      readFile(fileDescriptor, fileIndex);
    }

    deferred.resolve();

  });

  return deferred.promise;
};

// Read the file from the MNIST test file
var readFile = function(fileDescriptor, fileIndex) {

  var buffer = new Buffer(bufferSize);

  var startOffset = imageOffset + (fileIndex * bufferSize);

  fs.readSync(fileDescriptor, buffer, 0, bufferSize, startOffset);

  console.log("Image #: " + fileIndex);
  var classification = classifyImage(buffer);

  if (classification == expectedResults[fileIndex]) {
    numberCorrect++;
  }

};

// Classify the given image buffer
var classifyImage = function(buffer) {

  var input = _.map(buffer, function(byte) {
    return (255 - byte) / 255;
  });

  var output = net.run(input);

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

  console.log(classification + " (" + probability + ")");

  return classification;
};

// Entry point
loadNetwork();
testImages().then(function() {
  console.log("---------------------");
  console.log("# Correct: " + numberCorrect);
  console.log("Accuracy: " + (numberCorrect / expectedResults.length));
});
