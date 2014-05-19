/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeFactory',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeEditor',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeSideBar',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/identifier',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/hotspot',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/choices/hotspot'
], function($, _, GraphicHelper, stateFactory, Question, shapeFactory, shapeEditor, shapeSideBar, formElement, interactionFormElement,  identifierHelper, formTpl, choiceFormTpl){

    //keep the shape editors to destroy them easily
    var editors = [];

    /**
     * Question State initialization: set up side bar, editors and shae factory
     */
    var initQuestionState = function initQuestionState(){

        var factories   = {};
        var widget      = this.widget;
        var $container  = widget.$container;
        var interaction = widget.element;
        var paper       = interaction.paper;
        var image       = paper.getById('bg-image-' + interaction.serial);
        var $choiceForm = widget.choiceForm;

        //set the edition shape style
        _.forEach(interaction.getChoices(), function(choice){
            var element = paper.getById(choice.serial);
            if(element){
                element
                    .attr(GraphicHelper._style.creator)
                    .unmouseover()
                    .unmouseout();
            }
        });

        //we need to stop the question mode on resize, to keep the coordinate system coherent, 
        //even in responsive (the side bar introduce a biais)
        $(window).on('resize.changestate', function(){
            widget.changeState('sleep');
        });

        //set up shape cnotextual options
        var options = {
            paper : interaction.paper, 
            background : image, 
            $container : $container.find('.main-image-box'), 
            isResponsive : $container.hasClass('responsive')
        };
        
        //create the side bar 
        var $sideBar = shapeSideBar.create($container); 

        //once a shape type is selected
        $sideBar.on('shapeactive.qti-widget', function(e, $form, type){
    
            //enable to create a shape of the given type
            createShape(type, function shapeCreated (shape){

                var newChoice = interaction.createChoice({
                    shape  : type === 'path' ? 'poly' : type,
                    coords : GraphicHelper.qtiCoords(shape) 
                });

                //link the shape to the choice
                shape.id = newChoice.serial;

                //deactivate the form in the sidebar
                $form.removeClass('active');

                //start the shape editor (hnadling, resize, move)
                editShape(shape, true);
                
            });
        });

        //retrieve the current shapes and make them editable
        _.forEach(this.widget.element.getChoices(), function(choice){
            var shape = paper.getById(choice.serial);
            if(shape){
                editShape(shape);
            }
        });

        /**
         * Make a shape editable
         * @private
         * @param {Raphael.Element} shape - the shape to make editable
         * @param {Boolean} [enterHandling = false]  - wether to enter handling directly
         */
        function editShape(shape, enterHandling){

            var editor = shapeEditor(shape, options); 
            editor.on('enterhandling.qti-widget', function(){

                //only one shape handling at a time
                _.invoke(_.reject(editors, editor), 'quitHandling');

                //enable to bin the shape
                $sideBar
                    .trigger('enablebin.qti-widget')
                    .on('bin.qti-widget', function(){
                        
                        //remove the shape and the editor
                        editor.removeShape();
                        editor.destroy();
                        editors = _.reject(editors, editor);
                        editor = undefined;
                    });
                 
                 //set up manually the choice form
                 enterChoiceForm(editor.shape.id);

            }).on('shapechange.qti-widget', function(){
                
                //update choice coords in the model
                var choice = interaction.getChoice(shape.id);
                if(choice){
                    choice.attr('coords', GraphicHelper.qtiCoords(shape));
                }

            }).on('quithandling.qti-widget', function(){

                //leave the choice form
                leaveChoiceForm();

                //update the side bar
                $sideBar
                    .trigger('disablebin.qti-widget')
                    .off('click')
                    .off('bin.qti-widget');

            }).on('remove.qti-widget', function(id){
                interaction.removeChoice(id);
            });

            editors.push(editor);
            if(enterHandling){
                editor.enterHandling();
            }
        }

        /**
         * Enables to create a shape of the given type
         * @private
         * @param {String} type - the shape type (rect, circle, ellipse or path)
         * @param {Function} created - call back once a new shape is created
         */
        function createShape(type, created){
            var factory = factories[type];
            if(!factories[type]){
                factory = shapeFactory(_.merge({type : type}, options));
                factories[type] = factory;
            } 
            
            factory.on('created.qti-widget', created);          
            if( type === 'path'){
                factory.startDrawingPath();
            } else {    
                factory.startWithMouse();
            }
        }

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
            }
        }
        
        /**
         * Leave the choice form
         * @private
         */
        function leaveChoiceForm(){
            $choiceForm.empty();
        }
    };

    /**
     * Exit the question state, leave the room cleaned up
     */
    var exitQuestionState = function initQuestionState(){
        var $container  = this.widget.$container;
        var interaction = this.widget.element;
        var paper       = interaction.paper;
        
        $(window).off('resize.changestate');

        shapeSideBar.remove($container);
        
        _.invoke(editors, 'destroy');
        editors = [];

        //reset the shape style
        _.forEach(interaction.getChoices(), function(choice){
            var element = paper.getById(choice.serial);
            if(element){
                element
                    .attr(GraphicHelper._style.basic)
                    .hover(function(){
                        if(!element.flashing){
                            GraphicHelper.updateElementState(this, 'hover'); 
                        }
                  }, function(){
                        if(!element.flashing){
                            GraphicHelper.updateElementState(this, this.active ? 'active' : this.selectable ? 'selectable' : 'basic');
                        }
                  });
            }
        });
    };
    
    /**
     * The question state for the hotspot interaction
     * @extends taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question
     * @exports taoQtiItem/qtiCreator/widgets/interactions/hotspotInteraction/states/Question
     */
    var HotspotInteractionStateQuestion = stateFactory.extend(Question, initQuestionState, exitQuestionState);

    /**
     * Initialize the form linked to the interaction
     */
    HotspotInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            options = _widget.options,
            $form = _widget.$form,
            $uploadTrigger,
            $src,
            interaction = _widget.element;

        $form.html(formTpl({
            baseUrl : options.baseUrl,
            maxChoices : parseInt(interaction.attr('maxChoices')),
            minChoices : parseInt(interaction.attr('minChoices')),
            choicesCount : _.size(_widget.element.getChoices()),
            data : interaction.object.attributes.data
        }));

        $uploadTrigger = $form.find('[data-role="upload-trigger"]');
        $src = $form.find('input[name=data]');

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
                    console.log(files);
                    $src.val(files[0].file).trigger('change');
                }
            });
        });

        formElement.initWidget($form);
        
        //init data change callbacks
        var callbacks = formElement.getMinMaxAttributeCallbacks(this.widget.$form, 'minChoices', 'maxChoices');
        callbacks.data = function(inteaction, value){
            interaction.object.attr('data', value);
            //_widget.changeState('sleep');
            _widget.rebuild({
                ready:function(widget){
                    widget.changeState('question');
                }
            });
        };
        formElement.initDataBinding($form, interaction, callbacks);
        
        interactionFormElement.syncMaxChoices(_widget);
    };

    return HotspotInteractionStateQuestion;
});
