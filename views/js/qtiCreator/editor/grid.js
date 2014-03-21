define([
  'jquery',
  'taoQtiItem/qtiCreator/editor/base'
], function($, base){
  'use strict'

  /**
   * @author <a href="mailto:dieter@taotesting.com">Dieter Raber</a>
   */
  var grid = function() {

    var activeRow = null;

    /**
     * add an empty row to the drop area
     */
    var addRow = function() {
      var newRow = $('<div>', {
        'class': 'item-editor-row'
      });
      newRow.data('available-cols', 12);
      newRow.on('mouseover', function() {
        activeRow = $(this);
      });
      base.dropArea.append(newRow);
    };

    /**
     * removes unused rows from grid
     */
    var removeEmptyRows = function() {
      $('.item-editor-row').each(function() {
        if(!$.trim(this.innerHTML)) {
          this.parentNode.removeChild(this);
        }
      });
    };

    /**
     * @todo: somehow compute space to see whether the widget fits
     * @param widget
     */
    var recalculateAvailableCols = function(widget) {

    };

    var denyDrop = function() {
      //if there is not enough space in the row for the widget, deny the dropping of the draggable
    };

    var acceptDrop = function() {
      //accept draggable and make space (e.g by resizing existing multi-col blocks in this row)
    };

    /**
     *
     * @param widget
     * @param bool apply whether to really apply the resizing or just visualise it
     */
    var resizeSibling = function(widget, apply) {
      apply = apply || false;
    };

    return {
      addRow : addRow
    };

  }
  return grid;
});


