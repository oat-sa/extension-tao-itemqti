/**
 * Define the location of all qti classes used in the QTI Creator
 */
define(['lodash', 'taoQtiItem/qtiItem/core/qtiClasses'], function(_, qtiClasses){
    
    //clone the qtiClasses instead of modifying it by direct extend:
    return _.defaults({
        'assessmentItem' : 'taoQtiItem/qtiCreator/model/Item',
        'img' : 'taoQtiItem/qtiCreator/model/Img',
        'math' : 'taoQtiItem/qtiCreator/model/Math',
        'rubricBlock' : 'taoQtiItem/qtiCreator/model/RubricBlock',
        'modalFeedback' : 'taoQtiItem/qtiCreator/model/feedbacks/ModalFeedback',
        'choiceInteraction' : 'taoQtiItem/qtiCreator/model/interactions/ChoiceInteraction',
        'orderInteraction' : 'taoQtiItem/qtiCreator/model/interactions/OrderInteraction',
        'associateInteraction' : 'taoQtiItem/qtiCreator/model/interactions/AssociateInteraction',
        'inlineChoiceInteraction' : 'taoQtiItem/qtiCreator/model/interactions/InlineChoiceInteraction',
        'simpleChoice' : 'taoQtiItem/qtiCreator/model/choices/SimpleChoice',
        'simpleAssociableChoice' : 'taoQtiItem/qtiCreator/model/choices/SimpleAssociableChoice',
        'inlineChoice' : 'taoQtiItem/qtiCreator/model/choices/InlineChoice',
        'mediaInteraction' : 'taoQtiItem/qtiCreator/model/interactions/MediaInteraction',
        'hotspotInteraction' : 'taoQtiItem/qtiCreator/model/interactions/HotspotInteraction',
        'graphicOrderInteraction' : 'taoQtiItem/qtiCreator/model/interactions/GraphicOrderInteraction',
        'hotspotChoice' : 'taoQtiItem/qtiCreator/model/choices/HotspotChoice',
        'responseDeclaration' : 'taoQtiItem/qtiCreator/model/variables/ResponseDeclaration',
        'responseProcessing' : 'taoQtiItem/qtiCreator/model/ResponseProcessing'
    }, qtiClasses);

});
