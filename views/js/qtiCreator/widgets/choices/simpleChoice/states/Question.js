define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Question',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/choices/choice',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/identifier',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content'
], function(stateFactory, Question, formTpl, formElement, identifierHelper, htmlEditor, contentHelper){

    var SimpleChoiceStateChoice = stateFactory.extend(Question, function(){
        
        this.buildEditor();
        
    }, function(){
        
        this.destroyEditor();
    });

    SimpleChoiceStateChoice.prototype.initForm = function(){

    };
    
    SimpleChoiceStateChoice.prototype.buildEditor = function(){

        var _widget = this.widget,
            container = _widget.element.getBody(),
            $editableContainer = _widget.$container;

        //@todo set them in the tpl
        $editableContainer.attr('data-html-editable-container', true);

        if(!htmlEditor.hasEditor($editableContainer)){
            
            htmlEditor.buildEditor($editableContainer, {
                change : contentHelper.getChangeCallback(container),
                data : {
                    container : container,
                    widget : _widget
                }
            });
        }
    };

    SimpleChoiceStateChoice.prototype.destroyEditor = function(){
        
        //search and destroy the editor
        htmlEditor.destroyEditor(this.widget.$container);
    };

    return SimpleChoiceStateChoice;
});