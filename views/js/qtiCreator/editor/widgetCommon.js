define([
  'jquery',
  'taoQtiItem/qtiCreator/editor/base'
], function($, base){
  'use strict'

  /**
   * widget common functionality
   */
  var widgetCommon = (function() {

    /**
     * List of all block elements
     * @type {Array}
     */
    var blockElementArr = ['h2', 'h3', 'h4', 'h5', 'h6', 'address', 'article', 'aside', 'audio', 'blockquote', 'canvas', 'dd', 'div', 'dl', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'header', 'hgroup', 'hr', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table', 'tfoot', 'ul', 'video'],

      /**
       * block elements a s jQuery selector
       * @type {string}
       */
        blockElementStr = blockElementArr.join(','),

      /**
       * Currently used item
       * @type {*}
       */
        item    = base.getActiveItem(),

      /**
       * Currently used widget
       * @type {*}
       */
        widget  = base.getActiveWidget(),

      /**
       * All widgets within active item
       * @type {*|find|find|find|find|find}
       */
        widgets = item.find('.item-editor-widget'),

      /**
       *
       * @type {*|find|find|find|find|find}
       */
        blocks = widget.find(blockElementStr),

      /**
       * Currently active block element
       * @type {*|find|find|find|find|find}
       */
        block = widget.find('.active-block');

    /**
     * Toggle active widget
     */
    widgets.on('click', function(e) {
      block  = $(e.target).closest(blockElementStr);
      widget = $(this);

      if(!widget.hasClass('active-widget')) {
        // activate widget
        widgets.removeClass('active-widget');
        widget.addClass('active-widget');
        base.setActiveWidget(widget);
        blocks.removeClass('active-block');
      }

      if(!block.hasClass('active-widget')) {
        // activate block
        blocks.removeClass('active-block');
        block.addClass('active-block');
        base.setActiveBlock(block);
      }
    });

  }());
  return widgetCommon;
});


