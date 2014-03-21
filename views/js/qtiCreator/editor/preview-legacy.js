define([
  'jquery',
  'jquerytools',
  'taoQtiItemCreator/editor/base'
], function($, jquerytools, base){
  'use strict'

  /**
   * Preview the item.
   *
   * This uses jQuery toolbox expose() to cover the editor part
   * and highlight the item only without any tools, grid guides and such
   *
   * @todo there might be tools such as ck editor active, they need to be hidden too
   * @author <a href="mailto:dieter@taotesting.com">Dieter Raber</a>
   */
  var preview = function() {
    $('#preview-trigger').on('click', function() {
      var cols = base.item.find($('[class*="col-"]')),
        originalBorderColor = cols.css('border-color');
      // expose the currently active item
      // this is with a view to future versions that might
      // implement multiple items in tabs
      base.item.expose({
        opacity:.9,
        onBeforeLoad: function() {
          cols.css({borderColor: 'transparent'});
        },
        onBeforeClose: function() {
          cols.css({borderColor: originalBorderColor});
        }
      });
    });
  }
  return preview;
});


