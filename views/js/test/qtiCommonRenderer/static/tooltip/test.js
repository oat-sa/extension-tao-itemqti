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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'taoQtiItem/runner/qtiItemRunner',
    'json!taoQtiItem/test/samples/json/static/tooltip.json'
], function ($, qtiItemRunner, itemData) {
    'use strict';

    var runner;
    var fixtureContainerId = '#item-container';
    var outsideContainerId = '#outside-container';

    module('Order Interaction', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    QUnit.module('Tooltip renderer');

    QUnit.asyncTest('renders correctly', function(assert){
        var $container = $(fixtureContainerId);

        QUnit.expect(4);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function(){
                var $tooltips;

                assert.equal($container.children().length, 1, 'the container has an element');

                $tooltips = $container.find('[data-qti-class="_tooltip"]');

                assert.equal($tooltips.length, 4, '4 tooltips have been found');

                QUnit.start();
            })
            .init()
            .render($container);
    });


    QUnit.module('Visual test');

    QUnit.asyncTest('display and play', function(assert){
        var $container = $(outsideContainerId);

        QUnit.expect(3);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function(){
                assert.equal($container.children().length, 1, 'the container has an element');

                QUnit.start();
            })
            .init()
            .render($container);
    });

});