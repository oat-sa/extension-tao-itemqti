define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/SliderInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/interactions/sliderInteraction/Helper'
], function(
    stateFactory,
    Correct,
    commonRenderer,
    instructionMgr,
    _,
    __,
){

    const SliderInteractionStateCorrect = stateFactory.create(Correct, function(){

        _createResponseWidget(this.widget);

    }, function(){

        _destroyResponseWidget(this.widget);

    });

    const _createResponseWidget = function(widget){
        const interaction = widget.element;
        const response = interaction.getResponseDeclaration();
        const correctResponse = _.values(response.getCorrect());
        response.setCorrect([correctResponse]);

        commonRenderer.setResponse(interaction, _formatResponse(correctResponse));

        const $sliderElt = widget.$container.find('.qti-slider');
        $sliderElt.removeAttr('disabled');

        instructionMgr.appendInstruction(interaction, __('Please define the correct response using the slider.'));

        widget.$container.on('responseChange.qti-widget', function(e, data){
            response.setCorrect([data.response.base.integer]);
        });
    };

    const _destroyResponseWidget = function(widget){

        const $sliderElt = widget.$container.find('.qti-slider');
        const lowerBound = widget.element.attributes.lowerBound;

        $sliderElt.attr('disabled', 'disabled');
        $sliderElt.val(lowerBound);
        widget.$container.find('span.qti-slider-cur-value').text('' + lowerBound);

        instructionMgr.removeInstructions(widget.element);
        widget.$container.off('responseChange.qti-widget');
    };

    const _formatResponse = function(response){
        return {"base" : {"integer" : response}};
    };

    return SliderInteractionStateCorrect;
});
