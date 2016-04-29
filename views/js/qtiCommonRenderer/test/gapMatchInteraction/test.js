define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'json!taoQtiItem/qtiCommonRenderer/test/gapMatchInteraction/sample.json',
    './amd/syn'
], function($, _, qtiItemRunner, itemData, syn){
    'use strict';

    var debug = true; // set to true to render the interaction in a browser and interact with it
    var fixtureContainerId = (debug) ? 'outside-container' : 'item-container';
    var runner;

    var $availableChoices, $availableTargets;

    module('GapMatchInteraction', {
        teardown : function(){
            if(runner && !debug){
                runner.clear();
            }
        }
    });

    function getChoice(choiceIndex) {
        return {
            el: $availableChoices.get(choiceIndex - 1),
            id: $availableChoices.eq(choiceIndex - 1).attr("data-identifier")
        };
    }

    function getTarget(targetIndex) {
        return {
            el: $availableTargets.get(targetIndex - 1),
            id: $availableTargets.eq(targetIndex - 1).attr("data-identifier")
        };
    }
    
    function _assertIsOnlyActiveChoice(choiceId) {
        var selectedIsActive= false,
            otherAreDisabled = true;
        
        $availableChoices.each(function() {
            if (choiceId && $(this).attr("data-identifier") === choiceId) {
                if ($(this).hasClass("active")) {
                    selectedIsActive = true;
                }
            } else {
                if ($(this).hasClass("active") && otherAreDisabled === true) {
                    otherAreDisabled = false;
                }
            }
        });
        if (choiceId) {
            QUnit.assert.ok(selectedIsActive, "choice should be active " + choiceId);
        }
        QUnit.assert.ok(otherAreDisabled, "there are active choices when they shouldn't be");
    }

    
    function _removeResponse(target, response) {
        var responseIndex;
        response.forEach(function (value, index) {
           if (value[1] === target.id) {
               responseIndex = index;
           } 
        });
        response.splice(responseIndex, 1);
    }

    function _responseEquals(expected, state, message) {
        var actual = state.RESPONSE.response.list.directedPair;
        var actualSorted = actual.sort(function (a, b) {
            return a[0] < b[0];
        });
        var expectedSorted = expected.sort(function (a, b) {
            return a[0] < b[0];
        });
        QUnit.assert.deepEqual(
            expectedSorted,
            actualSorted,
            ((message) ? message + " - " : "") + "response is " + JSON.stringify(expected)
        );
    }

    QUnit.asyncTest('click interaction', function (assert){

        var $container = $('#' + fixtureContainerId);

        console.log("\nin test!");
        assert.ok(true);
        
        runner = qtiItemRunner('qti', itemData)
            .on('error', function(e){
              assert.ok(false, e);
              QUnit.start();
            })
            .on('render', function (){
                console.log("\nin render!");

                QUnit.start();
/*
                var response = [];

                $availableChoices = $('.choice-area .qti-choice');
                $availableTargets = $('.qti-flow-container .gapmatch-content');

                try {
                    var self = this;
                    var removeChoice;
                    var choice = getChoice(1);
                    var target = getTarget(1);
                    var choice2 = getChoice(4);
                    var target2 = getTarget(3);

                    // choice 1 => target 1
                    syn.click(choice.el, function() {
                        _assertIsOnlyActiveChoice(choice.id);
                        
                    }).click(target.el, function() {
                        _assertIsOnlyActiveChoice();
                       
                        response.push([choice.id, target.id]);
                        _responseEquals(response, self.getState());

                    // choice 4 => target 3
                    }).click(choice2.el, function() {
                        _assertIsOnlyActiveChoice(choice2.id);

                    }).click(target2.el, function() {
                        _assertIsOnlyActiveChoice();
                       
                        response.push([choice2.id, target2.id]);
                        _responseEquals(response, self.getState());
                   
                    // remove target 1
                    }).click(target.el, function() {
                        removeChoice = $(".remove-choice").get(0);
                        
                        syn.click(removeChoice, function() {
                            _removeResponse(target, response);
                            _responseEquals(response, self.getState());

                        // remove target 3
                        }).click(target2.el, function() {
                            removeChoice = $(".remove-choice").get(0);
                            
                            syn.click(removeChoice, function() {
                                _removeResponse(target2, response);
                                _responseEquals(response, self.getState());

                                assert.equal(0, response.length);
                                
                                QUnit.start();
                            });
                        });
                    });
/*
                    
                    // === switch place

                    // add choice for target 3
                    choiceId = _clickChoice(2);
                    _assertIsOnlyActiveChoice(choiceId);
                    targetId = _clickTarget(3);
                    _assertIsOnlyActiveChoice();

                    response.push([choiceId, targetId]);
                    _responseEquals(response, this.getState());
                    
                    // switch choice for target 3
                    choiceId = _clickChoice(1);
                    _assertIsOnlyActiveChoice(choiceId);
                    targetId = _clickTarget(3);

                    response = [];
                    response.push([choiceId, targetId]);
                    _responseEquals(response, this.getState());
                    
                    // reset all !
                    _removeResponse(3, response);
                    _responseEquals(response, this.getState());
                    assert.equal(0, response.length);

                    
                    // === move choice

                    // add choice for target 4
                    choiceId = _clickChoice(5);
                    _assertIsOnlyActiveChoice(choiceId);
                    targetId = _clickTarget(2);
                    _assertIsOnlyActiveChoice();
                    
                    response.push([choiceId, targetId]);
                    _responseEquals(response, this.getState());
                    
                    // move choice
                    _clickTarget(2);
                    targetId = _clickTarget(3);
                    
                    response = [];
                    response.push([choiceId, targetId]);
                    _responseEquals(response, this.getState());

                    // reset all !
                    _removeResponse(3, response);
                    _responseEquals(response, this.getState());
                    assert.equal(0, response.length);
                    
                    
                    // === style check

                    // check active styles
                    choiceId = _clickChoice(3);
                    _assertIsOnlyActiveChoice(choiceId);
                    choiceId = _clickChoice(3);
                    _assertIsOnlyActiveChoice(choiceId);
                    // click on something else
                    $(".qti-interaction").trigger("mouseup");
                    _assertIsOnlyActiveChoice();

                   
                } catch (err) {
                    console.log(err);
                }
                */
            })
            .on('responsechange', function (response){
                $('#response-display').html(JSON.stringify(response, null, 2));
            })
            .init()
            .render($container);
/* */
    });

});