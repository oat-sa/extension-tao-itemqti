define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'core/mouseEvent',
    'ui/interactUtils',
    'json!taoQtiItem/test/qtiCommonRenderer/interactions/graphicGapMatch/sample.json'
], function($, _, qtiItemRunner, triggerMouseEvent, interactUtils, gapMatchData){
    'use strict';

    var runner;
    var fixtureContainerId = 'item-container';
    var outsideContainerId = 'outside-container';

    //override asset loading in order to resolve it from the runtime location
    var strategies = [{
        name : 'default',
        handle : function defaultStrategy(url){
            if(/assets/.test(url.toString())){
                return '../../taoQtiItem/views/js/test/qtiCommonRenderer/interactions/graphicGapMatch/' + url.toString();
            }
            return url.toString();
        }
    }];

    QUnit.module('Graphic GapMatch Interaction', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    QUnit.asyncTest('renders correctly', function(assert){
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

                interactUtils.tapOn($gapFiller, function(){
                    assert.ok($gapFiller.hasClass('active'), 'The gap filler is now active');
                    assert.notStrictEqual($hotspot.attr('stroke'), borderColorInactive, 'The hotspot is now highlighted');

                    QUnit.start();
                }, 200); // safety delay for the border color to start changing, could be shortened by removing the animation
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('enables to fill a hotspot', function(assert){
        QUnit.expect(4);

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', gapMatchData)
            .on('render', function() {
                var $gapFiller = $('.qti-choice[data-identifier="gapimg_1"]', $container);
                var $hotspot = $('.main-image-box rect', $container).eq(5);

                interactUtils.tapOn($gapFiller, function () {
                    interactUtils.tapOn($hotspot);
                }, 50);
            })
            .on('statechange', function(state){
                assert.ok(typeof state === 'object', 'The state is an object');
                assert.ok(typeof state.RESPONSE === 'object', 'The state has a response object');
                assert.deepEqual(state.RESPONSE, { response : { list  : { directedPair : [ ['gapimg_1', 'associablehotspot_6'] ] } } }, 'The pair is selected');

                QUnit.start();
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('enables to fill a hotspot with two gap fillers', function(assert){
        QUnit.expect(3);

        var stateChangeCounter = 0;
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', gapMatchData)
            .on('render', function() {
                var $gapFiller = $('.qti-choice[data-identifier="gapimg_1"]', $container);
                var $gapFiller2 = $('.qti-choice[data-identifier="gapimg_3"]', $container);
                var $hotspot = $('.main-image-box rect', $container).eq(5);

                interactUtils.tapOn($gapFiller, function () {
                    interactUtils.tapOn($hotspot, function () {
                        interactUtils.tapOn($gapFiller2, function () {
                            // we click on the image, but the click should be redirected to the underlying shape
                            var $gapFillerOnHotspot = $container.find('.main-image-box image', $container).eq(1);
                            interactUtils.tapOn($gapFillerOnHotspot);

                        }, 10);
                    }, 300); // we need to wait for the animation to end in order for the click event to be bound
                }, 10);
            })
            .on('statechange', function(state){
                stateChangeCounter++;
                if (stateChangeCounter === 1) {
                    assert.deepEqual(
                        state.RESPONSE,
                        { response : { list  : { directedPair : [ ['gapimg_1', 'associablehotspot_6'] ] } } },
                        'The first pair is selected');

                } else if (stateChangeCounter === 2) {
                    assert.deepEqual(
                        state.RESPONSE,
                        { response : { list  : { directedPair : [ ['gapimg_1', 'associablehotspot_6'], ['gapimg_3', 'associablehotspot_6'] ] } } },
                        'The 2 pairs are selected');

                    QUnit.start();
                }
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('enables to remove a gap filler', function(assert){
        QUnit.expect(4);

        var stateChangeCounter = 0;
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', gapMatchData)
            .on('render', function() {
                var $gapFiller = $('.qti-choice[data-identifier="gapimg_1"]', $container);
                var $hotspot = $('.main-image-box rect', $container).eq(5);

                interactUtils.tapOn($gapFiller, function () {
                    interactUtils.tapOn($hotspot, function () {
                        var $gapFillerOnHotspot = $container.find('.main-image-box image', $container).eq(1);

                        interactUtils.tapOn($gapFillerOnHotspot);

                         assert.equal(
                             $container.find('.main-image-box image').length,
                             1, // this is the canvas image
                             'there are no filled gaps');

                    }, 300); // we need to wait for the animation to end in order for the click event to be bound
                }, 10);
            })
            .on('statechange', function(state){
                stateChangeCounter++;
                if (stateChangeCounter === 1) {
                    assert.deepEqual(state.RESPONSE, { response : { list  : { directedPair : [ ['gapimg_1', 'associablehotspot_6'] ] } } }, 'The pair is selected');
                } else if (stateChangeCounter === 2) {
                    assert.deepEqual(state.RESPONSE, { response : { list  : { directedPair : [] } } }, 'Response is empty');
                    QUnit.start();
                }
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('set the default response', function(assert){
        QUnit.expect(2);

        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', gapMatchData)
            .on('render', function(){
                var $gapFiller = $('.qti-choice[data-identifier="gapimg_1"]', $container);
                var gapFillerImgSrc = $gapFiller.find('img').attr('src');

                this.setState({ RESPONSE : { response : { list  : { directedPair : [ ['gapimg_1', 'associablehotspot_6'] ] } } } });

                _.delay(function(){
                    var $gapFillerOnHotspot = $container.find('.main-image-box image', $container).eq(1);
                    assert.equal($gapFillerOnHotspot.attr('href'), gapFillerImgSrc, 'state has been restored');

                    QUnit.start();
                }, 300);
            })
            .assets(strategies)
            .init()
            .render($container);
    });

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

                interactUtils.tapOn($gapFiller, function () {
                    interactUtils.tapOn($hotspot, function(){
                        assert.deepEqual(
                            self.getState(),
                            {'RESPONSE': { response : { list : { directedPair : [] } } } },
                            'Click does not trigger response once destroyed');
                        QUnit.start();

                    }, 10);
                }, 10);

            })
            .assets(strategies)
            .init()
            .render($container);
    });

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

                interactUtils.tapOn($gapFiller, function () {

                    interactUtils.tapOn($hotspot, function() {

                        var $gapFillerOnHotspot = $container.find('.main-image-box image').eq(1);
                        assert.equal($gapFillerOnHotspot.attr('href'), gapFillerImgSrc, 'gap filler is on canvas');

                        _.delay(function() {
                            // reset response manually
                            var interaction = self._item.getInteractions()[0];
                            interaction.renderer.resetResponse(interaction);

                            _.delay(function(){
                                assert.equal(
                                    $container.find('.main-image-box image').length,
                                    1, // this is the canvas image
                                    'there is no filled gap');

                                QUnit.start();
                            }, 100);
                        }, 100);
                    }, 300);
                }, 100);
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.module('Visual Test');

    QUnit.asyncTest('Display and play', function(assert){
        QUnit.expect(1);

        var $container = $('#' + outsideContainerId);
        assert.equal($container.length, 1, 'the item container exists');

        qtiItemRunner('qti', gapMatchData)
            .on('render', function() {
                QUnit.start();
            })
            .on('statechange', function(state){
                document.getElementById('response-display').textContent = JSON.stringify(state);
            })
            .assets(strategies)
            .init()
            .render($container);
    });
});

