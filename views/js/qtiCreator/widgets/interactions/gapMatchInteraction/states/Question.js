define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/gapMatch',
    'taoQtiItem/qtiCreator/helper/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/htmlEditorTrigger'
], function(stateFactory, Question, formElement, formTpl, htmlEditor, contentHelper, toolbarTpl){

    var GapMatchInteractionStateQuestion = stateFactory.extend(Question, function(){
        
        this.buildEditor();
        
    }, function(){
        
        this.destroyEditor();
        
    });

    GapMatchInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element;

        $form.html(formTpl({
            shuffle : !!interaction.attr('shuffle')
        }));

        formElement.initWidget($form);
        
        formElement.initDataBinding($form, interaction, {
            shuffle : formElement.getAttributeChangeCallback()
        });
        
    };
    
    GapMatchInteractionStateQuestion.prototype.buildEditor = function(){

        var _widget = this.widget,
            container = _widget.element.getBody(),
            $editableContainer = _widget.$container.find('.qti-flow-container');

        //@todo set them in the tpl
        $editableContainer.attr('data-html-editable-container', true);

        if(!htmlEditor.hasEditor($editableContainer)){
            
            var $tlb = $(toolbarTpl({
                serial : _widget.serial,
                state : 'question'
            }));
            
            //add toolbar once only:
            $editableContainer.append($tlb);
            $tlb.show();
            
            htmlEditor.buildEditor($editableContainer, {
                change : contentHelper.getChangeCallback(container),
                data : {
                    container : container,
                    widget : _widget
                }
            });
        }
    };

    GapMatchInteractionStateQuestion.prototype.destroyEditor = function(){
        
        //search and destroy the editor
        htmlEditor.destroyEditor(this.widget.$container.find('.qti-flow-container'));
    };
    
    return GapMatchInteractionStateQuestion;
});
