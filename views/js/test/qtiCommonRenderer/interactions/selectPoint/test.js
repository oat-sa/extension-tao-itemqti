/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */

define([
    'jquery',
    'core/mouseEvent',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/SelectPointInteraction',
    'json!taoQtiItem/test/qtiCommonRenderer/interactions/selectPoint/qti.json'
], function($, triggerMouseEvent, qtiItemRunner, selectPointRenderer, selectPointData) {
    'use strict';

    var runner;
    var fixtureContainerId = 'item-container';
    var outsideContainerId = 'outside-container';

    //override asset loading in order to resolve it from the runtime location
    var strategies = [{
        name : 'default',
        handle : function defaultStrategy(url) {
            if (/assets/.test(url.toString())) {
                return '../../taoQtiItem/views/js/test/qtiCommonRenderer/interactions/selectPoint/' + url.toString();
            }
            return url.toString();
        }
    }];

    QUnit.module('Renderer API');

    QUnit.test('QTI class', function(assert){
        QUnit.expect(2);

        assert.equal(typeof selectPointRenderer, 'object', 'The renderer is an object');
        assert.equal(selectPointRenderer.qtiClass, 'selectPointInteraction', 'The renderer class is correct');
    });

    QUnit
        .cases([
            { name : 'template', title : 'template' },
            { name : 'render' , title : 'render' },
            { name : 'getContainer' ,  title : 'getContainer' },
            { name : 'setResponse', title : 'setResponse' },
            { name : 'getResponse', title :  'getResponse' },
            { name : 'resetResponse', title : 'resetResponse' },
            { name : 'destroy', title : 'destroy' },
            { name : 'setState', title : 'setState' },
            { name : 'getState', title : 'getState' }
        ])
        .test('expose method', function(data, assert){
            assert.equal(typeof selectPointRenderer[data.name], 'function', 'The selectPointRenderer exposes the method ' + data.name);
        });


    QUnit.module('Select Point Interaction', {
        teardown : function() {
            if (runner) {
                runner.clear();
            }
        }
    });

    QUnit.asyncTest('renders correctly', function(assert) {
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(11);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', selectPointData)
            .on('render', function() {

                //check DOM
                assert.equal($container.children().length, 1, 'the container a elements');
                assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                assert.equal($container.find('.qti-itemBody').length, 1, 'the container contains a the body element .qti-itemBody');
                assert.equal($container.find('.qti-interaction').length, 1, 'the container contains an interaction .qti-interaction');
                assert.equal($container.find('.qti-interaction.qti-selectPointInteraction').length, 1, 'the container contains a choice interaction .qti-selectPointInteraction');
                assert.equal($container.find('.qti-selectPointInteraction .qti-prompt-container').length, 1, 'the interaction contains a prompt');
                assert.equal($container.find('.qti-selectPointInteraction .instruction-container').length, 1, 'the interaction contains a instruction box');
                assert.equal($container.find('.qti-selectPointInteraction .main-image-box').length, 1, 'the interaction contains a image');

                //check DOM data
                assert.equal($container.children('.qti-item').data('identifier'), 'i14862478187486450', 'the .qti-item node has the right identifier');

                QUnit.start();
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('destroys', function(assert) {
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(3);
        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', selectPointData)
            .on('render', function() {

                var interaction = this._item.getInteractions()[0];
                var $imageBox = $('.main-image-box', $container);

                assert.equal($imageBox.children().length, 1, 'the image box has elements');
                interaction.renderer.destroy(interaction);
                assert.equal($imageBox.children().length, 0, 'the image box has no elements');

                QUnit.start();
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('resets the response', function(assert) {
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(3);

        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', selectPointData)
            .on('render', function() {
                var interaction = this._item.getInteractions()[0];
                var $canvas = $('.main-image-box svg', $container);

                triggerMouseEvent($canvas.find('image').get(0), 'click', { bubbles: true });

                setTimeout(function() {
                    var $target;

                    $target = $canvas.find('path');
                    assert.equal($target.length, 1, 'a target exists on image');

                    interaction.renderer.resetResponse(interaction);

                    $target = $canvas.find('path');
                    assert.equal($target.length, 0, 'no target exists on image');

                    QUnit.start();
                }, 50);
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('clicking target removes it from interaction', function(assert) {
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(2);

        runner = qtiItemRunner('qti', selectPointData)
            .on('render', function() {
                var $canvas     = $('.main-image-box svg', $container);

                triggerMouseEvent($canvas.find('image').get(0), 'click', { bubbles: true });

                setTimeout(function() {
                    var $target;

                    $target = $canvas.find('path');
                    assert.equal($target.length, 1, 'click placed target on image');

                    triggerMouseEvent($canvas.find('rect').get(0), 'click', { bubbles: true });

                    setTimeout(function() {
                        $target = $canvas.find('path');
                        assert.equal($target.length, 0, 'another click removed target from image');

                        QUnit.start();
                    }, 50);
                }, 50);
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('set the response', function(assert) {
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(2);

        runner = qtiItemRunner('qti', selectPointData)
            .on('render', function() {
                var interaction = this._item.getInteractions()[0];
                var $canvas     = $('.main-image-box svg', $container);

                assert.equal($('path', $canvas).length, 0, 'There is no target');

                interaction.renderer.setResponse(interaction, { list : { point : [ [50,50] ] } });
                setTimeout(function(){
                    assert.equal($('path', $canvas).length, 1, 'A target have been created');
                    QUnit.start();
                }, 50);

            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.asyncTest('set multiple responses', function(assert) {
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(2);

        runner = qtiItemRunner('qti', selectPointData)
            .on('render', function() {
                var interaction = this._item.getInteractions()[0];
                var $canvas     = $('.main-image-box svg', $container);

                assert.equal($('path', $canvas).length, 0, 'There is no target');

                interaction.renderer.setResponse(interaction, { list : { point : [ [50,50], [100, 100] ] } });
                setTimeout(function(){
                    assert.equal($('path', $canvas).length, 2, 'Two targets have been created');
                    QUnit.start();
                }, 50);

            })
            .assets(strategies)
            .init()
            .render($container);
    });

    QUnit.module('Visual Test');

    QUnit.asyncTest('Display and play', function(assert) {
        var $container = $('#' + outsideContainerId);

        QUnit.expect(1);

        assert.equal($container.length, 1, 'the item container exists');

        qtiItemRunner('qti', selectPointData)
            .on('render', function() {
                QUnit.start();
            })
            .on('statechange', function(state) {
                document.getElementById('response-display').textContent = JSON.stringify(state);
            })
            .assets(strategies)
            .init()
            .render($container);
    });
});

