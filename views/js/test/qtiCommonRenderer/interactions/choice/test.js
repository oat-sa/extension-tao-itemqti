define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'json!taoQtiItem/test/samples/json/space-shuttle.json',
    'json!taoQtiItem/test/samples/json/space-shuttle-m.json',
    'json!taoQtiItem/test/samples/json/space-shuttle-ident.json'
], function ($, _, qtiItemRunner, choiceData, multipleChoiceData, badIdentChoiceData) {
    'use strict';

    var runner;
    var fixtureContainerId = 'item-container';
    var outsideContainerId = 'outside-container';

    module('Choice Interaction', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    QUnit.asyncTest('renders correclty', function(assert){
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(17);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', choiceData)
            .on('render', function(){

                //check DOM
                assert.equal($container.children().length, 1, 'the container a elements');
                assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                assert.equal($container.find('.qti-itemBody').length, 1, 'the container contains a the body element .qti-itemBody');
                assert.equal($container.find('.qti-interaction').length, 1, 'the container contains an interaction .qti-interaction');
                assert.equal($container.find('.qti-interaction.qti-choiceInteraction').length, 1, 'the container contains a choice interaction .qti-choiceInteraction');
                assert.equal($container.find('.qti-choiceInteraction .qti-prompt-container').length, 1, 'the interaction contains a prompt');
                assert.equal($container.find('.qti-choiceInteraction .instruction-container').length, 1, 'the interaction contains a instruction box');
                assert.equal($container.find('.qti-choiceInteraction .choice-area').length, 1, 'the interaction contains a choice list');
                assert.equal($container.find('.qti-choiceInteraction .qti-choice').length, 5, 'the interaction has 5 choices');

                //check DOM data
                assert.equal($container.children('.qti-item').data('identifier'), 'space-shuttle-30-years-of-adventure', 'the .qti-item node has the right identifier');

                assert.equal($container.find('.qti-choiceInteraction .qti-choice:nth-child(1)').data('identifier'), 'Discovery', 'the 1st choice has the right identifier');
                assert.equal($container.find('.qti-choiceInteraction .qti-choice:nth-child(2)').data('identifier'), 'Challenger', 'the 2nd choice has the right identifier');
                assert.equal($container.find('.qti-choiceInteraction .qti-choice:nth-child(3)').data('identifier'), 'Pathfinder', 'the 3rd choice has the right identifier');
                assert.equal($container.find('.qti-choiceInteraction .qti-choice:nth-child(4)').data('identifier'), 'Atlantis', 'the 4th choice has the right identifier');
                assert.equal($container.find('.qti-choiceInteraction .qti-choice:nth-child(5)').data('identifier'), 'Endeavour', 'the 5th choice has the right identifier');

                QUnit.start();
            })
            .init()
            .render($container);
    });


    QUnit.asyncTest('enables to select a choice', function(assert){
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(8);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', choiceData)
            .on('render', function(){
                var $discovery = $('.qti-choice[data-identifier="Discovery"]', $container);

                assert.equal($container.find('.qti-interaction.qti-choiceInteraction').length, 1, 'the container contains a choice interaction .qti-choiceInteraction');
                assert.equal($container.find('.qti-choiceInteraction .qti-choice').length, 5, 'the interaction has 5 choices');
                assert.equal($discovery.length, 1, 'the Discovery choice exists');

                $discovery.trigger('click');
            })
            .on('statechange', function(state){
                assert.ok(typeof state === 'object', 'The state is an object');
                assert.ok(typeof state.RESPONSE === 'object', 'The state has a response object');
                assert.deepEqual(state.RESPONSE, { response : { base  : { identifier : 'Discovery' } } }, 'The discovery response is selected');
                QUnit.start();
            })
            .init()
            .render($container);
    });


    QUnit.asyncTest('enables to select a unique choice', function(assert){
        var $container = $('#' + fixtureContainerId);
        var changes = 0;

        QUnit.expect(11);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', choiceData)
            .on('render', function(){
                var $discovery = $('.qti-choice[data-identifier="Discovery"]', $container);
                var $challenger = $('.qti-choice[data-identifier="Challenger"]', $container);

                assert.equal($container.find('.qti-interaction.qti-choiceInteraction').length, 1, 'the container contains a choice interaction .qti-choiceInteraction');
                assert.equal($container.find('.qti-choiceInteraction .qti-choice').length, 5, 'the interaction has 5 choices');
                assert.equal($discovery.length, 1, 'the Discovery choice exists');
                assert.equal($discovery.length, 1, 'the Challenger choice exists');

                $discovery.trigger('click');
                _.delay(function(){
                    $challenger.trigger('click');
                }, 200);
            })
            .on('statechange', function(state){
                if(++changes === 2){
                    //check the response is challenger
                    assert.ok(typeof state === 'object', 'The state is an object');
                    assert.ok(typeof state.RESPONSE === 'object', 'The state has a response object');
                    assert.deepEqual(state.RESPONSE, { response : { base  : { identifier : 'Challenger' } } }, 'The Challenger response is selected');

                    //Challenger is checked instead of Discovery
                    assert.ok( ! $('[data-identifier="Discovery"] input', $container).prop('checked'), 'Discovery is not checked');
                    assert.ok($('[data-identifier="Challenger"] input', $container).prop('checked'), 'Challenger is now checked');

                    QUnit.start();
                }
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('enables to select multiple choices', function(assert){
        var $container = $('#' + fixtureContainerId);
        var changes = 0;

        QUnit.expect(11);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', multipleChoiceData)
            .on('render', function(){
                var $discovery = $('.qti-choice[data-identifier="Discovery"]', $container);
                var $challenger = $('.qti-choice[data-identifier="Challenger"]', $container);

                assert.equal($container.find('.qti-interaction.qti-choiceInteraction').length, 1, 'the container contains a choice interaction .qti-choiceInteraction');
                assert.equal($container.find('.qti-choiceInteraction .qti-choice').length, 5, 'the interaction has 5 choices');
                assert.equal($container.find('.qti-choiceInteraction .instruction-container').length, 1, 'the interaction contains an instruction box');
                assert.equal($container.find('.qti-choiceInteraction .instruction-container').children().length, 2, 'the interaction has 2 instructions');
                assert.equal($discovery.length, 1, 'the Discovery choice exists');
                assert.equal($discovery.length, 1, 'the Challenger choice exists');

                $discovery.trigger('click');
                _.delay(function(){
                    $challenger.trigger('click');
                }, 200);
            })
            .on('statechange', function(state){
                if(++changes === 2){
                    assert.ok(typeof state === 'object', 'The state is an object');
                    assert.ok(typeof state.RESPONSE === 'object', 'The state has a response object');
                    assert.deepEqual(state.RESPONSE, { response : { list  : { identifier : ['Discovery', 'Challenger'] } } }, 'Discovery AND Challenger are selected');
                    QUnit.start();
                }
            })
            .init()
            .render($container);
    });


    QUnit.asyncTest('set the default response', function(assert){
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(4);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', choiceData)
            .on('render', function(){

                assert.ok( ! $('[data-identifier="Atlantis"] input', $container).prop('checked'), 'Atlantis is not checked');

                this.setState({ RESPONSE : { response : {  base : { identifier : 'Atlantis' } } } });

                assert.ok($('[data-identifier="Atlantis"] input', $container).prop('checked'), 'Atlantis is now checked');

                QUnit.start();
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('destroys', function(assert){
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(5);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', choiceData)
            .on('render', function(){
                var $discovery = $('.qti-choice[data-identifier="Discovery"]', $container);
                var interaction = this._item.getInteractions()[0];
                var self = this;

                //call destroy manually
                interaction.renderer.destroy(interaction);

                assert.equal($discovery.length, 1, 'the Discovery choice exists');

                $discovery.trigger('click');

                _.delay(function(){
                    assert.deepEqual(self.getState(), {'RESPONSE': { response : { base : null } } }, 'Click does not trigger response once destroyed');
                    assert.equal($container.find('.qti-choiceInteraction .instruction-container').children().length, 0, 'there is no instructions anymore');

                    QUnit.start();
                }, 100);
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('resets the response', function(assert){
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(7);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', choiceData)
            .on('render', function(){
                var $discovery = $('.qti-choice[data-identifier="Discovery"]', $container);
                var self = this;

                assert.equal($container.find('.qti-interaction.qti-choiceInteraction').length, 1, 'the container contains a choice interaction .qti-choiceInteraction');
                assert.equal($container.find('.qti-choiceInteraction .qti-choice').length, 5, 'the interaction has 5 choices');
                assert.equal($discovery.length, 1, 'the Discovery choice exists');

                $discovery.trigger('click');

                _.delay(function(){
                    var interaction = self._item.getInteractions()[0];

                    assert.ok($('input', $discovery).prop('checked'), 'Discovery is now checked');

                    //call destroy manually
                    interaction.renderer.resetResponse(interaction);

                    _.delay(function(){
                        assert.ok( ! $('input', $discovery).prop('checked'), 'Discovery is not checked checked anymore');

                        QUnit.start();
                    }, 100);
                }, 100);
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('restores order of shuffled choices', function(assert){
        var $container = $('#' + fixtureContainerId);
        var shuffled;

        QUnit.expect(9);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        //hack the item data to set the shuffle attr to true
        shuffled = _.cloneDeep(choiceData);
        shuffled.body.elements.interaction_choiceinteraction_546cb89e04090230494786.attributes.shuffle = true;

        runner = qtiItemRunner('qti', shuffled)
            .on('render', function(){
                assert.equal($container.find('.qti-interaction.qti-choiceInteraction').length, 1, 'the container contains a choice interaction .qti-choiceInteraction');
                assert.equal($container.find('.qti-choiceInteraction .qti-choice').length, 5, 'the interaction has 5 choices');

                this.setState({
                    RESPONSE : {
                        response : { base : null },
                        order : ['Challenger', 'Atlantis', 'Pathfinder', 'Discovery', 'Endeavour']
                    }
                });

                _.delay(function(){

                    assert.equal($container.find('.qti-choiceInteraction .qti-choice:nth-child(1)').data('identifier'), 'Challenger', 'the 1st choice has the right identifier');
                    assert.equal($container.find('.qti-choiceInteraction .qti-choice:nth-child(2)').data('identifier'), 'Atlantis', 'the 2nd choice has the right identifier');
                    assert.equal($container.find('.qti-choiceInteraction .qti-choice:nth-child(3)').data('identifier'), 'Pathfinder', 'the 3rd choice has the right identifier');
                    assert.equal($container.find('.qti-choiceInteraction .qti-choice:nth-child(4)').data('identifier'), 'Discovery', 'the 4th choice has the right identifier');
                    assert.equal($container.find('.qti-choiceInteraction .qti-choice:nth-child(5)').data('identifier'), 'Endeavour', 'the 5th choice has the right identifier');

                    QUnit.start();
                }, 100);
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('get eliminated choices state', function(assert){
        var $container = $('#' + fixtureContainerId);
        var $discovery, $challenger, $pathfinder, $atlantis, $endeavour;
        var shuffled;

        QUnit.expect(11);

        //hack the item data to set the eliminable behaviour on
        shuffled = _.cloneDeep(choiceData);
        shuffled.body.elements.interaction_choiceinteraction_546cb89e04090230494786.attributes.class = 'eliminable';

        runner = qtiItemRunner('qti', shuffled)
            .on('render', function(){
                var self = this;

                $discovery  = $container.find('.qti-choiceInteraction .qti-choice[data-identifier=Discovery]');
                $challenger = $container.find('.qti-choiceInteraction .qti-choice[data-identifier=Challenger]');
                $pathfinder = $container.find('.qti-choiceInteraction .qti-choice[data-identifier=Pathfinder]');
                $atlantis   = $container.find('.qti-choiceInteraction .qti-choice[data-identifier=Atlantis]');
                $endeavour  = $container.find('.qti-choiceInteraction .qti-choice[data-identifier=Endeavour]');

                // All choices start not eliminated
                assert.ok(!$discovery.hasClass('eliminated'), 'Discovery starts not eliminated');
                assert.ok(!$challenger.hasClass('eliminated'), 'Challenger starts not eliminated');
                assert.ok(!$pathfinder.hasClass('eliminated'), 'Pathfinder starts not eliminated');
                assert.ok(!$atlantis.hasClass('eliminated'), 'Atlantis starts not eliminated');
                assert.ok(!$endeavour.hasClass('eliminated'), 'Endeavour starts not eliminated');

                // click 'eliminate'
                $discovery.find('[data-eliminable=trigger]').click();

                // set 'eliminated' state manually
                this.setState({
                    RESPONSE: {
                        response: { base: null },
                        eliminated: ['Atlantis']
                    }
                });

                _.delay(function(){
                    assert.ok( $discovery.hasClass('eliminated'), 'Discovery', 'Discovery has been eliminated');
                    assert.ok(!$challenger.hasClass('eliminated'), 'Challenger', 'Challenger has not been eliminated');
                    assert.ok(!$pathfinder.hasClass('eliminated'), 'Pathfinder', 'Pathfinder has not been eliminated');
                    assert.ok( $atlantis.hasClass('eliminated'), 'Atlantis', 'Atlantis has been eliminated');
                    assert.ok(!$endeavour.hasClass('eliminated'), 'Endeavour', 'Endeavour has not been eliminated');
                    assert.deepEqual(self.getState().RESPONSE.eliminated, ['Discovery', 'Atlantis'], 'state is correct');
                    QUnit.start();
                }, 100);
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('restores eliminated choices', function(assert){
        // Note: toggling state via events makes for unruly state management (and thus this mess of a test)
        var $eliminator;
        var $choice;
        var $container = $('#' + fixtureContainerId);
        var shuffled;

        QUnit.expect(3);

        //hack the item data to set the eliminable behaviour on
        shuffled = _.cloneDeep(choiceData);
        shuffled.body.elements.interaction_choiceinteraction_546cb89e04090230494786.attributes.class = 'eliminable';

        runner = qtiItemRunner('qti', shuffled)
        .on('render', function () {
            $choice = $container.find('.qti-choiceInteraction .qti-choice[data-identifier=Discovery]');
            $eliminator = $choice.find('[data-eliminable="trigger"]');

            // 1) is not eliminated
            assert.ok(!$choice.hasClass('eliminated'), 'Discovery is not eliminated');

            _.delay(function () {
                // 2) is eliminated
                assert.ok($choice.hasClass('eliminated'), 'Discovery has been eliminated');

                _.delay(function () {
                    // 3) is un-eliminated
                    assert.ok(!$choice.hasClass('eliminated'), 'Discovery has been un-eliminated');

                    QUnit.start();
                }, 100);

                // 2 -> 3 - un-eliminates item
                $eliminator.click();
            }, 100);

            // 1 -> 2 - eliminate item
            $eliminator.click();
        })
        .init()
        .render($container);
    });

    QUnit.asyncTest('check dashes and dots in the identifier', function(assert){
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(4);

        runner = qtiItemRunner('qti', badIdentChoiceData)
            .on('render', function(){
                var $discovery = $('.qti-choice[data-identifier="Discovery-new.dot"]', $container);
                assert.equal($discovery.length, 1, 'the Discovery-new.dot choice exists');
                $discovery.trigger('click');
            })
            .on('statechange', function(state){
                assert.ok(typeof state === 'object', 'The state is an object');
                assert.ok(typeof state.RESPONSE === 'object', 'The state has a response object');
                assert.deepEqual(state.RESPONSE, { response : { base  : { identifier : 'Discovery-new.dot' } } }, 'The Discovery-new.dot response is selected');

                QUnit.start();
            })
            .init()
            .render($container);
    });


    module('Visual Test');

    QUnit.asyncTest('Display and play', function(assert){
        var $container = $('#' + outsideContainerId);

        QUnit.expect(4);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        qtiItemRunner('qti', choiceData)
            .on('render', function(){
                assert.equal($container.find('.qti-interaction.qti-choiceInteraction').length, 1, 'the container contains a choice interaction .qti-choiceInteraction');
                assert.equal($container.find('.qti-choiceInteraction .qti-choice').length, 5, 'the interaction has 5 choices');

                QUnit.start();
            })
            .init()
            .render($container);
    });
});