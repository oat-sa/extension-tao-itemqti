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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */
define(
    ['jquery', 'taoQtiItem/qtiCreator/editor/areaBroker'],
    function ($, areaBrokerFactory) {
        'use strict';

        const sharedStimulusAreas = [
            'menu',
            'menuLeft',
            'menuRight',
            'editorBar',
            'editorWrapper',
            'title',
            'toolbar',
            'interactionPanel',
            'itemPanel',
            'contentCreatorPanel',
            'propertyPanel',
            'itemPropertyPanel',
            'elementPropertyPanel',
            'itemStylePanel',
            'modalContainer'
        ];

        QUnit.module('qtiCreator/editor/areaBroker');

        QUnit.test(
            'accepts the shared stimulus area mapping',
            function (assert) {
                const $container = $('<div>');
                const mapping = {};

                sharedStimulusAreas.forEach(
                    function (area) {
                        mapping[area] = $('<div>');
                    }
                );

                const broker = areaBrokerFactory($container, mapping);

                assert.strictEqual(broker.getArea('itemCommentsPanel'), undefined, 'Comments remain an item-only area');
            }
        );
    }
);
