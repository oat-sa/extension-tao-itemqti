define([
  'taoQtiItemCreator/editor/toggleToolDisplay',
  'taoQtiItemCreator/editor/preview',
  'taoQtiItemCreator/editor/fontSelector',
  'taoQtiItemCreator/editor/itemResizer',
  'taoQtiItemCreator/editor/preparePrint',
  'taoQtiItemCreator/editor/toggleAppearance',
  'taoQtiItemCreator/editor/listStyler',
  'taoQtiItemCreator/editor/widgetToolbar',
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
