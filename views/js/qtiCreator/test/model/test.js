require([
    'jquery',
    'lodash',
    'taoQtiItem/core/Element',
    'taoQtiItemCreator/core/model/Item',
    'taoQtiXmlRenderer/renderers/Renderer'
],
function($, _, Element, Item, XmlRenderer){

    var CL = console.log;

    asyncTest('create interaction elements', function(){

        $(document).on('.qti-widget', function(e){
            CL('triggered event');
        });

        var item1 = new Item().body('hello').id('sample-item');
        ok(Element.isA(item1, 'assessmentItem'), 'item created');
        
        item1.createResponseProcessing();
        ok(Element.isA(item1.responseProcessing, 'responseProcessing'));
        
        item1.createElements('<h1>My QTI Item</h1><div>{{choiceInteraction:new}}</div></div>{{choiceInteraction:new}}</div>', function(newElts){
            
            start();
            
            //check created interactions:
            var interactions = this.getInteractions();
            equal(_.size(interactions), 2, '2 interactions created');
            equal(_.size(newElts), 2, '2 interactions created');
            
            //check auto generated responses:
            var responseA = this.getResponseDeclaration('RESPONSE');
            var responseB = this.getResponseDeclaration('RESPONSE_1');
            ok(Element.isA(responseA, 'responseDeclaration'), 'response A correctly auto generated');
            ok(Element.isA(responseB, 'responseDeclaration'), 'response B correctly auto generated');
            ok(Element.isA(responseB, 'variableDeclaration'), 'response B top class ok');
            
            //check response set/get():
            equal(responseA.getTemplate(), 'MATCH_CORRECT', 'template set');
            
            var rule = responseA.createFeedbackRule();
            var feedbackOutcome = rule.feedbackOutcome;
            ok(Element.isA(feedbackOutcome, 'outcomeDeclaration'), 'feedback outcome correctly auto generated');
            ok(Element.isA(feedbackOutcome, 'variableDeclaration'), 'feedback outcome B top class ok');
            equal(rule.condition, 'correct', 'condition correctly set');
            
            ok(Element.isA(rule.feedbackThen, 'modalFeedback'), 'feedback "then" correctly created');
            
            responseA.createFeedbackElse(rule);
            ok(Element.isA(rule.feedbackElse, 'modalFeedback'), 'feedback "else" correctly created');
            
            responseA.deleteFeedbackElse(rule);
            ok(rule.feedbackElse === null, 'feedback "else" deleted');
            
            responseA.setCondition(rule, 'gte', 2.5);
            equal(rule.condition, 'gte', 'condition correctly set');
            equal(rule.comparedValue, 2.5, 'condition correctly set');
            
            var renderer = new XmlRenderer();
            renderer.load(function(){
                item1.setRenderer(this);
            }, [
                'assessmentItem',
                'choiceInteraction',
                'simpleChoice',
                'responseDeclaration',
                'outcomeDeclaration',
                '_simpleFeedbackRule',
                'responseProcessing'
            ]);
        });

    });
    
});