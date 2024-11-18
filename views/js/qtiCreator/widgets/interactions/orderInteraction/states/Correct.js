define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/OrderInteraction',
    'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager',
    'i18n'
], function(stateFactory, Correct, commonRenderer, instructionMgr, __){

    const InlineChoiceInteractionStateCorrect = stateFactory.create(
        Correct,
        function () {
            _createResponseWidget(this.widget);
        },
        function () {
            _destroyResponseWidget(this.widget);
        }
    );

    const _createResponseWidget = widget => {

        const interaction = widget.element;
        const response = interaction.getResponseDeclaration();
        const correctResponse = response.getCorrect() ? Object.values(response.getCorrect()) : [];
        instructionMgr.appendInstruction(
          widget.element,
          interaction.attr('data-order') === 'single'
            ? __('Please define the correct order.')
            : __('Please define the correct order in the box to the right.')
        );

        commonRenderer.render(widget.element);
        commonRenderer.setResponse(interaction, _formatResponse(correctResponse));

        widget.$container.on('responseChange.qti-widget', function(e, data){
            response.setCorrect(_unformatResponse(data.response));
        });
    };

    const _destroyResponseWidget = widget => {
        widget.$container.off('responseChange.qti-widget');
        commonRenderer.resetResponse(widget.element);
        commonRenderer.destroy(widget.element);
    };

    const _formatResponse = response => ({ list : { identifier : response } });

    const _unformatResponse = function(formatedResponse){
        let res = [];
        if(formatedResponse.list && formatedResponse.list.identifier){
            res = formatedResponse.list.identifier;
        }
        return res;
    };

    return InlineChoiceInteractionStateCorrect;
});
