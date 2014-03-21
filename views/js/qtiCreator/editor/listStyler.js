define([
  'jquery',
  'taoQtiItemCreator/editor/base',
  'taoQtiItemCreator/editor/widgetCommon'
], function($, base, widgetCommon){
  'use strict'


  /**
   *
   * @todo there might be tools such as ck editor active, they need to be hidden too
   * @author <a href="mailto:dieter@taotesting.com">Dieter Raber</a>
   */
  var listStyler = function() {

    var listStyleSelectBox = base.widgetBar.find('.item-editor-list-styler'),
      classes = [],
      ulClasses = ['square','circle','disc'],

      formatOptions = function (state) {
        var symbol = state.text.match(/\(([^\.\)]+)\.?\)$/) || [],
          hasSymbol = !!(symbol.length),
          icon = symbol.pop() || '',
          wholeMatch = symbol.pop() || '',
          span = '<span class="list-symbol">' + (icon || '&nbsp;') + '</span> ';
        if(hasSymbol){
          state.text = $.trim(state.text.slice(0, -(wholeMatch.length)));
        }
        return span + state.text;
      };

    listStyleSelectBox.find('option').each(function(){
      classes.push(this.value);
    })

    classes = classes.join(',');

    listStyleSelectBox.on('change', function() {
      var block = base.getActiveBlock();

      if(!block.length) {
        return false;
      }

      var newClass = listStyleSelectBox.val(),
        currentTag  = block.get(0).nodeName.toLowerCase(),
        expectedTag = $.inArray(newClass, ulClasses) > -1 ? 'ul' : 'ol',
        newBlock;


      if(block.hasClass(newClass)) {
        return false;
      }

      // toggle ol/ul if needed
      if(currentTag !== expectedTag) {
        newBlock = $('<' + expectedTag + '>', {
          class: block.get(0).className
        });
        block.find('li').each(function(){
          newBlock.append($(this).clone());
        });
        block.replaceWith(newBlock);
        block = newBlock;
        base.setActiveBlock(block);
      }
      block.removeClass(classes).addClass(newClass);
    }).select2({
        width: '100%',
        formatResult: formatOptions,
        minimumResultsForSearch: -1
      }
    );
  }
  return listStyler;
});


