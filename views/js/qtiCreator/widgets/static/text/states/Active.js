define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCreator/helper/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/text'
], function(stateFactory, Active, htmlEditor, content, formTpl){

    var TextActive = stateFactory.extend(Active, function(){

        this.buildEditor();
        this.initForm();

    }, function(){

        this.destroyEditor();
        this.widget.$form.empty();
    });

    TextActive.prototype.buildEditor = function(){

        var widget = this.widget,
                $editableContainer = widget.$container,
                container = widget.element;

        $editableContainer.attr('data-html-editable-container', true);
        
        if (!htmlEditor.hasEditor($editableContainer)) {
            
            _protoGapInsertion($editableContainer.find('[data-html-editable]'));
            
            htmlEditor.buildEditor($editableContainer, {
                change : content.getChangeCallback(container),
                blur : function(){
                    widget.changeState('sleep');
                },
                data : {
                    element : container,
                    widget : widget
                }
            });
        }
    };

    TextActive.prototype.destroyEditor = function(){
        //search and destroy the editor
        htmlEditor.destroyEditor(this.widget.$container);
    };

    TextActive.prototype.initForm = function(){
        this.widget.$form.html(formTpl());
    };

    /**
     * Prototyping gap match and hottext editor
     */
    
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

            console.log('range', range);

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
        
    var _protoGapInsertion = function($editable) {
            
        $editable.on('editorready', function() {
            
            $editable.on('mouseup', function() {
                
                var $wrapper = $('<span>', {id: 'selection-wrapper'}).css({fontWeight: 'bold', color: 'green'});
                wrapSelection($wrapper[0]);
                $wrapper.append($('<span>', {'class':'tlb'}).text('x'));
                
            }).on('mousedown', function() {
                
                unwrapSelection($editable);
            });

        });

    };

    return TextActive;
});