/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Map',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/GraphicAssociateInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse', 
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/pairScorePopup',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/graphicAssociateScoreMappingForm',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'ui/deleter',
    'ui/tooltipster'
], function($, _, __, stateFactory, Map, GraphicAssociateInteraction, helper, graphicHelper, PciResponse, answerStateHelper, pairScorePopup, mappingFormTpl, formElement, deleter, tooltipster){

    /**
     * Initialize the state.
     */
    function initMapState(){
        var widget = this.widget;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();
        var corrects  = _.values(response.getCorrect());
        var currentResponses =  _.size(response.getMapEntries()) === 0 ? corrects : _.keys(response.getMapEntries());

        //really need to destroy before ? 
        GraphicAssociateInteraction.destroy(interaction);
        
        if(!interaction.paper){
            return;
        }

        //add a specific instruction
        helper.appendInstruction(interaction, __('Please the score of each graphicAssociate choice.'));
        interaction.responseMappingMode = true;

        //use the common Renderer
        GraphicAssociateInteraction.render.call(interaction.getRenderer(), interaction);    



        //set the responses already defined
        GraphicAssociateInteraction.setResponse(
            interaction, 
            PciResponse.serialize(_.invoke(currentResponses, String.prototype.split, ' '), interaction)
        );
        if(_.size(response.getMapEntries()) === 0){
            mappingForm(widget, corrects);
        } else {
            mappingForm(widget);
        }

        //display the choices ids
        showChoicesId(interaction);
 
        widget.$container.on('responseChange.qti-widget.mapstate', function(e, data){
            mappingForm(widget, _.map(data.response.list.pair, function(pair){
                return pair.join(' ');
            }));
        });
    }

    /**
     * Exit the map state
     */
    function exitMapState(){
        var widget = this.widget;
        var interaction = widget.element;
        
        if(!interaction.paper){
            return;
        }
        
        $('.graphic-mapping-editor').remove();
        widget.$container.off('responseChange.qti-widget.mapstate');

        //destroy the common renderer
        helper.removeInstructions(interaction);
        GraphicAssociateInteraction.destroy(interaction); 

        //initialize again the widget's paper
        this.widget.createPaper();
    }

    function showChoicesId(interaction){
        _.forEach(interaction.getChoices(), function(choice){
            var element = interaction.paper.getById(choice.serial);
            if(element){
                graphicHelper.createShapeText(interaction.paper, element, {
                    shapeClick: true,
                    content : choice.id()
                }).transform('t0,-10').toFront();
            }
        });
    }

    function mappingForm(widget, entries){
        var mappings = [];
        var $container = widget.$container;
        var interaction = widget.element;
        var options = widget.options;
        var response = interaction.getResponseDeclaration();
        var correctDefined = answerStateHelper.isCorrectDefined(widget);
        var corrects  = _.values(response.getCorrect());
        var mapEntries = response.getMapEntries();

        //reformat entries/for the form
        if(entries){
            response.removeMapEntries();
            _.forEach(entries , function(value){
                var pair = value.split(' ');
                var isCorrect = _.contains(corrects, value);
                var score =  mapEntries[value] || response.mappingAttributes.defaultValue;

                mappings.push({
                    score          : score,
                    pair0          : pair[0],
                    pair1          : pair[1],
                    id             : value.replace(' ', '::'),
                    correctDefined : correctDefined,
                    correct        : _.contains(corrects, value) 
                });
                //add the related map entries 
                response.setMapEntry(value, score);
            });
        } else {
            _.forEach(mapEntries, function(value, key){
                var pair = key.split(' ');
                mappings.push({
                    score          : value,
                    pair0          : pair[0],
                    pair1          : pair[1],
                    id             : key.replace(' ', '::'),
                    correctDefined : correctDefined,
                    correct        : _.contains(corrects, key) 
                });
            });
        }
        
        $('.graphic-mapping-editor').remove();

        var $popup = pairScorePopup($container);
        var $form = $(mappingFormTpl({
            'title'             : __('Pair scoring'),
            'correctDefined'    : answerStateHelper.isCorrectDefined(widget),
            'scoreMin'          : response.getMappingAttribute('lowerBound'),
            'scoreMax'          : response.getMappingAttribute('upperBound'),
            'mappings'          : mappings
        }));
        
        var callbacks = {};
        _.forEach(mappings, function(map){
            var id = map.id.replace('::', ' ');
            callbacks[map.id + '-score'] = function(response, value){
                response.setMapEntry(id, value);
            };
            callbacks[map.id + '-correct'] = function(response, value){
                if(value === true){
                    if(!_.contains(corrects, id)){
                        corrects.push(id);
                    }
                } else {
                    corrects = _.without(corrects, id);
                }
                response.setCorrect(corrects);
            };
        });
        
        //set up the form data binding
        formElement.initDataBinding($form, response, callbacks);

        $popup.empty().html($form);
    }

    /**
     * The map answer state for the graphicAssociate interaction
     * @extends taoQtiItem/qtiCreator/widgets/states/Map
     * @exports taoQtiItem/qtiCreator/widgets/interactions/graphicAssociateInteraction/states/Map
     */
    return  stateFactory.create(Map, initMapState, exitMapState);
});
