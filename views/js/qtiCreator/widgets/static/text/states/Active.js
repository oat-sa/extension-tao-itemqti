define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Active',
    'taoQtiItem/qtiCreator/helper/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'lodash'
], function(stateFactory, Active, htmlEditor, content, _){
    
    var TextActive = stateFactory.create(Active, function(){
        
        var _widget = this.widget;
        
        _widget.beforeStateInit(function(e, element, state){
            
            var serial = element.getSerial();
            if(state.name === 'active' && serial !== _widget.serial){
                //call sleep whenever other widget is active
                _widget.changeState('sleep');
            }
            
        }, 'otherActive');
        
        _widget.$container.on('click.active', function(e){
           e.stopPropagation(); 
        });
        $('#item-editor-panel').on('click.active', function(){
            _widget.changeState('sleep');
        });
        
        this.buildEditor();
        
    }, function(){
        
        this.widget.$container.off('.active');
        $('#item-editor-panel').off('.active');
        
        this.widget.offEvents('otherActive');
        
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