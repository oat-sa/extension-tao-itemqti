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
    'tpl!taoQtiItem/qtiCreator/tpl/forms/response/graphicGapMatchScoreMappingForm',
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
    


        if(_.size(response.getMapEntries()) === 0){

            GraphicGapMatchInteraction.setResponse(
                interaction, 
                PciResponse.serialize(_.invoke(corrects, String.prototype.split, ' '), interaction)
            );
            mappingForm(widget, corrects);

        } else {
            GraphicGapMatchInteraction.setResponse(
                interaction, 
                PciResponse.serialize(_.invoke(_.keys(response.getMapEntries()), String.prototype.split, ' '), interaction)
            );
            mappingForm(widget);
        }
        
        widget.$container.on('responseChange.qti-widget', function(e, data){
            console.log(data.response.list.directedPair);
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
        
        $('.graphic-mapping-editor').remove();

        //destroy the common renderer
        helper.removeInstructions(interaction);
        GraphicGapMatchInteraction.destroy(interaction); 

        //initialize again the widget's paper
        this.widget.createPaper();
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
        var gapImgs  = {};
        _.forEach(interaction.getGapImgs(), function(gapImg){
            gapImgs[gapImg.id()] = gapImg;
        });


        //reformat entries/for the form
        if(entries){
            response.removeMapEntries();
            _.forEach(entries , function(value){
                var pair = value.split(' ');
                var isCorrect = _.contains(corrects, value);
                var score =  mapEntries[value] || response.mappingAttributes.defaultValue;

                mappings.push({
                    score : score,
                    choice : pair[0],
                    gapImg : pair[1],
                    gapImgSrc : options.baseUrl + gapImgs[pair[1]].object.attr('data'), 
                    id : value.replace(' ', '__'),
                    correctDefined : correctDefined,
                    correct : _.contains(corrects, value) 
                });
                //add the related map entries 
                response.setMapEntry(value, score);
            });
        } else {
            _.forEach(mapEntries, function(value, key){
                var pair = key.split(' ');
                mappings.push({
                    score : value,
                    choice : pair[0],
                    gapImgId : pair[1],
                    gapImgSrc : options.baseUrl + gapImgs[pair[1]].object.attr('data'), 
                    id : key.replace(' ', '__'),
                    correctDefined : correctDefined,
                    correct : _.contains(corrects, key) 
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
            var id = map.id.replace('__', ' ');
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
     * The map answer state for the graphicGapMatch interaction
     * @extends taoQtiItem/qtiCreator/widgets/states/Map
     * @exports taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/states/Map
     */
    return  stateFactory.create(Map, initMapState, exitMapState);
});
