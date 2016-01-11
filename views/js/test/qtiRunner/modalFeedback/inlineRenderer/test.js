define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCommonRenderer/renderers/Renderer',
    'taoQtiItem/qtiRunner/modalFeedback/inlineRenderer',
    'json!taoQtiItem/test/samples/json/inlineModalFeedback.json'
], function ($, _, QtiLoader, QtiRenderer, inlineRenderer, itemData){

    var containerId = '#outside-container';

    QUnit.module('HTML rendering');

    QUnit.asyncTest('renders an item', function (assert){

        var renderer = new QtiRenderer({baseUrl : './'});
        var testCase = {
            title : 'choice interaction',
            itemSession : {
                FEEDBACK_1 : {base : {identifier : 'feedbackModal_1'}},
                FEEDBACK_3 : {base : {identifier : 'feedbackModal_3'}}
            },
            feedbacks : {
                choice : [
                    {
                        identifier : 'feedbackModal_1',
                        title : 'modal feedback title',
                        text : 'right',
                        style : 'positive'
                    },
                    {
                        identifier : 'feedbackModal_3',
                        title : '',
                        text : 'thiss is right',
                        style : ''
                    }
                ],
                order : [],
                inline : []
            }
        };
        var testCaseX = {
            title : 'choice & order interaction',
            itemSession : {
                FEEDBACK_2 : {base : {identifier : 'feedbackModal_2'}},
                FEEDBACK_4 : {base : {identifier : 'feedbackModal_4'}},
                FEEDBACK_5 : {base : {identifier : 'feedbackModal_5'}}//feedbackModal_5 has the same content as the feedbackModal_4 so it won't be displayed
            },
            feedbacks : {
                choice : [
                    {
                        identifier : 'feedbackModal_2',
                        title : 'modal feedback title',
                        text : 'wrong',
                        style : 'negative'
                    }
                ],
                order : [
                    {
                        identifier : 'feedbackModal_4',
                        title : '',
                        text : 'Correct',
                        style : 'positive'
                    }
                ],
                inline : []
            }
        };

        new QtiLoader().loadItemData(itemData, function (item){
            var loader = this;
            renderer.load(function (){
                var result, $result, count;

                item.setRenderer(this);

                result = item.render({});

                assert.ok(typeof result === 'string', 'The renderer creates a string');
                assert.ok(result.length > 0, 'The renderer create some output');

                $result = $(result);

                var $choiceInteraction = $('.qti-choiceInteraction', $result);
                var $orderInteraction = $('.qti-orderInteraction', $result);
                var $textEntryInteraction = $('.qti-textEntryInteraction', $result);
                var $inlineChoiceInteraction = $('.qti-inlineChoiceInteraction', $result);
                var $inlineInteractionContainer = $inlineChoiceInteraction.parent('.col-12');

                assert.ok($result.hasClass('qti-item'), 'The result is a qti item');
                assert.equal($('.qti-itemBody', $result).length, 1, 'The result contains an item body');
                assert.equal($choiceInteraction.length, 1, 'The result contains a choice interaction');
                assert.equal($orderInteraction.length, 1, 'The result contains an order interaction');
                assert.equal($textEntryInteraction.length, 1, 'The result contains a text enry interaction');
                assert.equal($inlineChoiceInteraction.length, 1, 'The result contains an inline choice interaction');
                assert.equal($inlineInteractionContainer.length, 1, 'Inline interaction container found');
                assert.equal($('.qti-modalFeedback', $result).length, 0, 'no modal feedback yet');

                //render in dom
                var $container = $(containerId);
                $container.append($result);
                count = inlineRenderer.showFeedbacks(item, loader, renderer, testCase.itemSession, _.noop, function(){
                    
                    QUnit.start();
                    
                    assert.equal($('.qti-modalFeedback', $choiceInteraction).length, testCase.feedbacks.choice.length, 'modal feedbacks below choice interaction');
                    assert.equal($('.qti-modalFeedback', $orderInteraction).length, testCase.feedbacks.order.length, 'modal feedbacks below order interaction');
                    assert.equal($('.qti-modalFeedback', $inlineInteractionContainer).length, testCase.feedbacks.inline.length, 'modal feedbacks below inline block');
                    
                    var feedbacks = testCase.feedbacks.choice.concat(testCase.feedbacks.order, testCase.feedbacks.inline);
                    assert.equal(feedbacks.length, count, 'number of feedbacks matches');
                    
                    _.each(feedbacks, function(fb){
                        
                        var $feedback = $result.find('[data-identifier='+fb.identifier+']');
                        assert.equal($feedback.length, 1, 'found feedback dom element for '+ fb.identifier);
                        if(fb.style){
                            assert.ok($feedback.hasClass(fb.style), 'style class correctly set');
                        }else{
                            assert.equal($feedback.attr('class').trim(), 'qti-modalFeedback', 'the unique css class must be qti-modalFeedback');
                        }
                        
                        if(fb.title){
                            assert.equal($feedback.children('.qti-title').length, 1, 'title found');
                            assert.equal($feedback.children('.qti-title').text(), fb.title, 'title text ok');
                        }else{
                            assert.equal($feedback.children('.qti-title').length, 0, 'no title');
                        }
                        assert.equal($feedback.find('.modal-body').length, 1, 'feedback body found');
                        assert.equal($feedback.find('.modal-body').text().trim(), fb.text, 'feedback body found');
                    });
                    
                });

            }, loader.getLoadedClasses());
        });
    });

});

