define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCreator/helper/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function(stateFactory, Active, htmlEditor, content){
    
    var TextActive = stateFactory.extend(Active, function(){
        
        this.buildEditor();
        
    }, function(){
        
        this.destroyEditor();
    });

    TextActive.prototype.buildEditor = function(){

        var widget = this.widget,
            $editableContainer = widget.$container,
            container = widget.element;

        $editableContainer.attr('data-html-editable-container', true);

        if(!htmlEditor.hasEditor($editableContainer)){
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
    
    return TextActive;
});