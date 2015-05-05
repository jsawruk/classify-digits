// extract-samples.js
// Read in MNIST test images and convert to PNG using node-png
// https://github.com/liangzeng/node-png

var fs = require('fs');
var util = require('util');
var PNG = require('node-png').PNG;

// Read in data/t10k-images-idx3-ubyte
var sourceFile = 'data/t10k-images-idx3-ubyte';

// Image dimensions
var imageWidth = 28;
var imageHeight = 28;
var bufferSize = imageWidth * imageHeight; // 28^2 = 784

// In the MNIST test file, images start at byte 16
var imageOffset = 16;

// Number of images to extract from MNIST test file (max = 10000)
var numberOfImagesToExtract = 50;

fs.open(sourceFile, 'r', function(status, fileDescriptor){

  if (status) {
    console.log(status);
    return;
  }

  for(var fileIndex = 0; fileIndex < numberOfImagesToExtract; fileIndex++) {

    readFile(fileDescriptor, fileIndex);
  }

});

// Read the file from the MNIST test file
var readFile = function(fileDescriptor, fileIndex) {

  var buffer = new Buffer(bufferSize);

  var startOffset = imageOffset + (fileIndex * bufferSize);

  fs.read(fileDescriptor, buffer, 0, bufferSize, startOffset, function(error, bytesRead){

    var outputFilename = util.format('%d.png', fileIndex);
    writeBufferToPNG(buffer, outputFilename);

  });
};

// Given a buffer, write out the specified PNG file
var writeBufferToPNG = function(buffer, pngFilename) {

  var bufferIndex = 0;
  var png = new PNG({width: imageWidth, height: imageHeight});

  // Write the data into the PNG object
  for (var y = 0; y < png.height; y++) {
    for (var x = 0; x < png.width; x++) {

      var index = (png.width * y + x) << 2;

      png.data[index] = buffer[bufferIndex];      // R
      png.data[index + 1] = buffer[bufferIndex];  // G
      png.data[index + 2] = buffer[bufferIndex];  // B
      png.data[index + 3] = 0xFF;                 // A

      bufferIndex++;

    } // end for x
  } // end for y

  // Write the PNG to disk
  png.pack().pipe(fs.createWriteStream(__dirname + '/public/test-images/' + pngFilename));

};
