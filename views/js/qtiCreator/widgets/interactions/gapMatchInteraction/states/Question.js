define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/gapMatch',
    'taoQtiItem/qtiCreator/helper/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/helpers/content',
    'taoQtiItem/qtiCreator/widgets/helpers/textWrapper',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/htmlEditorTrigger',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/gap-create'
], function(stateFactory, Question, formElement, formTpl, htmlEditor, gridContentHelper, htmlContentHelper, textWrapper, toolbarTpl, gapTpl){

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

            var $bodyTlb = $(toolbarTpl({
                serial : _widget.serial,
                state : 'question'
            }));

            //add toolbar once only:
            $editableContainer.append($bodyTlb);
            $bodyTlb.show();

            //init text wrapper
            _initTextWrapper($editableContainer.find('[data-html-editable]'));

            //create editor
            htmlEditor.buildEditor($editableContainer, {
                change : gridContentHelper.getChangeCallback(container),
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

    var _initTextWrapper = function($editable){

        //create gap creation tlb:
        var $gapTlb = $(gapTpl()).show();
        
        $gapTlb.on('mousedown', function(e){
            e.stopPropagation();
            var $wrapper = $gapTlb.parent();
            var text = $wrapper.text();
            console.log('create gap ', text);
            htmlContentHelper.createElements();
        });

        //init text wrapper:
        $editable.on('editorready', function(){
            textWrapper.init($(this));
        }).on('wrapped', function(e, $wrapper){
            $wrapper.append($gapTlb);
        }).on('beforeunwrap', function(){
            $gapTlb.detach();
        });
    };

    return GapMatchInteractionStateQuestion;
});
