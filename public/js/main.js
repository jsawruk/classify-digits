$(function(){

  $('.thumbnail img').click(thumbnailClick);

});

var thumbnailClick = function(event) {
  var src = $(event.target).attr('src');

  $.ajax({
    url: '/classify',
    data: {file: src}
  }).done(function(result){

    $('#classification').text('Classification: ' + result.classification);
    $('.progress-bar').css({width: (result.probability * 100) + '%'});
    $('.progress-bar').text((result.probability * 100) + '%');
  });

};
