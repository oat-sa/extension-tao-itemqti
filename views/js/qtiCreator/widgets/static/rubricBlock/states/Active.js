define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/rubricBlock',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement'
], function(stateFactory, Active, formTpl, formElement){

    var RubricBlockStateActive = stateFactory.extend(Active, function(){
        
        this.addOptionForm();
        
    },function(){
        
        this.widget.$form.empty();
    });
    
    RubricBlockStateActive.prototype.buildEditor = function(){

        var _widget = this.widget,
            $editableContainer = _widget.$container;

        //@todo set them in the tpl
        $editableContainer.attr('data-html-editable-container', true);

        if(!htmlEditor.hasEditor($editableContainer)){

            htmlEditor.buildEditor($editableContainer, {
                change : function(data){
                    _widget.element.body(data);
                }
            });
        }
    };

    RubricBlockStateActive.prototype.destroyEditor = function(){
        //search and destroy the editor
        htmlEditor.destroyEditor(this.widget.$container);
    };
    
    RubricBlockStateActive.prototype.addOptionForm = function(){
        
        var _widget = this.widget;
        
        //build form:
        _widget.$form.html(formTpl({
            view:_widget.element.attr('view'),
            use:_widget.element.attr('use')
        }));
        
//        formElement.initIdentifier(_widget);
    };
    
    return RubricBlockStateActive;
});