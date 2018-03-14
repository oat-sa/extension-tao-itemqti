define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'json!taoQtiItem/test/samples/json/media/video.json',
    'json!taoQtiItem/test/samples/json/media/audio.json'
], function($, _, qtiItemRunner, videoItemData, audioItemData){
    'use strict';

    var runner;
    var fixtureContainerId = 'item-container';
    var outsideContainerId = 'outside-container';

    var videoSampleUrl = '../../../taoQtiItem/views/js/test/samples/json/media/sample.mp4';
    var audioSampleUrl = '../../../taoQtiItem/views/js/test/samples/json/media/sample.mp3';

    QUnit.module('Media Interaction', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    QUnit.asyncTest('video renders correctly', function(assert){
        var $container;

        QUnit.expect(13);

        $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', videoItemData)
            .on('error', function(e){

                assert.ok(false, e);
                QUnit.start();
            })
            .on('render', function(){

                //check DOM
                assert.equal($container.children().length, 1, 'the container exists');
                assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                assert.equal($container.find('.qti-itemBody').length, 1, 'the container contains a the body element .qti-itemBody');
                assert.equal($container.find('.qti-interaction').length, 1, 'the container contains an interaction .qti-interaction');
                assert.equal($container.find('.qti-interaction.qti-mediaInteraction').length, 1, 'the container contains a choice interaction .qti-mediaInteraction');
                assert.equal($container.find('.qti-mediaInteraction .qti-prompt-container').length, 1, 'the interaction contains a prompt');
                assert.equal($container.find('.qti-mediaInteraction .instruction-container').length, 1, 'the interaction contains a instruction box');
                assert.equal($container.find('.qti-mediaInteraction video').length, 1, 'the interaction contains a video tag');
                assert.equal($container.find('.qti-mediaInteraction video source').length, 1, 'the interaction contains a video source tag');
                assert.equal($container.find('.qti-mediaInteraction video source').attr('src'), videoSampleUrl, 'the interaction has proper file attached');

                //check DOM data
                assert.equal($container.children('.qti-item').data('identifier'), 'i1429259831305858', 'the .qti-item node has the right identifier');

                QUnit.start();
            })
            .assets(function(url){
                if(/\.mp4$/.test(url.toString())){
                    return videoSampleUrl;
                }
                return url.toString();
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('audio renders correctly', function(assert){
        var $container;

        QUnit.expect(15);

        $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', audioItemData)
            .on('error', function(e){

                assert.ok(false, e);
                QUnit.start();
            })
            .on('render', function(){

                //check DOM
                assert.equal($container.children().length, 1, 'the container exists');
                assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                assert.equal($container.find('.qti-itemBody').length, 1, 'the container contains a the body element .qti-itemBody');
                assert.equal($container.find('.qti-interaction').length, 1, 'the container contains an interaction .qti-interaction');
                assert.equal($container.find('.qti-interaction.qti-mediaInteraction').length, 1, 'the container contains a choice interaction .qti-mediaInteraction');
                assert.equal($container.find('.qti-mediaInteraction .qti-prompt-container').length, 1, 'the interaction contains a prompt');
                assert.equal($container.find('.qti-mediaInteraction .instruction-container').length, 1, 'the interaction contains a instruction box');
                assert.equal($container.find('.qti-mediaInteraction audio').length, 1, 'the interaction contains an audio tag');
                assert.equal($container.find('.qti-mediaInteraction audio source').length, 1, 'the interaction contains an audio source tag');
                assert.equal($container.find('.qti-mediaInteraction audio source').attr('src'), audioSampleUrl, 'the interaction has proper file attached');
                assert.equal($container.find('.qti-mediaInteraction audio source').attr('type'), 'audio/mpeg', 'the interaction has proper file type');
                assert.equal($container.find('.qti-mediaInteraction .control [data-control=play]').length, 1, 'the interaction has a play button');

                //check DOM data
                assert.equal($container.children('.qti-item').data('identifier'), 'i1429259831305858', 'the .qti-item node has the right identifier');

                QUnit.start();
            })
            .assets(function(url){
                if(/\.mp3$/.test(url.toString())){
                    return audioSampleUrl;
                }
                return url.toString();
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('get state', function(assert){
        var $container;

        QUnit.expect(5);

        $container = $('#' + fixtureContainerId);

        assert.equal($container.find('.qti-mediaInteraction').length, 0, 'The media interaction is not yet rendered');

        runner = qtiItemRunner('qti', audioItemData)
            .on('init', function(){
                var state = this.getState();

                assert.deepEqual(state, {
                    "RESPONSE": {
                        response: {
                            base: {
                                integer: 0
                            }
                        },
                        player: {
                            position: 0,
                            muted: false,
                            volume: 100
                        }
                    }
                }, 'The default state is correct');
            })
            .on('render', function(){
                var self = this;
                var $mediaInteraction = $container.find('.qti-mediaInteraction');
                var $play = $('.control [data-control=play]', $mediaInteraction);

                assert.equal($mediaInteraction.length, 1, 'The mediaInteraction is rendered');
                assert.equal($play.length, 1, 'The play button is rendered');

                setTimeout(function(){
                    //the media player doesnt work properly in PhantomJS,
                    //so we just skip the test :
                    if($('.mediaplayer', $mediaInteraction).hasClass('error')){
                        assert.ok(true, 'Skipping');
                        QUnit.start();
                    } else {
                        $play.click();
                    }
                }, 250);

                setTimeout(function(){
                    var state = self.getState();
                    assert.ok(state.RESPONSE.player.position > 0, 'The player position has changed');

                    QUnit.start();
                }, 1000);
            })
            .on('error', function(err){
                assert.ok(false, err);
                QUnit.start();
            })
            .assets(function(url){
                if(/\.mp3$/.test(url.toString())){
                    return audioSampleUrl;
                }
                return url.toString();
            })
            .init()
            .render($container);
    });


    QUnit.asyncTest('set state', function(assert){
        var $container;

        QUnit.expect(3);

        $container = $('#' + fixtureContainerId);

        assert.equal($container.find('.qti-mediaInteraction').length, 0, 'The media interaction is not yet rendered');

        runner = qtiItemRunner('qti', audioItemData)
            .on('init', function(){
                var state = this.setState({
                    "RESPONSE": {
                        response: {
                            base: {
                                integer: 0
                            }
                        },
                        player: {
                            position: 1.1,
                            muted: false,
                            volume: 90
                        }
                    }
                });
            })
            .on('render', function(){
                var self = this;
                var $mediaInteraction = $container.find('.qti-mediaInteraction');
                assert.equal($mediaInteraction.length, 1, 'The mediaInteraction is rendered');

                setTimeout(function(){
                    var state = self.getState();

                    //the media player doesnt work properly in PhantomJS,
                    //so we just skip the test :
                    if($('.mediaplayer', $mediaInteraction).hasClass('error')){
                        assert.ok(true, 'Skipping');
                        QUnit.start();
                    } else {
                        assert.ok(state.RESPONSE.player.position > 0, 'The player position has changed');
                        QUnit.start();
                    }
                }, 250);
            })
            .on('error', function(err){
                assert.ok(false, err);
                QUnit.start();
            })
            .assets(function(url){
                if(/\.mp3$/.test(url.toString())){
                    return audioSampleUrl;
                }
                return url.toString();
            })
            .init()
            .render($container);
    });


    QUnit.module('Visual Test');

    QUnit.asyncTest('Display and play', function(assert){
        var $container;

        QUnit.expect(4);

        $container = $('#' + outsideContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', videoItemData)
            .on('render', function(){
                assert.equal($container.find('.qti-interaction.qti-mediaInteraction').length, 1, 'the container contains a choice interaction .qti-mediaInteraction');
                assert.equal($container.find('.qti-mediaInteraction video').length, 1, 'the interaction has element');

                QUnit.start();
            })
            .assets(function(url){
                if(/\.mp4$/.test(url.toString())){
                    return videoSampleUrl;
                }
                return url.toString();
            })
            .init()
            .render($container);
    });
});

