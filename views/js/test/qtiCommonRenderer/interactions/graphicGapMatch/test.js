define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'json!taoQtiItem/test/qtiCommonRenderer/interactions/graphicGapMatch/sample.json'
], function($, _, qtiItemRunner, gapMatchData){
    'use strict';

    var runner;
    var fixtureContainerId = 'item-container';
    var outsideContainerId = 'outside-container';

    //override asset loading in order to resolve it from the runtime location
    var strategies = [{
        name : 'portableElementLocation',
        handle : function handlePortableElementLocation(url){
            if(/assets/.test(url.toString())){
                return '../../taoQtiItem/views/js/test/qtiCommonRenderer/interactions/graphicGapMatch/' + url.toString();
            }
        }
    }, {
        name : 'default',
        handle : function defaultStrategy(url){
            return url.toString();
        }
    }];

    function clickOn(element) {
        var eventOptions = {
            bubbles: true,
            cancelable: true,
            view: window
        };
        element.dispatchEvent(new MouseEvent("mousedown", eventOptions));
        element.dispatchEvent(new MouseEvent("mouseup", eventOptions));
    }

    function clickOnRaphael(element) {
        element.dispatchEvent(new CustomEvent("click"));
    }

    module('Graphic GapMatch Interaction', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });
/* * /
    QUnit.asyncTest('renders correclty', function(assert){
        QUnit.expect(20);

        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', gapMatchData)
            .on('render', function(){

                //check DOM
                assert.equal($container.children().length, 1, 'the container a elements');
                assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                assert.equal($container.find('.qti-itemBody').length, 1, 'the container contains a the body element .qti-itemBody');
                assert.equal($container.find('.qti-interaction').length, 1, 'the container contains an interaction .qti-interaction');
                assert.equal($container.find('.qti-interaction.qti-graphicGapMatchInteraction').length, 1, 'the container contains a choice interaction .qti-graphicGapMatchInteraction');
                assert.equal($container.find('.qti-graphicGapMatchInteraction .qti-prompt-container').length, 1, 'the interaction contains a prompt');
                assert.equal($container.find('.qti-graphicGapMatchInteraction .instruction-container').length, 1, 'the interaction contains a instruction box');
                assert.equal($container.find('.qti-graphicGapMatchInteraction .block-listing').length, 1, 'the interaction contains a choice area');
                assert.equal($container.find('.qti-graphicGapMatchInteraction .block-listing .qti-choice').length, 6, 'the interaction has 6 choices');
                assert.equal($container.find('.qti-graphicGapMatchInteraction .main-image-box').length, 1, 'the interaction contains a image');
                assert.equal($container.find('.qti-graphicGapMatchInteraction .main-image-box rect').length, 6, 'the interaction contains 6 gaps');

                //check DOM data
                assert.equal($container.children('.qti-item').data('identifier'), 'i1462375832429680', 'the .qti-item node has the right identifier');

                assert.equal($container.find('.qti-graphicGapMatchInteraction .block-listing .qti-choice').eq(0).data('identifier'), 'gapimg_1', 'the 1st block has the right identifier');
                assert.equal($container.find('.qti-graphicGapMatchInteraction .block-listing .qti-choice').eq(1).data('identifier'), 'gapimg_2', 'the 2nd block has the right identifier');
                assert.equal($container.find('.qti-graphicGapMatchInteraction .block-listing .qti-choice').eq(2).data('identifier'), 'gapimg_3', 'the 3rd block has the right identifier');
                assert.equal($container.find('.qti-graphicGapMatchInteraction .block-listing .qti-choice').eq(3).data('identifier'), 'gapimg_4', 'the 4th block has the right identifier');
                assert.equal($container.find('.qti-graphicGapMatchInteraction .block-listing .qti-choice').eq(4).data('identifier'), 'gapimg_5', 'the 5th block has the right identifier');
                assert.equal($container.find('.qti-graphicGapMatchInteraction .block-listing .qti-choice').eq(5).data('identifier'), 'gapimg_6', 'the 6th block has the right identifier');

                QUnit.start();
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('enables to activate a choice', function(assert){
        QUnit.expect(10);

        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', gapMatchData)
            .on('render', function(){
                assert.equal($container.find('.qti-interaction.qti-graphicGapMatchInteraction').length, 1, 'the container contains a choice interaction .qti-graphicGapMatchInteraction');
                assert.equal($container.find('.qti-graphicGapMatchInteraction .qti-choice').length, 6, 'the interaction has 16 choices including gaps');

                var $at = $('.qti-choice[data-identifier="gapimg_1"]', $container);
                assert.equal($at.length, 1, 'the taoSubjects choice exists');

                var $gap = $('.main-image-box rect', $container).eq(5);
                assert.equal($gap.length, 1, 'the gap exists');

                assert.ok( ! $at.hasClass('active'), 'The choice is not active');
                assert.strictEqual( $gap.attr('stroke'), '#8d949e', 'The gap is not highlighted');

                // $at.trigger('click');
                clickOn($at.get(0));

                _.delay(function(){

                    assert.ok($at.hasClass('active'), 'The choice is now active');
                    assert.strictEqual( $gap.attr('stroke'), '#3e7da7', 'The gap is now highlighted');

                    QUnit.start();
                }, 1000); // todo too long!!!
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('enables to fill a gap with a choice', function(assert){
        QUnit.expect(9);

        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', gapMatchData)
            .on('render', function() {
                assert.equal($container.find('.qti-interaction.qti-graphicGapMatchInteraction').length, 1, 'the container contains a choice interaction .qti-graphicGapMatchInteraction');
                assert.equal($container.find('.qti-graphicGapMatchInteraction .qti-choice').length, 6, 'the interaction has 6 choices including gaps');

                var $at = $('.qti-choice[data-identifier="gapimg_1"]', $container);
                assert.equal($at.length, 1, 'the taoSubjects choice exists');

                var $gap = $('.main-image-box rect', $container).eq(5);
                assert.equal($gap.length, 1, 'the gap exists');

                $at.trigger('click');

                _.delay(function () {
                    clickOnRaphael($gap.get(0));
                }, 10);
            })
            .on('statechange', function(state){
                assert.ok(typeof state === 'object', 'The state is an object');
                assert.ok(typeof state.RESPONSE === 'object', 'The state has a response object');
                assert.deepEqual(state.RESPONSE, { response : { list  : { directedPair : [ ['associablehotspot_6', 'gapimg_1'] ] } } }, 'The pair is selected');

                QUnit.start();
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    // todo make this work !
/*
    QUnit.asyncTest('set the default response', function(assert){
        QUnit.expect(9);

        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', gapMatchData)
            .on('render', function(){

                assert.equal($container.find('.qti-interaction.qti-graphicGapMatchInteraction').length, 1, 'the container contains a choice interaction .qti-graphicGapMatchInteraction');
                assert.equal($container.find('.qti-graphicGapMatchInteraction .qti-choice').length, 6, 'the interaction has 6 choices including gaps');

                var $at = $('.qti-choice[data-identifier="gapimg_1"]', $container);
                assert.equal($at.length, 1, 'the taoSubjects choice exists');

                var $gap = $('.main-image-box rect', $container).eq(5);
                assert.equal($gap.length, 1, 'the gap exists');

                assert.ok( ! $gap.hasClass('filled'), 'The gap is not filled');

                  this.setState({ RESPONSE : { response : { list  : { directedPair : [ ['Text_1', 'Gap_6'] ] } } } });

                _.delay(function(){
                    assert.ok($gap.hasClass('filled'), 'The gap is now filled');
                    assert.equal($gap.text(), 'authoring tool', 'The gap contains the choice text');

                    QUnit.start();
                }, 10);
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    /* * /

     QUnit.asyncTest('destroys', function(assert){
        QUnit.expect(5);

        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        qtiItemRunner('qti', gapMatchData)
            .on('render', function(){
                var self = this;

                //call destroy manually
                var interaction = this._item.getInteractions()[0];
                interaction.renderer.destroy(interaction);

                var $at = $('.qti-choice[data-identifier="Text_1"]', $container);
                assert.equal($at.length, 1, 'the Authoring tool choice exists');

                var $gap = $('.gapmatch-content[data-identifier="Gap_6"]', $container);
                assert.equal($gap.length, 1, 'the gap exists');

                clickOn($at.get(0));

                _.delay(function(){
                    clickOn($gap.get(0));

                    _.delay(function(){
                        assert.deepEqual(self.getState(), {'RESPONSE': { response : { list : { directedPair : [] } } } }, 'Click does not trigger response once destroyed');

                        QUnit.start();
                    }, 100);
                }, 10);

            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('resets the response', function(assert){
        QUnit.expect(10);

        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', gapMatchData)
            .on('render', function(){
                var self = this;

                var $at = $('.qti-choice[data-identifier="Text_1"]', $container);
                assert.equal($at.length, 1, 'the Authoring tool choice exists');

                var $gap = $('.gapmatch-content[data-identifier="Gap_6"]', $container);
                assert.equal($gap.length, 1, 'the gap exists');

                clickOn($at.get(0));

                _.delay(function(){
                    clickOn($gap.get(0));

                    _.delay(function(){

                        assert.ok($gap.hasClass('filled'), 'The gap is now filled');
                        assert.equal($gap.text(), 'authoring tool', 'The gap contains the choice text');

                        clickOn($gap.get(0));

                        _.delay(function() {
                            assert.ok($gap.hasClass('active'), 'The gap is now active');

                            //call destroy manually
                            var interaction = self._item.getInteractions()[0];
                            interaction.renderer.resetResponse(interaction);

                            _.delay(function(){

                                assert.ok( ! $gap.hasClass('filled'), 'The gap is not filled anymore');
                                assert.ok(! $gap.hasClass('active'), 'The gap is not active anymore');
                                assert.equal($gap.text(), '', 'The gap is now empty');

                                QUnit.start();
                            }, 100);
                        }, 100);
                    }, 100);
                }, 100);
            })
            .assets(strategies)
            .init()
            .render($container);
    });

/* */
    module('Visual Test');

    QUnit.asyncTest('Display and play', function(assert){
        QUnit.expect(4);

        var $container = $('#' + outsideContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        qtiItemRunner('qti', gapMatchData)
            .on('render', function(){

                assert.equal($container.find('.qti-interaction.qti-graphicGapMatchInteraction').length, 1, 'the container contains a choice interaction .qti-graphicGapMatchInteraction');
                assert.equal($container.find('.qti-graphicGapMatchInteraction .qti-choice').length, 6, 'the interaction has 6 choices including gaps');
                var $at = $('.qti-choice[data-identifier="gapimg_1"]', $container);
                var $gap = $('.main-image-box rect', $container).eq(5);


                // $at.trigger('click');
                // clickOn($at.get(0));

                /*
                _.delay(function () {
                    var gap = $gap.get(0);
                    gap.dispatchEvent(new CustomEvent("click"));
                        _.delay(function () {
                            QUnit.start();
                        }, 500);
                }, 500);
                */
            })
            .assets(strategies)
            .init()
            .render($container);
    });
});

