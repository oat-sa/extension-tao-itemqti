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
    'taoQtiItem/qtiCreator/editor/response/choiceSelector'
], function($, _, choiceSelector) {
    'use strict';

    var config = {
        renderTo: $('#fixture-1'),
        interaction : {
            choices: (function() {
                var i = 3,
                    _choices = {},
                    choice = { bdy: { bdy: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' }};
                while(i--){
                    choice.id = function() {return 'id- ' + i;};
                    _choices['c-' + i] = choice;
                }
                return _choices;
            }())
        },
        choices: [],
        titleLength: 20
    };


    QUnit.module('choiceSelector');


    QUnit.test('module', 3, function(assert) {
        assert.equal(typeof choiceSelector, 'function', "The choiceSelector module exposes a function");
        assert.equal(typeof choiceSelector(config), 'object', "The choiceSelector factory produces an object");
        assert.notStrictEqual(choiceSelector(config), choiceSelector(config), "The choiceSelector factory provides a different object on each call");
    });


    var testReviewApi = [
        { name : 'init', title : 'init' },
        { name : 'destroy', title : 'destroy' },
        { name : 'render', title : 'render' },
        { name : 'show', title : 'show' },
        { name : 'hide', title : 'hide' },
        { name : 'enable', title : 'enable' },
        { name : 'disable', title : 'disable' },
        { name : 'is', title : 'is' },
        { name : 'setState', title : 'setState' },
        { name : 'getElement', title : 'getElement' },
        { name : 'getContainer', title : 'getContainer' },
        { name: 'getSelectedChoices', title: 'getSelectedChoices'},
        { name: 'setSelectedChoices', title: 'setSelectedChoices'}
    ];

    QUnit
        .cases(testReviewApi)
        .test('instance API ', function(data, assert) {
            var instance = choiceSelector(config);
            assert.equal(typeof instance[data.name], 'function', 'The choiceSelector instance exposes a "' + data.title + '" function');
            instance.destroy();
        });


    QUnit.test('init', function(assert) {
        var instance = choiceSelector(config);

        assert.notEqual(instance.config, config, 'The choiceSelector instance must duplicate the config set');
        assert.equal(instance.hasOwnProperty('nothing'), false, 'The choiceSelector instance must not accept undefined config properties');
        assert.equal(instance.hasOwnProperty('dummy'), false, 'The choiceSelector instance must not accept null config properties');

        instance.destroy();
    });


    QUnit.test('render', function(assert) {
        var $container = $('#fixture-1');
        var instance;

        instance = choiceSelector(config);

        assert.equal(instance.is('rendered'), true, 'The choiceSelector instance must be rendered');
        assert.equal(typeof instance.getElement(), 'object', 'The choiceSelector instance returns the rendered content as an object');
        assert.equal(instance.getElement().length, 1, 'The choiceSelector instance returns the rendered content');
        assert.equal(instance.getElement().parent()[0], $container.get(0), 'The choiceSelector instance is rendered inside the right container');

        assert.equal(instance.getElement().find('option').length, _.size(config.interaction.choices), 'The choiceSelector instance has rendered its entries');

        instance.destroy();

        assert.equal($container.children().length, 0, 'The container is now empty');
        assert.equal(instance.getElement(), null, 'The choiceSelector instance has removed its rendered content');
    });


});
