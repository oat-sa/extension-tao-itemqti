define([
  'jquery',
  'taoQtiItem/qtiCreator/editor/base'
], function($, base){
  'use strict'

  /**
   * Prepare item for printing.
   *
   * @author <a href="mailto:dieter@taotesting.com">Dieter Raber</a>
   */
  var preparePrint = function() {

    function initHideOnPrint(elem) {
      elem.siblings().each(function() {
        $(this).addClass('item-no-print');
      });
      return elem.parent();
    }

    var parent = initHideOnPrint(base.scope.parent());
    while(parent.get(0).nodeName.toLowerCase() !== 'body') {
      parent = initHideOnPrint(parent);
    }

    base.toolbar.add(base.sidebars).add(base.overlay).addClass('item-no-print');
  }

  $('#print-trigger').on('click', function() {
    window.print();
  });

  return preparePrint;
});


