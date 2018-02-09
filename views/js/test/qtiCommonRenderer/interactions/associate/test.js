define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'json!taoQtiItem/test/samples/json/rivals.json',
    'ui/interactUtils'
], function($, _, qtiItemRunner, associateData, interactUtils){
    'use strict';

    var runner;
    var fixtureContainerId = 'item-container';
    var outsideContainerId = 'outside-container';

    QUnit.module('Associate Interaction', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    QUnit.asyncTest('renders correclty', function(assert){
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(21);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', associateData)
            .on('render', function(){

                //check DOM
                assert.equal($container.children().length, 1, 'the container a elements');
                assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                assert.equal($container.find('.qti-itemBody').length, 1, 'the container contains a the body element .qti-itemBody');
                assert.equal($container.find('.qti-interaction').length, 1, 'the container contains an interaction .qti-interaction');
                assert.equal($container.find('.qti-interaction.qti-associateInteraction').length, 1, 'the container contains a associate interaction .qti-associateInteraction');
                assert.equal($container.find('.qti-associateInteraction .qti-prompt-container').length, 1, 'the interaction contains a prompt');
                assert.equal($container.find('.qti-associateInteraction .instruction-container').length, 1, 'the interaction contains a instruction box');
                assert.equal($container.find('.qti-associateInteraction .choice-area').length, 1, 'the interaction contains a choice list');
                assert.equal($container.find('.qti-associateInteraction .qti-choice').length, 6, 'the interaction has 6 choices');
                assert.equal($container.find('.qti-associateInteraction .result-area').length, 1, 'the interaction has a result area');

                //check DOM data
                assert.equal($container.children('.qti-item').data('identifier'), 'associate', 'the .qti-item node has the right identifier');

                assert.equal($container.find('.qti-associateInteraction .qti-choice:nth-child(1)').data('identifier'), 'A', 'the 1st choice has the right identifier');
                assert.equal($container.find('.qti-associateInteraction .qti-choice:nth-child(2)').data('identifier'), 'C', 'the 2nd choice has the right identifier');
                assert.equal($container.find('.qti-associateInteraction .qti-choice:nth-child(3)').data('identifier'), 'D', 'the 3rd choice has the right identifier');
                assert.equal($container.find('.qti-associateInteraction .qti-choice:nth-child(4)').data('identifier'), 'L', 'the 4th choice has the right identifier');
                assert.equal($container.find('.qti-associateInteraction .qti-choice:nth-child(5)').data('identifier'), 'M', 'the 5th choice has the right identifier');
                assert.equal($container.find('.qti-associateInteraction .qti-choice:nth-child(6)').data('identifier'), 'P', 'the 6th choice has the right identifier');

                assert.equal($container.find('.qti-associateInteraction .result-area').children().length, 3, 'the interaction has 3 pairs area according to maxAssocation');
                assert.equal($container.find('.qti-associateInteraction .result-area .target').length, 6, 'the interaction has 6 target box according to maxAssocation (3 pairs)');

                QUnit.start();
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('enables to activate a choice', function(assert){
        QUnit.expect(11);

        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', associateData)
            .on('render', function(){
                var $antonio;
                var $target;

                assert.equal($container.find('.qti-interaction.qti-associateInteraction').length, 1, 'the container contains an associate interaction .qti-associateInteraction');

                $antonio = $('.qti-choice[data-identifier="A"]', $container);
                assert.equal($antonio.length, 1, 'the A choice exists');

                $target = $('.result-area .target', $container).first();
                assert.equal($target.length, 1, 'the target exists');

                assert.ok( ! $antonio.hasClass('active'), 'The choice is not active');
                assert.ok( ! $target.hasClass('empty'), 'The target is not highlighted');

                interactUtils.tapOn($antonio, function(){
                    assert.ok( $antonio.hasClass('active'), 'The choice is active');
                    assert.ok( $target.hasClass('empty'), 'The target is highlighted');

                    interactUtils.tapOn($antonio, function(){
                        assert.ok( ! $antonio.hasClass('active'), 'The choice is not active anymore');
                        assert.ok( ! $target.hasClass('empty'), 'The target is not highlighted anymore');

                        QUnit.start();
                    }, 100);
                }, 100);
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('enables to create a pair', function(assert){
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(20);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', associateData)
            .on('render', function(){
                var $antonio;
                var $capulet;
                var $target1;
                var $target2;

                assert.equal($container.find('.qti-interaction.qti-associateInteraction').length, 1, 'the container contains an associate interaction .qti-associateInteraction');

                $antonio = $('.qti-choice[data-identifier="A"]', $container);
                assert.equal($antonio.length, 1, 'the A choice exists');

                $capulet = $('.qti-choice[data-identifier="C"]', $container);
                assert.equal($capulet.length, 1, 'the C choice exists');

                $target1 = $('.result-area li:first-child .lft', $container);
                assert.equal($target1.length, 1, 'the target exists');

                $target2 = $('.result-area li:first-child .rgt', $container);
                assert.equal($target2.length, 1, 'the target exists');

                interactUtils.tapOn($antonio, function(){
                    interactUtils.tapOn($target1, function(){
                        interactUtils.tapOn($capulet, function(){
                            interactUtils.tapOn($target2);
                        }, 10);
                    }, 10);
                }, 10);

            })
            .on('statechange', function(state){
                var $antonio;
                var $capulet;
                var $target1;
                var $target2;

                $antonio = $('.qti-choice[data-identifier="A"]', $container);
                assert.equal($antonio.length, 1, 'the A choice exists');
                assert.ok($antonio.hasClass('deactivated'), 'the A choice is deactivated');

                $capulet = $('.qti-choice[data-identifier="C"]', $container);
                assert.equal($capulet.length, 1, 'the C choice exists');
                assert.ok($capulet.hasClass('deactivated'), 'the C choice is deactivated');

                $target1 = $('.result-area li:first-child .lft', $container);
                assert.equal($target1.length, 1, 'the target exists');
                assert.ok($target1.hasClass('filled'), 'the target is filled');
                assert.equal($target1.text().trim(), 'Antonio', 'the target contains the choice text');

                $target2 = $('.result-area li:first-child .rgt', $container);
                assert.equal($target2.length, 1, 'the target exists');
                assert.ok($target2.hasClass('filled'), 'the target is filled');
                assert.equal($target2.text().trim(), 'Capulet', 'the target contains the choice text');

                assert.ok(typeof state === 'object', 'The state is an object');
                assert.ok(typeof state.RESPONSE === 'object', 'The state has a response object');
                assert.deepEqual(state.RESPONSE.response, { list : { pair : [ ['A', 'C'] ] } }, 'The pair is in the response');

                QUnit.start();
            })
            .init()
            .render($container);
    });


    QUnit.asyncTest('enables to use a choice multiple times', function(assert){
        var pChoiceMatchMax;
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(14);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        pChoiceMatchMax = associateData.body.elements.interaction_associateinteraction_54787e6dad70d437146538.choices.choice_simpleassociablechoice_54787e6dadcdd949770698.attributes.matchMax;
        assert.equal(pChoiceMatchMax, 2, "The matchMax attributes of the P choice is set at 2");

        runner = qtiItemRunner('qti', associateData)
            .on('render', function(){
                var $prospero;
                var $target1;
                var $target2;

                assert.equal($container.find('.qti-interaction.qti-associateInteraction').length, 1, 'the container contains an associate interaction .qti-associateInteraction');

                $prospero = $('.qti-choice[data-identifier="P"]', $container);
                assert.equal($prospero.length, 1, 'the A choice exists');
                assert.ok( ! $prospero.hasClass('deactivated'), 'the P choice is not deactivated');

                $target1 = $('.result-area li:first-child .lft', $container);
                assert.equal($target1.length, 1, 'the target exists');

                $target2 = $('.result-area li:first-child .rgt', $container);
                assert.equal($target2.length, 1, 'the target exists');

                interactUtils.tapOn($prospero, function(){
                    interactUtils.tapOn($target1, function(){
                        assert.ok($target1.hasClass('filled'), 'the target is filled');
                        assert.equal($target1.text().trim(), 'Prospero', 'the target contains the choice text');
                        assert.ok( ! $prospero.hasClass('deactivated'), 'the P choice is still not deactivated');

                        interactUtils.tapOn($prospero, function(){

                            interactUtils.tapOn($target2, function(){
                                assert.ok($target2.hasClass('filled'), 'the target is filled');
                                assert.equal($target2.text().trim(), 'Prospero', 'the target contains the choice text');
                                assert.ok($prospero.hasClass('deactivated'), 'the P choice is now deactivated');

                                QUnit.start();
                            }, 10);
                        }, 10);
                    }, 10);
                }, 10);

            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('enables to replace a choice', function(assert){
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(10);

        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', associateData)
            .on('render', function(){
                var $antonio = $('.qti-choice[data-identifier="A"]', $container);
                var $capulet = $('.qti-choice[data-identifier="C"]', $container);

                var $target1 = $('.result-area li:first-child .lft', $container);

                // Set Choice
                interactUtils.tapOn($antonio, function(){
                    interactUtils.tapOn($target1, function(){
                        assert.ok($antonio.hasClass('deactivated'), 'Antonio is deactivated');
                        assert.equal($antonio.innerText, $target1.innerText, 'Antonio has been added to the result area');
                        assert.ok(! $capulet.hasClass('deactivated'), 'Capulet is not deactivated');

                        // Replace by bringing another choice to the same target
                        interactUtils.tapOn($capulet, function(){
                            interactUtils.tapOn($target1, function() {
                                assert.equal($capulet.innerText, $target1.innerText, 'Capulet has replaced Antonio in the result area');
                                assert.ok(! $antonio.hasClass('deactivated'), 'Antonio is not deactivated anymore');
                                assert.ok($capulet.hasClass('deactivated'), 'Capulet is now deactivated');

                                // Replace by bringing the target to another choice
                                interactUtils.tapOn($target1, function() {
                                    interactUtils.tapOn($antonio, function() {
                                        assert.ok($antonio.hasClass('deactivated'), 'Antonio is deactivated');
                                        assert.equal($antonio.innerText, $target1.innerText, 'Antonio has been added to the result area');
                                        assert.ok(! $capulet.hasClass('deactivated'), 'Capulet is not deactivated');

                                        QUnit.start();
                                    }, 10);
                                }, 10);
                            }, 10);
                        }, 10);
                    }, 10);
                }, 10);
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('enables to switch pairs', function(assert){
        var $container = $('#' + fixtureContainerId),
            stateChangeCounter = 0;

        QUnit.expect(4);

        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', associateData)
            .on('render', function(){
                var $antonio = $('.qti-choice[data-identifier="A"]', $container);
                var $capulet = $('.qti-choice[data-identifier="C"]', $container);
                var $lysander = $('.qti-choice[data-identifier="L"]', $container);
                var $montague = $('.qti-choice[data-identifier="M"]', $container);

                var $target1 = $('.result-area li:first-child .lft', $container);
                var $target2 = $('.result-area li:first-child .rgt', $container);
                var $target3 = $('.result-area li:last-child .lft', $container);
                var $target4 = $('.result-area li:last-child .rgt', $container);

                // set first pair
                interactUtils.tapOn($antonio, function(){
                    interactUtils.tapOn($target1, function(){
                        interactUtils.tapOn($capulet, function(){
                            interactUtils.tapOn($target2, function(){

                                // set second pair
                                interactUtils.tapOn($lysander, function(){
                                    interactUtils.tapOn($target3, function(){
                                        interactUtils.tapOn($montague, function(){
                                            interactUtils.tapOn($target4, function(){

                                                // switch pair
                                                interactUtils.tapOn($target2, function(){
                                                    interactUtils.tapOn($target4);

                                                }, 10);
                                            }, 10);
                                        }, 10);
                                    }, 10);
                                }, 10);
                            }, 10);
                        }, 10);
                    }, 10);
                }, 10);

            })
            .on('statechange', function(state){
                stateChangeCounter++;

                if (stateChangeCounter === 1) {
                    assert.deepEqual(state.RESPONSE.response, { list : { pair : [ ['A', 'C'] ] } }, 'The pair is in the response');
                } else if (stateChangeCounter === 2) {
                    assert.deepEqual(state.RESPONSE.response, { list : { pair : [ ['A', 'C'], ['L', 'M'] ] } }, 'The second pair is in the response');
                } else if (stateChangeCounter === 4) {
                    assert.deepEqual(state.RESPONSE.response, {list: {pair: [['A', 'M'], ['L', 'C']]}}, 'The pairs have been switched');
                    QUnit.start();
                }

            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('enables remove a choice', function(assert){
        var $container = $('#' + fixtureContainerId),
            stateChangeCounter = 0;

        QUnit.expect(5);

        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', associateData)
            .on('render', function(){
                var $antonio = $('.qti-choice[data-identifier="A"]', $container);
                var $capulet = $('.qti-choice[data-identifier="C"]', $container);

                var $target1 = $('.result-area li:first-child .lft', $container);
                var $target2 = $('.result-area li:first-child .rgt', $container);

                interactUtils.tapOn($antonio, function(){
                    interactUtils.tapOn($target1, function(){
                        interactUtils.tapOn($capulet, function(){
                            interactUtils.tapOn($target2, function(){

                                // remove antonio!
                                interactUtils.tapOn($target1, function(){
                                    var $removeChoice = $('.remove-choice');
                                    interactUtils.tapOn($removeChoice);

                                }, 10);
                            }, 10);
                        }, 10);
                    }, 10);
                }, 10);

            })
            .on('statechange', function(state){
                var $antonio = $('.qti-choice[data-identifier="A"]', $container);
                stateChangeCounter++;

                if (stateChangeCounter === 1) {
                    assert.ok($antonio.hasClass('deactivated'), 'Antonio is deactivated');
                    assert.deepEqual(state.RESPONSE.response, { list : { pair : [ ['A', 'C'] ] } }, 'The pair is in the response');
                } else if (stateChangeCounter === 2) {
                    assert.ok(! $antonio.hasClass('deactivated'), 'Antonio can be selected');
                    assert.deepEqual(state.RESPONSE.response, { list : { pair : [] } }, 'The choice has been removed');
                    QUnit.start();
                }

            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('set the default response', function(assert){
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(17);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', associateData)
            .on('error', function(err) {
                assert.ok(false, err.message);
                QUnit.start();
            })
            .on('render', function(){
                var $antonio;
                var $capulet;
                var $target1;
                var $target2;

                assert.equal($container.find('.qti-interaction.qti-associateInteraction').length, 1, 'the container contains an associate interaction .qti-associateInteraction');

                $antonio = $('.qti-choice[data-identifier="A"]', $container);
                assert.equal($antonio.length, 1, 'the A choice exists');
                assert.ok( ! $antonio.hasClass('deactivated'), 'the A choice is not deactivated');

                $capulet = $('.qti-choice[data-identifier="C"]', $container);
                assert.equal($capulet.length, 1, 'the C choice exists');
                assert.ok( ! $capulet.hasClass('deactivated'), 'the C choice is not deactivated');

                $target1 = $('.result-area li:first-child .lft', $container);
                assert.equal($target1.length, 1, 'the target exists');
                assert.ok( ! $target1.hasClass('filled'), 'the target is not filled');

                $target2 = $('.result-area li:first-child .rgt', $container);
                assert.equal($target2.length, 1, 'the target exists');
                assert.ok( ! $target2.hasClass('filled'), 'the target is not filled');

                this.setState({ RESPONSE : { response : { list : { pair : [ ['A', 'C'] ] } } } });

                _.delay(function(){

                    assert.ok($antonio.hasClass('deactivated'), 'the A choice is deactivated');
                    assert.ok($capulet.hasClass('deactivated'), 'the C choice is deactivated');
                    assert.ok($target1.hasClass('filled'), 'the target is filled');
                    assert.equal($target1.text().trim(), 'Antonio', 'the target contains the choice text');
                    assert.ok($target2.hasClass('filled'), 'the target is filled');
                    assert.equal($target2.text().trim(), 'Capulet', 'the target contains the choice text');

                    QUnit.start();
                }, 100);
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('destroys', function(assert){
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(4);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', associateData)
            .on('render', function(){
                var self = this;
                var $antonio;

                //call destroy manually
                var interaction = this._item.getInteractions()[0];
                interaction.renderer.destroy(interaction);

                $antonio = $('.qti-choice[data-identifier="A"]', $container);
                assert.equal($antonio.length, 1, 'the A choice exists');

                interactUtils.tapOn($antonio, function(){

                    assert.deepEqual(self.getState(), {RESPONSE: { response :  {  list : { pair : [] }  } } }, 'Click does not trigger response once destroyed');

                    QUnit.start();
                }, 100);
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('resets the response', function(assert){
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(14);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', associateData)
            .on('render', function(){
                var self = this;
                var $antonio;
                var $capulet;
                var $target1;
                var $target2;

                $antonio = $('.qti-choice[data-identifier="A"]', $container);
                assert.equal($antonio.length, 1, 'the A choice exists');

                $capulet = $('.qti-choice[data-identifier="C"]', $container);
                assert.equal($capulet.length, 1, 'the C choice exists');

                $target1 = $('.result-area li:first-child .lft', $container);
                assert.equal($target1.length, 1, 'the target exists');

                $target2 = $('.result-area li:first-child .rgt', $container);
                assert.equal($target2.length, 1, 'the target exists');

                interactUtils.tapOn($antonio, function(){
                    interactUtils.tapOn($target1, function(){
                        interactUtils.tapOn($capulet, function(){
                            interactUtils.tapOn($target2, function() {
                                var interaction;

                                assert.ok($antonio.hasClass('deactivated'), 'the A choice is deactivated');
                                assert.ok($capulet.hasClass('deactivated'), 'the C choice is deactivated');
                                assert.ok($target1.hasClass('filled'), 'the target is filled');
                                assert.ok($target2.hasClass('filled'), 'the target is filled');

                                //call reset Response manually
                                interaction = self._item.getInteractions()[0];
                                interaction.renderer.resetResponse(interaction);

                                _.delay(function(){

                                    assert.ok( ! $antonio.hasClass('deactivated'), 'the A choice is not deactivated anymore');
                                    assert.ok( ! $capulet.hasClass('deactivated'), 'the C choice is not deactivated anymore');
                                    assert.ok( ! $target1.hasClass('filled'), 'the target is not filled anymore');
                                    assert.ok( ! $target2.hasClass('filled'), 'the target is not filled anymore');

                                    QUnit.start();
                                }, 100);
                            }, 10);
                        }, 10);
                    }, 10);
                }, 10);
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('restores order of shuffled choices', function(assert){
        var $container = $('#' + fixtureContainerId);
        var shuffled;

        QUnit.expect(10);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        //hack the item data to set the shuffle attributes to true
        shuffled = _.cloneDeep(associateData);
        shuffled.body.elements.interaction_associateinteraction_54787e6dad70d437146538.attributes.shuffle = true;

        runner = qtiItemRunner('qti', shuffled)
            .on('render', function(){

                assert.equal($container.find('.qti-interaction.qti-associateInteraction').length, 1, 'the container contains a choice interaction .qti-associateInteraction');
                assert.equal($container.find('.qti-associateInteraction .qti-choice').length, 6, 'the interaction has 6 choices');

                this.setState({
                    RESPONSE : {
                        response : { list : { pair : [] } },
                        order : ['M', 'L', 'C', 'D', 'A', 'P']
                    }
                });

                _.delay(function(){

                    assert.equal($container.find('.qti-associateInteraction .qti-choice:nth-child(1)').data('identifier'), 'M', 'the 1st choice has the right identifier');
                    assert.equal($container.find('.qti-associateInteraction .qti-choice:nth-child(2)').data('identifier'), 'L', 'the 2nd choice has the right identifier');
                    assert.equal($container.find('.qti-associateInteraction .qti-choice:nth-child(3)').data('identifier'), 'C', 'the 3rd choice has the right identifier');
                    assert.equal($container.find('.qti-associateInteraction .qti-choice:nth-child(4)').data('identifier'), 'D', 'the 4th choice has the right identifier');
                    assert.equal($container.find('.qti-associateInteraction .qti-choice:nth-child(5)').data('identifier'), 'A', 'the 5th choice has the right identifier');
                    assert.equal($container.find('.qti-associateInteraction .qti-choice:nth-child(6)').data('identifier'), 'P', 'the 6th choice has the right identifier');

                    QUnit.start();
                }, 100);
            })
            .init()
            .render($container);
    });

    QUnit.module('Visual Test');

    QUnit.asyncTest('Display and play', function(assert){
        var $container = $('#' + outsideContainerId);

        QUnit.expect(4);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', associateData)
            .on('render', function(){

                assert.equal($container.find('.qti-interaction.qti-associateInteraction').length, 1, 'the container contains a choice interaction .qti-associateInteraction');
                assert.equal($container.find('.qti-associateInteraction .qti-choice').length, 6, 'the interaction has 6 choices');

                QUnit.start();
            })
            .on('statechange', function(state) {
                document.getElementById('display-response').textContent = JSON.stringify(state);
            })
            .on('error', function(err) {
                assert.ok(false, err.message);
                QUnit.start();
            })
            .init()
            .render($container);
    });

});

