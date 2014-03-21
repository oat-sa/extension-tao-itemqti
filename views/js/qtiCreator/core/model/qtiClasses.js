/**
 * Define the location of all qti classes used in the QTI Creator
 */
define(['lodash', 'taoQtiItem/core/qtiClasses'], function(_, qtiClasses){
    
    //clone the qtiClasses instead of modifying it by direct extend:
    return _.extend(_.clone(qtiClasses), {
        'assessmentItem' : 'taoQtiItemCreator/core/model/Item',
        'choiceInteraction' : 'taoQtiItemCreator/core/model/interactions/ChoiceInteraction',
        'orderInteraction' : 'taoQtiItemCreator/core/model/interactions/OrderInteraction',
        'associateInteraction' : 'taoQtiItemCreator/core/model/interactions/AssociateInteraction',
        'simpleChoice' : 'taoQtiItemCreator/core/model/choices/SimpleChoice',
        'simpleAssociableChoice' : 'taoQtiItemCreator/core/model/choices/SimpleAssociableChoice',
        'responseDeclaration' : 'taoQtiItemCreator/core/model/variables/ResponseDeclaration'
    });
    
});