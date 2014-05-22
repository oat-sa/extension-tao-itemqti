/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/graphicInteractionShapeEditor',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/identifier',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/hotspot',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/choices/hotspot',
    'util/image',
    'taoQtiItem/qtiCreator/editor/editor'
], function($, _, GraphicHelper, stateFactory, Question, shapeEditor, formElement, interactionFormElement,  identifierHelper, formTpl, choiceFormTpl, imageUtil, editor){

    /**
     * Question State initialization: set up side bar, editors and shae factory
     */
    var initQuestionState = function initQuestionState(){

        var widget      = this.widget;
        var interaction = widget.element;
        var paper       = interaction.paper;

        if(!paper){
            return;
        }

        var $choiceForm  = widget.choiceForm;
        var $formInteractionPanel = $('#item-editor-interaction-property-bar');
        var $formChoicePanel = $('#item-editor-choice-property-bar');

        //instantiate the shape editor, attach it to the widget to retrieve it during the exit phase
        widget._editor = shapeEditor(widget, {
            shapeCreated : function(shape, type){
                var newChoice = interaction.createChoice({
                    shape  : type === 'path' ? 'poly' : type,
                    coords : GraphicHelper.qtiCoords(shape) 
                });

                //link the shape to the choice
                shape.id = newChoice.serial;
            },
            shapeRemoved : function(id){
                interaction.removeChoice(id);
            },
            enterHandling : function(shape){
                enterChoiceForm(shape.id);
            },
            quitHandling : function(){
                leaveChoiceForm();
            },
            shapeChange : function(shape){
                var choice = interaction.getChoice(shape.id);
                if(choice){
                    choice.attr('coords', GraphicHelper.qtiCoords(shape));
                }
            }
        });
    
        //and create an instance
        widget._editor.create();

        //we need to stop the question mode on resize, to keep the coordinate system coherent, 
        //even in responsive (the side bar introduce a biais)
        $(window).on('resize.changestate', function(){
            widget.changeState('sleep');
        });

        /**
         * Set up the choice form
         * @private
         * @param {String} serial - the choice serial
         */
        function enterChoiceForm(serial){
            var choice = interaction.getChoice(serial);
            if(choice){
                
                $choiceForm.empty().html(
                    choiceFormTpl({
                        identifier  : choice.id(),
                        fixed       : choice.attr('fixed'),
                        serial      : serial
                    })
                );

                formElement.initWidget($choiceForm);

                //init data validation and binding
                formElement.initDataBinding($choiceForm, choice, {
                    identifier  : identifierHelper.updateChoiceIdentifier,
                    fixed       : formElement.getAttributeChangeCallback() 
                });

                $formChoicePanel.show();
                editor.openSections($formChoicePanel.children('section'));
                editor.closeSections($formInteractionPanel.children('section'));
            }
        }
        
        /**
         * Leave the choice form
         * @private
         */
        function leaveChoiceForm(){
            if($formChoicePanel.css('display') !== 'none'){
                editor.openSections($formInteractionPanel.children('section'));
                $formChoicePanel.hide();
                $choiceForm.empty();
            }
        }
    };

    /**
     * Exit the question state, leave the room cleaned up
     */
    var exitQuestionState = function initQuestionState(){
        var widget      = this.widget;
        var interaction = widget.element;
        var paper       = interaction.paper;

        if(!paper){
            return;
        }
        
        $(window).off('resize.changestate');

        if(widget._editor){
            widget._editor.destroy();
        }
    };
    
    /**
     * The question state for the graphicOrder interaction
     * @extends taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question
     * @exports taoQtiItem/qtiCreator/widgets/interactions/graphicOrderInteraction/states/Question
     */
    var GraphicOrderInteractionStateQuestion = stateFactory.extend(Question, initQuestionState, exitQuestionState);

    /**
     * Initialize the form linked to the interaction
     */
    GraphicOrderInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            options = _widget.options,
            $form = _widget.$form,
            $uploadTrigger,
            $src, $width, $height,
            interaction = _widget.element;

        $form.html(formTpl({
            baseUrl         : options.baseUrl,
            maxChoices      : parseInt(interaction.attr('maxChoices')),
            minChoices      : parseInt(interaction.attr('minChoices')),
            choicesCount    : _.size(_widget.element.getChoices()),
            data            : interaction.object.attributes.data,
            width           : interaction.object.attributes.width,
            height          : interaction.object.attributes.height
        }));

        $uploadTrigger = $form.find('[data-role="upload-trigger"]');
        $src = $form.find('input[name=data]');
        $width = $form.find('input[name=width]');
        $height = $form.find('input[name=height]');

        $uploadTrigger.on('click', function(){
            $uploadTrigger.resourcemgr({
                appendContainer : options.mediaManager.appendContainer,
                root : '/',
                browseUrl : options.mediaManager.browseUrl,
                uploadUrl : options.mediaManager.uploadUrl,
                deleteUrl : options.mediaManager.deleteUrl,
                downloadUrl : options.mediaManager.downloadUrl,
                params : {
                    uri : options.uri,
                    lang : options.lang,
                    filters : 'image/jpeg,image/png,image/gif'
                },
                pathParam : 'path',
                select : function(e, files){
                    if(files.length > 0){ 
                        imageUtil.getSize(options.baseUrl + files[0].file, function(size){
                            
                            if(size && size.width >= 0){
                                $width.val(size.width).trigger('change');
                                $height.val(size.height).trigger('change');
                            }
                            $src.val(files[0].file).trigger('change');
                        });
                    }
                }
            });
        });

        formElement.initWidget($form);
        
        //init data change callbacks
        var callbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'minChoices', 'maxChoices');
        callbacks.data = function(inteaction, value){
            interaction.object.attr('data', value);
            _widget.rebuild({
                ready:function(widget){
                    widget.changeState('question');
                }
            });
        };
        callbacks.width = function(inteaction, value){
            interaction.object.attr('width', value);
        };
        callbacks.height = function(inteaction, value){
            interaction.object.attr('height', value);
        };
        formElement.initDataBinding($form, interaction, callbacks);
        
        interactionFormElement.syncMaxChoices(_widget);
    };

    return GraphicOrderInteractionStateQuestion;
});
