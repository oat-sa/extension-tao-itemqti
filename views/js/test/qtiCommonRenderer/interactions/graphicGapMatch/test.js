// todo change gap & choice terminology to match the one in the graphic gap match interaction
// (which is the opposite of the one in the gap match interaction...)
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
        if (element) {
            element.dispatchEvent(new CustomEvent("click"));
        }
    }

    module('Graphic GapMatch Interaction', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    /* */
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

    /* */
    QUnit.asyncTest('enables to activate a gap filler', function(assert){
        QUnit.expect(5);

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', gapMatchData)
            .on('render', function(){
                var $gapFiller = $('.qti-choice[data-identifier="gapimg_1"]', $container);
                var $hotspot = $('.main-image-box rect', $container).eq(5);
                var borderColorInactive = '#8d949e';

                assert.ok(! $gapFiller.hasClass('active'), 'The gap filler is not active');
                assert.strictEqual( $hotspot.attr('stroke'), borderColorInactive, 'The hotspot is not highlighted');

                $gapFiller.trigger('click');
                // clickOn($gapFiller.get(0));

                _.delay(function(){
                    assert.ok($gapFiller.hasClass('active'), 'The gap filler is now active');
                    assert.notStrictEqual($hotspot.attr('stroke'), borderColorInactive, 'The hotspot is now highlighted');

                    QUnit.start();
                }, 20);
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    /* */
    QUnit.asyncTest('enables to fill a hotspot', function(assert){
        QUnit.expect(4);

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', gapMatchData)
            .on('render', function() {
                var $gapFiller = $('.qti-choice[data-identifier="gapimg_1"]', $container);
                var $hotspot = $('.main-image-box rect', $container).eq(5);

                $gapFiller.trigger('click');

                _.delay(function () {
                    clickOnRaphael($hotspot.get(0));
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

    /* */
    QUnit.asyncTest('enables to fill a hotspot with two gap fillers', function(assert){
        QUnit.expect(2);

        var stateChangeCounter = 0;
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', gapMatchData)
            .on('render', function() {
                var $gapFiller = $('.qti-choice[data-identifier="gapimg_1"]', $container);
                var $gapFiller2 = $('.qti-choice[data-identifier="gapimg_3"]', $container);
                var $hotspot = $('.main-image-box rect', $container).eq(5);

                $gapFiller.trigger('click');
                _.delay(function () {
                    clickOnRaphael($hotspot.get(0));

                    _.delay(function () {
                        $gapFiller2.trigger('click');

                        _.delay(function () {
                            // we click on the first image, but the interaction should redirect the click to the shape
                            var $gapFillerOnHotspot = $container.find('.main-image-box image', $container).eq(1);
                            clickOnRaphael($gapFillerOnHotspot.get(0));

                            // todo assert something !!!

                        }, 410); // we need to wait for the animation to end in order for the click event to be bound
                    }, 10);
                }, 10);
            })
            .on('statechange', function(state){
                stateChangeCounter++;
                if (stateChangeCounter === 2) {
                    assert.deepEqual(state.RESPONSE, { response : { list  : { directedPair : [ ['associablehotspot_6', 'gapimg_1'], ['associablehotspot_6', 'gapimg_3'] ] } } }, 'The 2 pairs are selected');
                    QUnit.start();
                }

            })
            .assets(strategies)
            .init()
            .render($container);
    });

    /* */
    QUnit.asyncTest('enables to remove a gap filler', function(assert){
        QUnit.expect(4);

        var stateChangeCounter = 0;
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', gapMatchData)
            .on('render', function() {
                var $gapFiller = $('.qti-choice[data-identifier="gapimg_1"]', $container);
                var $hotspot = $('.main-image-box rect', $container).eq(5);

                $gapFiller.trigger('click');

                _.delay(function () {
                    clickOnRaphael($hotspot.get(0));

                    _.delay(function () {
                        var $atClone = $container.find('.main-image-box image', $container).eq(1);
                        clickOnRaphael($atClone.get(0));

                         assert.equal($container.find('.main-image-box image', $container).length, 1,
                             'there is no filled gap');

                    }, 410); // we need to wait for the animation to end in order for the click event to be bound
                }, 10);
            })
            .on('statechange', function(state){
                stateChangeCounter++;
                if (stateChangeCounter === 1) {
                    assert.deepEqual(state.RESPONSE, { response : { list  : { directedPair : [ ['associablehotspot_6', 'gapimg_1'] ] } } }, 'The pair is selected');
                } else if (stateChangeCounter === 2) {
                    assert.deepEqual(state.RESPONSE, { response : { list  : { directedPair : [] } } }, 'Response is empty');
                    QUnit.start();
                }
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    /* */
    QUnit.asyncTest('set the default response', function(assert){
        QUnit.expect(2);

        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', gapMatchData)
            .on('render', function(){
                var $gapFiller = $('.qti-choice[data-identifier="gapimg_1"]', $container);
                var gapFillerImgSrc = $gapFiller.find('img').attr('src');

                this.setState({ RESPONSE : { response : { list  : { directedPair : [ ['associablehotspot_6', 'gapimg_1'] ] } } } });

                _.delay(function(){
                    var $gapFillerOnHotspot = $container.find('.main-image-box image', $container).eq(1);
                    assert.equal($gapFillerOnHotspot.attr('href'), gapFillerImgSrc, 'state has been restored');

                    QUnit.start();
                }, 410);
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    /* */
    QUnit.asyncTest('destroys', function(assert){
        QUnit.expect(2);

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');

        qtiItemRunner('qti', gapMatchData)
            .on('render', function(){
                var self = this;

                //call destroy manually
                var interaction = this._item.getInteractions()[0];
                interaction.renderer.destroy(interaction);

                var $gapFiller = $('.qti-choice[data-identifier="gapimg_1"]', $container);
                var $hotspot = $('.main-image-box rect', $container).eq(5);

                $gapFiller.trigger('click');

                _.delay(function () {
                    clickOnRaphael($hotspot.get(0));

                    _.delay(function(){
                        assert.deepEqual(self.getState(), {'RESPONSE': { response : { list : { directedPair : [] } } } }, 'Click does not trigger response once destroyed');
                        QUnit.start();

                    }, 10);
                }, 10);

            })
            .assets(strategies)
            .init()
            .render($container);
    });

    /* */

    QUnit.asyncTest('resets the response', function(assert){
        QUnit.expect(3);

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', gapMatchData)
            .on('render', function(){
                var self = this;

                var $gapFiller = $('.qti-choice[data-identifier="gapimg_1"]', $container);
                var gapFillerImgSrc = $gapFiller.find('img').attr('src');
                var $hotspot = $('.main-image-box rect', $container).eq(5);

                $gapFiller.trigger('click');

                _.delay(function () {
                    clickOnRaphael($hotspot.get(0));

                    _.delay(function(){

                        var $gapFillerOnHotspot = $container.find('.main-image-box image', $container).eq(1);
                        assert.equal($gapFillerOnHotspot.attr('href'), gapFillerImgSrc, 'state has been restored');

                        clickOn($hotspot.get(0));

                        _.delay(function() {
                            // reset response manually
                            var interaction = self._item.getInteractions()[0];
                            interaction.renderer.resetResponse(interaction);

                            // todo use interaction to retrieve gapFillers in other tests

                            _.delay(function(){
                                assert.equal($container.find('.main-image-box image', $container).length, 1,
                                    'there is no filled gap');

                                QUnit.start();
                            }, 100);
                        }, 100);
                    }, 410);
                }, 100);
            })
            .assets(strategies)
            .init()
            .render($container);
    });

/* * /
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
                * /
            })
            .assets(strategies)
            .init()
            .render($container);
    });
/* */
});

