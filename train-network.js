var brain = require('brain');
var fs = require('fs');
var Q = require('q');
_ = require("lodash");

// Training data files
var imageFile = 'data/train-images-idx3-ubyte';
var labelFile = 'data/train-labels-idx1-ubyte';
var networkFile = 'data/network.json';

// Image dimensions
var imageWidth = 28;
var imageHeight = 28;
var bufferSize = imageWidth * imageHeight; // 28^2 = 784
var labelSize = 1; // Labels are 1 byte

// In the MNIST test file, images start at byte 16 and labels at byte 8
var imageOffset = 16;
var labelOffset = 8;

// Number of images to extract from MNIST test file (max = 10000)
var numberOfImagesToExtract = 10;

// Array to hold the training data
// Each entry is an object: {image: , label: }
var trainingData = [];

// Initialize the network
var net = new brain.NeuralNetwork();

// Load the training data
var readTrainingData = function() {

  // fs.open is async, so use a promise
  var deferred = Q.defer();

  fs.open(imageFile, 'r', function(status, fileDescriptor){

    if (status) {
      console.log(status);
      return;
    }

    for(var imageIndex = 0; imageIndex < numberOfImagesToExtract; imageIndex++) {
      var buffer = readImage(fileDescriptor, imageIndex);

      var data = {image: buffer};
      trainingData.push(data);
    }

    deferred.resolve();

  });

  return deferred.promise;
};

// Read the image from the MNIST test file
var readImage = function(fileDescriptor, imageIndex) {

  var buffer = new Buffer(bufferSize);

  var startOffset = imageOffset + (imageIndex * bufferSize);

  fs.readSync(fileDescriptor, buffer, 0, bufferSize, startOffset);

  return buffer;
};

var readTrainingLabels = function() {

  // fs.open is async, so use a promise
  var deferred = Q.defer();

  fs.open(labelFile, 'r', function(status, fileDescriptor){

    if (status) {
      console.log(status);
      return;
    }

    for(var imageIndex = 0; imageIndex < numberOfImagesToExtract; imageIndex++) {
      var label = readLabel(fileDescriptor, imageIndex);

      trainingData[imageIndex].label = label;
    }

    deferred.resolve();

  });

  return deferred.promise;
};

// Read the label from the MNIST test file
var readLabel = function(fileDescriptor, imageIndex) {

  var buffer = new Buffer(labelSize);

  var startOffset = labelOffset + (imageIndex * labelSize);

  fs.readSync(fileDescriptor, buffer, 0, labelSize, startOffset);

  // Return the label instead of the buffer
  return buffer.readUInt8(0);
};

var trainNetwork = function() {

  console.log('trainNetwork');

  // Train the network
  // input: array of numbers 0 - 1
  // output: label 0 or 1
  var netTraining = _.map(trainingData, function(data) {

    // Convert the input to a range of 0 - 1
    // In the MNIST data, 0 = white, 1 = black
    var input = _.map(data.image, function(byte){
      return (255 - byte) / 255;
    });

    var output = {};
    output[data.label] = 1;

    return {input: input, output: output};

  });

  net.train(netTraining);

  // Save the training results for later use
  var netJson = JSON.stringify(net.toJSON());
  fs.writeFile(networkFile, netJson);
};


// Entry point
readTrainingData()
  .then(readTrainingLabels)
  .then(trainNetwork);
