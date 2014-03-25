/**
 * Define the location of all qti classes used in the QTI Creator
 */
define(['lodash', 'taoQtiItem/qtiItem/core/qtiClasses'], function(_, qtiClasses){

    //clone the qtiClasses instead of modifying it by direct extend:
    return _.extend(_.clone(qtiClasses), {
        'assessmentItem' : 'taoQtiItem/qtiCreator/core/model/Item',
        'choiceInteraction' : 'taoQtiItem/qtiCreator/core/model/interactions/ChoiceInteraction',
        'orderInteraction' : 'taoQtiItem/qtiCreator/core/model/interactions/OrderInteraction',
        'associateInteraction' : 'taoQtiItem/qtiCreator/core/model/interactions/AssociateInteraction',
        'inlineChoiceInteraction' : 'taoQtiItem/qtiCreator/core/model/interactions/InlineChoiceInteraction',
        'simpleChoice' : 'taoQtiItem/qtiCreator/core/model/choices/SimpleChoice',
        'simpleAssociableChoice' : 'taoQtiItem/qtiCreator/core/model/choices/SimpleAssociableChoice',
        'inlineChoice' : 'taoQtiItem/qtiCreator/core/model/choices/InlineChoice',
        'responseDeclaration' : 'taoQtiItem/qtiCreator/core/model/variables/ResponseDeclaration'
    });

});