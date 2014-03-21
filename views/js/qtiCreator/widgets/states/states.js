define([
    'taoQtiItemCreator/widgets/states/factory',
    'taoQtiItemCreator/widgets/states/Active',
    'taoQtiItemCreator/widgets/states/Answer',
    'taoQtiItemCreator/widgets/states/Choice',
    'taoQtiItemCreator/widgets/states/Correct',
    'taoQtiItemCreator/widgets/states/Deleting',
    'taoQtiItemCreator/widgets/states/Map',
    'taoQtiItemCreator/widgets/states/Question',
    'taoQtiItemCreator/widgets/states/Sleep'
], function(factory){
    return factory.createBundle(arguments);
});