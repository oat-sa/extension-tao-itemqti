define(['jquery'], function($){
    
    function getSelection() {

        var selection;

        if (window.getSelection) {
            selection = window.getSelection();
        } else if (document.selection) {
            selection = document.selection.createRange();
        }

        return selection;
    }

    function wrapSelection(wrap) {

        var sel = getSelection();
        if (sel.rangeCount) {
            var range = sel.getRangeAt(0).cloneRange();
            if (range.startOffset !== range.endOffset) { //prevent empty selection
                range.surroundContents(wrap);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }
    
    function unwrapSelection($editable) {
        
        $editable.find('#selection-wrapper').replaceWith(function() {
            return $(this).text();
        });
    }
    
    var textWrapper = {
        init : function($editable){
            
            $editable.on('mouseup', function() {
                
                var $wrapper = $('<span>', {id: 'selection-wrapper'}).css({fontWeight: 'bold', color: 'green'});
                wrapSelection($wrapper[0]);
                $editable.trigger('wrapped', [$wrapper]);
                
            }).on('mousedown', function() {
                $editable.trigger('beforeunwrap');
                unwrapSelection($editable);
                $editable.trigger('unwrapped');
            });
            
        }
    };
    
    return textWrapper;
});