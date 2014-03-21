define(['lodash', 'taoQtiCommonRenderer/renderers/config'], function(_, commonRenderConfig){
    var locations = _.extend(commonRenderConfig.locations, {
        '_container' : 'taoQtiItemCreator/renderers/Container',
        'choiceInteraction' : 'taoQtiItemCreator/renderers/interactions/ChoiceInteraction',
        'orderInteraction' : 'taoQtiItemCreator/renderers/interactions/OrderInteraction',
        'associateInteraction' : 'taoQtiItemCreator/renderers/interactions/AssociateInteraction',
        'simpleChoice.choiceInteraction' : 'taoQtiItemCreator/renderers/choices/SimpleChoice.ChoiceInteraction',
        'simpleChoice.orderInteraction' : 'taoQtiItemCreator/renderers/choices/SimpleChoice.OrderInteraction',
        'simpleAssociableChoice.associateInteraction' : 'taoQtiItemCreator/renderers/choices/SimpleAssociableChoice.AssociateInteraction',
        'simpleAssociableChoice.matchInteraction' : 'taoQtiItemCreator/renderers/choices/SimpleAssociableChoice.MatchInteraction'
    });

    return {
        name: 'creatorRenderer',
        locations : locations
    };
});