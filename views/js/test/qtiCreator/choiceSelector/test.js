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
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiItem/qtiCreator/editor/response/choiceSelector',
    'json!taoQtiItem/test/samples/json/choice-feedback.json'
], function ($, _, qtiItemRunner, choiceSelector, itemData) {
    'use strict';


    var runner;
    var fixtureContainerId = 'item-container';
    var outsideContainerId = 'outside-container';


    var $container = $('#' + fixtureContainerId);

    module('Interaction', {
        teardown: function () {
            if (runner) {
                runner.clear();
            }
        }
    });


    QUnit.module('choiceSelector');


    var testReviewApi = [
        {name: 'init', title: 'init'},
        {name: 'destroy', title: 'destroy'},
        {name: 'render', title: 'render'},
        {name: 'show', title: 'show'},
        {name: 'hide', title: 'hide'},
        {name: 'enable', title: 'enable'},
        {name: 'disable', title: 'disable'},
        {name: 'is', title: 'is'},
        {name: 'setState', title: 'setState'},
        {name: 'getElement', title: 'getElement'},
        {name: 'getContainer', title: 'getContainer'},
        {name: 'getSelectedChoices', title: 'getSelectedChoices'},
        {name: 'setSelectedChoices', title: 'setSelectedChoices'}
    ];

    QUnit.cases(testReviewApi).asyncTest('module', function (data, assert) {

        var config = {
            renderTo: $('#' + outsideContainerId),
            choices: []
        };

        runner = qtiItemRunner('qti', itemData)
            .on('render', function () {

                //call destroy manually
                config.interaction = this._item.getInteractions()[0];
                var instance = choiceSelector(config);

                assert.equal(typeof instance[data.name], 'function', 'The choiceSelector instance exposes a "' + data.title + '" function');
                instance.destroy();

                QUnit.start();
            })
            .init()
            .render($container);
    });


    QUnit.asyncTest('init', function (assert) {

        var config = {
            renderTo: $('#' + outsideContainerId),
            choices: [],
            titleLength: 20,
            nothing: undefined,
            dummy: null
        };

        runner = qtiItemRunner('qti', itemData)
            .on('render', function () {

                //call destroy manually
                config.interaction = this._item.getInteractions()[0];
                var instance = choiceSelector(config);

                assert.notEqual(instance.config, config, 'The choiceSelector instance must duplicate the configuration');
                assert.equal(instance.hasOwnProperty('nothing'), false, 'The choiceSelector instance must not accept undefined config properties');
                assert.equal(instance.hasOwnProperty('dummy'), false, 'The choiceSelector instance must not accept null config properties');
                assert.equal(instance.config.titleLength, config.titleLength, 'Configuration values must override default values');

                instance.destroy();

                QUnit.start();

            })
            .init()
            .render($container);
    });




    QUnit.asyncTest('render', function (assert) {

        var config = {
            renderTo: $('#' + outsideContainerId),
            choices: []
        };

        runner = qtiItemRunner('qti', itemData)
            .on('render', function () {

                //call destroy manually
                config.interaction = this._item.getInteractions()[0];
                var instance = choiceSelector(config);
              //  var $select2Options;

              //  var $select2Select = $('.select2-input');
              //  $select2Select.trigger('click');

              //  $select2Options = $('.select2-result-selectable');
               // console.log($select2Options.last())
              // $('#select2-drop').trigger('click');
               // $select2Options.last().trigger('click');


                //console.log($select2Select, $select2Options)
              //  return;


                assert.notEqual(instance.config, config, 'The choiceSelector instance must duplicate the configuration');
                assert.equal(instance.hasOwnProperty('nothing'), false, 'The choiceSelector instance must not accept undefined config properties');

                instance.destroy();

                QUnit.start();

            })
            .init()
            .render($container);
    });

});
