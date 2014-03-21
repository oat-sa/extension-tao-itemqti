

define(['jquery'], function($){
  'use strict'
  var toggleToolDisplay = function() {
    $('.tool-group h2').each(function() {
      var elem = $(this),
        arrow = $('<span data-active="icon-up" data-inactive="icon-down" class="icon-up"/>');
      elem.append(arrow);
    })
      .on('click', function () {
        var elem = $(this),
          panel = elem.parents('section').find('.panel'),
          arrow = elem.find('span');
        panel.slideToggle(200, function() {
          arrow[0].className = panel.is(':visible') ? arrow.data('active') : arrow.data('inactive');
        })
      });
  }
  return toggleToolDisplay;
});


