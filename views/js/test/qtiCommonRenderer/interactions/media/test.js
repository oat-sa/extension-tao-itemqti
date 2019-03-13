define([

    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'json!taoQtiItem/test/samples/json/media/video.json',
    'json!taoQtiItem/test/samples/json/media/audio.json'
], function($, _, qtiItemRunner, videoItemData, audioItemData) {
    'use strict';


    var isHeadless = /(PhantomJS|HeadlessChrome)/.test(navigator.userAgent);
    var videoSampleUrl = '../../../taoQtiItem/views/js/test/samples/json/media/sample.mp4';
    var audioSampleUrl = '../../../taoQtiItem/views/js/test/samples/json/media/sample.mp3';

    QUnit.module('Media Interaction');

    QUnit.test('video renders correctly', function(assert) {
        var ready = assert.async();
        var $container;
        var runner;

        assert.expect(13);

        $container = $('#item-container-video');

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        $container.one('playerrendered', function() {

            //Check DOM
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

            //Check DOM data
            assert.equal($container.children('.qti-item').data('identifier'), 'i1429259831305858', 'the .qti-item node has the right identifier');
            runner.clear();

            ready();
        });
        runner = qtiItemRunner('qti', videoItemData)
            .on('error', function(e) {

                assert.ok(false, e);
                ready();
            })
            .assets(function(url) {
                if (/\.mp4$/.test(url.toString())) {
                    return videoSampleUrl;
                }
                return url.toString();
            })
            .init()
            .render($container);
    });

    QUnit.test('audio renders correctly', function(assert) {
        var ready = assert.async();
        var $container;
        var runner;

        assert.expect(15);

        $container = $('#item-container-audio');

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        $container.one('playerrendered', function() {

            //Check DOM
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

            //Check DOM data
            assert.equal($container.children('.qti-item').data('identifier'), 'i1429259831305858', 'the .qti-item node has the right identifier');
            runner.clear();
            ready();
        });

        runner = qtiItemRunner('qti', audioItemData)
            .on('error', function(e) {

                assert.ok(false, e);
                ready();
            })
            .assets(function(url) {
                if (/\.mp3$/.test(url.toString())) {
                    return audioSampleUrl;
                }
                return url.toString();
            })
            .init()
            .render($container);
    });

    QUnit.test('get state', function(assert) {
        var ready = assert.async();
        var $container;
        var runner;

        assert.expect(5);

        $container = $('#item-container-getstate');

        assert.equal($container.find('.qti-mediaInteraction').length, 0, 'The media interaction is not yet rendered');

        $container.one('playerrendered', function() {
            var $mediaInteraction = $container.find('.qti-mediaInteraction');
            var $play = $('.control [data-control=play]', $mediaInteraction);
            var toState = setTimeout(function() {
                var state = runner.getState();
                assert.ok(state.RESPONSE.player.position > 0, 'The player position has changed');
                runner.clear();
                ready();
            }, 1000);

            assert.equal($mediaInteraction.length, 1, 'The mediaInteraction is rendered');
            assert.equal($play.length, 1, 'The play button is rendered');

            setTimeout(function() {

                //The media player doesnt work properly in PhantomJS,
                //so we just skip the test :
                if ($('.mediaplayer', $mediaInteraction).hasClass('error')) {
                    assert.ok(true, 'Skipping');
                    clearTimeout(toState);

                    ready();
                } else {
                    $play.click();
                }
            }, 250);
        });
        if(runner){
            runner.clear();
        }
        runner = qtiItemRunner('qti', audioItemData)
            .on('init', function() {
                var state = this.getState();

                assert.deepEqual(state, {
                    'RESPONSE': {
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
            .on('error', function(err) {
                assert.ok(false, err);
                ready();
            })
            .assets(function(url) {
                if (/\.mp3$/.test(url.toString())) {
                    return audioSampleUrl;
                }
                return url.toString();
            })
            .init()
            .render($container);
    });
    //

    //
    if (!isHeadless){
        QUnit.test('set state', function(assert) {
            var ready = assert.async();
            var $container;
            var runner;

            assert.expect(3);

            $container = $('#item-container-setstate');

            assert.equal($container.find('.qti-mediaInteraction').length, 0, 'The media interaction is not yet rendered');

            $container.on('playerrendered', function() {
                var $mediaInteraction = $container.find('.qti-mediaInteraction');
                assert.equal($mediaInteraction.length, 1, 'The mediaInteraction is rendered');
                if ($('.mediaplayer', $mediaInteraction).hasClass('error') || isHeadless) {
                    assert.ok(true, 'Skipping');
                }else{

                    setTimeout(function() {
                        var state = runner.getState();

                        //The media player doesnt work properly in PhantomJS,
                        //so we just skip the test :
                        if ($('.mediaplayer', $mediaInteraction).hasClass('error') || isHeadless) {
                            assert.ok(true, 'Skipping');
                        } else {
                            assert.ok(state.RESPONSE.player.position > 0, 'The player position has changed');
                        }
                        $container.off('playerrendered');
                        runner.clear();
                        ready();
                    }, 250);
                }
            });


            runner = qtiItemRunner('qti', audioItemData)
                .on('init', function() {
                    this.setState({
                        'RESPONSE': {
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
                .on('error', function(err) {
                    assert.ok(false, err);
                    ready();
                })
                .assets(function(url) {
                    if (/\.mp3$/.test(url.toString())) {
                        return audioSampleUrl;
                    }
                    return url.toString();
                })
                .init()
                .render($container);
        });
        QUnit.module('Visual Test');
        QUnit.test('Display and play', function(assert) {
            var ready = assert.async();
            var $container;
            var runner;

            assert.expect(4);

            $container = $('#visual-test');

            assert.equal($container.length, 1, 'the item container exists');
            assert.equal($container.children().length, 0, 'the container has no children');
            $container.off('playerrendered');

            $container.one('playerrendered', function() {
                assert.equal($container.find('.qti-interaction.qti-mediaInteraction').length, 1, 'the container contains a choice interaction .qti-mediaInteraction');
                assert.equal($container.find('.qti-mediaInteraction video').length, 1, 'the interaction has element');

                ready();
            });
            runner = qtiItemRunner('qti', videoItemData)
                .assets(function(url) {
                    if (/\.mp4$/.test(url.toString())) {
                        return videoSampleUrl;
                    }
                    return url.toString();
                })
                .init()
                .render($container);
        });
    }

});

