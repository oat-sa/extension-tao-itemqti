define(['lodash', 'taoQtiItem/qtiDefaultRenderer/renderers/config'], function(_, defaultRenderConfig){
    var locations = _.extend(_.clone(defaultRenderConfig.locations), {
        'assessmentItem' : 'taoQtiItem/qtiCommonRenderer/renderers/Item',
        'prompt' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/Prompt',
        'choiceInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/ChoiceInteraction',
        'extendedTextInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/ExtendedTextInteraction',
        'orderInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/OrderInteraction',
        'associateInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/AssociateInteraction',
        'matchInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/MatchInteraction',
        'textEntryInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/TextEntryInteraction',
        'inlineChoiceInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/InlineChoiceInteraction',
        'simpleChoice.choiceInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleChoice.ChoiceInteraction',
        'simpleChoice.orderInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleChoice.OrderInteraction',
        'hottext' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/Hottext',
        'gap' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/Gap',
        'gapText' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/GapText',
        'simpleAssociableChoice.matchInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleAssociableChoice.MatchInteraction',
        'simpleAssociableChoice.associateInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleAssociableChoice.AssociateInteraction',
        'sliderInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/SliderInteraction',
        'inlineChoice' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/InlineChoice',
        'hottextInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/HottextInteraction',
        'hotspotInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/HotspotInteraction',
        'gapMatchInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/GapMatchInteraction',
        'selectPointInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/SelectPointInteraction',
        'graphicOrderInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/GraphicOrderInteraction',
        'mediaInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/MediaInteraction',
    });
    return {
        name:'commonRenderer',
        locations : locations
    };
});




