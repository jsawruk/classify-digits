$(function(){

  $('.thumbnail img').click(thumbnailClick);

});

var thumbnailClick = function(event) {
  var src = $(event.target).attr('src');

  $.ajax({
    url: '/classify',
    data: {file: src}
  });

};
