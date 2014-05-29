/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Map',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/GraphicGapMatchInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/Helper',
    'taoQtiItem/qtiCommonRenderer/helpers/Graphic',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse', 
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/pairScorePopup',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/pairScoreMappingForm',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'ui/deleter',
    'ui/tooltipster'
], function($, _, __, stateFactory, Map, GraphicGapMatchInteraction, helper, graphicHelper, PciResponse, answerStateHelper,  pairScorePopup, mappingFormTpl, formElement, deleter, tooltipster){

    /**
     * Initialize the state.
     */
    function initMapState(){
        var widget = this.widget;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();
        var corrects  = _.values(response.getCorrect());
        
        //really need to destroy before ? 
        GraphicGapMatchInteraction.destroy(interaction);
        
        if(!interaction.paper){
            return;
        }

        //add a specific instruction
        helper.appendInstruction(interaction, __('Please the score of each graphicGapMatch choice.'));
        interaction.responseMappingMode = true;

        widget._createGapImgs(); 
 
        //use the common Renderer
        GraphicGapMatchInteraction.render.call(interaction.getRenderer(), interaction);
    
        GraphicGapMatchInteraction.setResponse(
            interaction, 
            PciResponse.serialize(_.invoke(corrects, String.prototype.split, ' '), interaction)
        );

        if(_.size(response.getMapEntries()) === 0){
            mappingForm(widget, corrects);
        } else {
            mappingForm(widget);
        }
        
        widget.$container.on('responseChange.qti-widget', function(e, data){
            mappingForm(widget, _.map(data.response.list.directedPair, function(pair){
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
        
        $('.mapping-editor').remove();

        //destroy the common renderer
        helper.removeInstructions(interaction);
        GraphicGapMatchInteraction.destroy(interaction); 

        //initialize again the widget's paper
        this.widget.createPaper();
    }

    function mappingForm(widget, entries){
        var $container = widget.$container;
        var interaction = widget.element;
        var response = interaction.getResponseDeclaration();
        var corrects  = _.values(response.getCorrect());
        var mapping = [];

        //reformat entries/for the form
        if(entries){
            _.forEach(entries , function(value){
                var pair = value.split(' ');
                mapping.push({
                    mappedValue : response.mappingAttributes.defaultValue,
                    choice : pair[0],
                    gapImg : pair[1],
                    id : value.replace(' ', '-'),
                    correct : _.contains(corrects, value) 
                });
            });
        } else {
            _.forEach(response.getMapEntries(), function(entry, key){
                var pair = key.split(' ');
                mapping.push({
                    mappedValue : entry.mappedValue,
                    choice : pair[0],
                    gapImg : pair[1],
                    id : key.replace(' ', '-'),
                    correct : _.contains(corrects, key) 
                });
            });
        }
        
        var $popup = pairScorePopup($container);
        var $form = $(mappingFormTpl({
            'title'             : __('Pair scoring'),
            'correctDefined'    : answerStateHelper.isCorrectDefined(widget),
            'scoreMin'          : response.getMappingAttribute('lowerBound'),
            'scoreMax'          : response.getMappingAttribute('upperBound'),
            'mapping'           : mapping
        }));
        
        var callbacks = {};
        _.forEach(mapping, function(map){
            callbacks[map.id + '_score'] = function(response, value){
                console.log(map.id + '_score', value);
            };
            callbacks[map.id + '_correct'] = function(response, value){
                console.log(map.id + '_corect', value);
            };
        });
        
        //set up the form data binding
        formElement.initDataBinding($form, response, callbacks);

        $popup.empty().html($form);
    }

    /**
     * The map answer state for the graphicGapMatch interaction
     * @extends taoQtiItem/qtiCreator/widgets/states/Map
     * @exports taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/states/Map
     */
    return  stateFactory.create(Map, initMapState, exitMapState);
});
