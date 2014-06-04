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
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/gap-create',
    'lodash'
], function(stateFactory, Question, formElement, formTpl, htmlEditor, gridContentHelper, htmlContentHelper, textWrapper, toolbarTpl, gapTpl, _){

    var GapMatchInteractionStateQuestion = stateFactory.extend(Question, function(){

        this.buildEditor();
        this.initCardinalityUpdateListener();

    }, function(){

        this.destroyEditor();
        this.destroyTextWrapper();
    });

    GapMatchInteractionStateQuestion.prototype.initCardinalityUpdateListener = function(){

        var interaction = this.widget.element,
            response = interaction.getResponseDeclaration();

        var updateCardinality = function(data){
            
            var cardinality,
                choice = data.element || data.choice;

            if(choice.qtiClass === 'gap'){
                cardinality = _.size(interaction.getGaps()) === 1 ? 'single' : 'multiple';
                response.attr('cardinality', cardinality);
            }
        };

        this.widget
            .on('elementCreated', updateCardinality)
            .on('deleted', updateCardinality);
    };

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

        var _this = this,
            _widget = this.widget,
            container = _widget.element.getBody(),
            $editableContainer = _widget.$container.find('.qti-flow-container');

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
            _this.initTextWrapper();

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

    GapMatchInteractionStateQuestion.prototype.initTextWrapper = function(){

        var interaction = this.widget.element,
            $editable = this.widget.$container.find('.qti-flow-container [data-html-editable]'),
            $gapTlb = $(gapTpl()).show(),
            $addOption = this.widget.$container.find('.choice-area .add-option');

        $gapTlb.on('mousedown', function(e){

            e.stopPropagation();//prevent rewrapping

            var $wrapper = $gapTlb.parent(),
                text = $wrapper.text().trim();

            //create choice:
            var choice = interaction.createChoice(text);
            $addOption.before(choice.render());
            choice.postRender().changeState('question');

            //create gap:
            $wrapper
                .addClass('widget-box')
                .attr('data-new', true)
                .attr('data-qti-class', 'gap');

            htmlContentHelper.createElements(interaction.getBody(), $editable, htmlEditor.getData($editable), function(widget){
                widget.changeState('question');
            });

        }).on('mouseup', function(e){
            e.stopPropagation();//prevent rewrapping
        });

        //init text wrapper:
        $editable.on('editorready.wrapper', function(){
            textWrapper.create($(this));
        }).on('wrapped.wrapper', function(e, $wrapper){
            $wrapper.append($gapTlb);
        }).on('beforeunwrap.wrapper', function(){
            $gapTlb.detach();
        });
    };

    GapMatchInteractionStateQuestion.prototype.destroyTextWrapper = function(){

        //destroy text wrapper:
        var $editable = this.widget.$container.find('.qti-flow-container [data-html-editable]');
        $editable.off('.wrapper');
        textWrapper.destroy($editable);
    };

    return GapMatchInteractionStateQuestion;
});