define([
  'taoQtiItem/qtiCreator/editor/toggleToolDisplay',
  'taoQtiItem/qtiCreator/editor/preview',
  'taoQtiItem/qtiCreator/editor/fontSelector',
  'taoQtiItem/qtiCreator/editor/itemResizer',
  'taoQtiItem/qtiCreator/editor/preparePrint',
  'taoQtiItem/qtiCreator/editor/toggleAppearance',
  'taoQtiItem/qtiCreator/editor/listStyler',
  'taoQtiItem/qtiCreator/editor/widgetToolbar',
  'ckeditor'
], function(toggleToolDisplay, preview, fontSelector, itemResizer, preparePrint, toggleAppearance, listStyler, widgetToolbar, ckeditor){

  return {
    start : function(){
      ckeditor.disableAutoInline = true;
      toggleToolDisplay();
      preview.init('#preview-trigger');
      fontSelector('#item-editor-font-selector');
      itemResizer();
      preparePrint();
      toggleAppearance();
      listStyler();
    }
  };

})
