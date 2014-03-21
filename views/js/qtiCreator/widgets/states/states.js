define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Active',
    'taoQtiItem/qtiCreator/widgets/states/Answer',
    'taoQtiItem/qtiCreator/widgets/states/Choice',
    'taoQtiItem/qtiCreator/widgets/states/Correct',
    'taoQtiItem/qtiCreator/widgets/states/Deleting',
    'taoQtiItem/qtiCreator/widgets/states/Map',
    'taoQtiItem/qtiCreator/widgets/states/Question',
    'taoQtiItem/qtiCreator/widgets/states/Sleep'
], function(factory){
    return factory.createBundle(arguments);
});