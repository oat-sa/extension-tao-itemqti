define([
    'taoQtiItemCreator/widgets/states/factory',
    'taoQtiItemCreator/widgets/interactions/states/Question',
    'taoQtiItemCreator/editor/htmlEditor',
    'tpl!taoQtiItemCreator/tpl/toolbars/htmlEditorTrigger'
], function(stateFactory, Question, htmlEditor, promptToolbarTpl){

    var BlockInteractionStateQuestion = stateFactory.extend(Question, function(){
        
        this.buildPromptEditor();

    }, function(){

        this.destroyPromptEditor();
    });

    BlockInteractionStateQuestion.prototype.buildPromptEditor = function(){
        
        var _widget = this.widget,
            $editableContainer = _widget.$container.find('.qti-prompt-container'),
            $editable = $editableContainer.find('.qti-prompt'),
            prompt = _widget.element.prompt;

        //@todo set them in the tpl
        $editableContainer.attr('data-html-editable-container', true);
        $editable.attr('data-html-editable', true);

        if(!htmlEditor.hasEditor($editableContainer)){

            //add toolbar once only:
            $editableContainer.append(promptToolbarTpl({
                serial : _widget.serial
            }));

            htmlEditor.buildEditor($editableContainer, {
                change : function(data){
                    prompt.body(data);
                }
            });
        }
    };

    BlockInteractionStateQuestion.prototype.destroyPromptEditor = function(){

        var $editableContainer = this.widget.$container.find('.qti-prompt-container');
        $editableContainer.find('.mini-tlb').remove();
        htmlEditor.destroyEditor($editableContainer);
    };

    return BlockInteractionStateQuestion;
});