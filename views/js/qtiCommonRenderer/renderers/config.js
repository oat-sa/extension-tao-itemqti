define(['lodash', 'taoQtiDefaultRenderer/renderers/config'], function(_, defaultRenderConfig){
    var locations = _.extend(defaultRenderConfig.locations, {
        'assessmentItem' : 'taoQtiCommonRenderer/renderers/Item',
        'prompt' : 'taoQtiCommonRenderer/renderers/interactions/Prompt',
        'choiceInteraction' : 'taoQtiCommonRenderer/renderers/interactions/ChoiceInteraction',
        'extendedTextInteraction' : 'taoQtiCommonRenderer/renderers/interactions/ExtendedTextInteraction',
        'orderInteraction' : 'taoQtiCommonRenderer/renderers/interactions/OrderInteraction',
        'associateInteraction' : 'taoQtiCommonRenderer/renderers/interactions/AssociateInteraction',
        'matchInteraction' : 'taoQtiCommonRenderer/renderers/interactions/MatchInteraction',
        'textEntryInteraction' : 'taoQtiCommonRenderer/renderers/interactions/TextEntryInteraction',
        'inlineChoiceInteraction' : 'taoQtiCommonRenderer/renderers/interactions/InlineChoiceInteraction',
        'simpleChoice.choiceInteraction' : 'taoQtiCommonRenderer/renderers/choices/SimpleChoice.ChoiceInteraction',
        'simpleChoice.orderInteraction' : 'taoQtiCommonRenderer/renderers/choices/SimpleChoice.OrderInteraction',
        'hottext' : 'taoQtiCommonRenderer/renderers/choices/Hottext',
        'simpleAssociableChoice.matchInteraction' : 'taoQtiCommonRenderer/renderers/choices/SimpleAssociableChoice.MatchInteraction',
        'simpleAssociableChoice.associateInteraction' : 'taoQtiCommonRenderer/renderers/choices/SimpleAssociableChoice.AssociateInteraction',
        'sliderInteraction' : 'taoQtiCommonRenderer/renderers/interactions/SliderInteraction',
        'inlineChoice' : 'taoQtiCommonRenderer/renderers/choices/InlineChoice',
        'hottextInteraction' : 'taoQtiCommonRenderer/renderers/interactions/HottextInteraction',
    });
    return {
        name:'commonRenderer',
        locations : locations
    };
});




