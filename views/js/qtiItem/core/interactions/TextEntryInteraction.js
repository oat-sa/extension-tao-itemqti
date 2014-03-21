define(['taoQtiItem/core/interactions/InlineInteraction'], function(InlineInteraction){
    var TextEntryInteraction = InlineInteraction.extend({
        'qtiClass' : 'textEntryInteraction'
    });
    return TextEntryInteraction;
});