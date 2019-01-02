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
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiItem/qtiItem/core/Tooltip',
    'taoQtiItem/qtiCreator/helper/commonRenderer',
    'json!taoQtiItem/test/samples/json/static/tooltip.json',
    'ui/tooltip'
], function ($, _, qtiItemRunner, Tooltip, commonRenderer, itemData, tooltip) {
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

        QUnit.expect(16);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function(){
                var $allTooltips,
                    $tooltipContent,
                    $tooltip,
                    contentId;

                assert.equal($container.children().length, 1, 'the container has an element');

                $allTooltips = $container.find('[data-qti-class="_tooltip"]');

                assert.equal($allTooltips.length, 4, '4 tooltips have been found');

                $allTooltips.get(0).dispatchEvent(new Event('mouseenter'));
                $allTooltips.trigger('mouseenter');

                _.delay(function() {
                    $tooltip = $allTooltips.eq(0);
                    contentId = $tooltip.attr('aria-describedby');
                    $tooltipContent = $('#' + contentId);
                    assert.equal($tooltip.html().trim(), 'inline <i>interaction</i> container', 'tooltip 1 has the correct target');
                    assert.equal($tooltipContent.length, 1, 'tooltip 1 has a content');
                    assert.equal(
                        $tooltipContent.text().trim(),
                        'This is a container for inline choices and inline text entries.',
                        'tooltip content is correct'
                    );

                    $tooltip = $allTooltips.eq(1);
                    $tooltip.data('$tooltip').show();
                    contentId = $tooltip.attr('aria-describedby');
                    $tooltipContent = $('#' + contentId);
                    assert.equal($tooltip.html().trim(), 'tooltip', 'tooltip 2 has the correct target');
                    assert.equal($tooltipContent.length, 1, 'tooltip 2 has a content');
                    assert.equal(
                        $tooltipContent.text().trim(),
                        'Some say that the word "tooltip" does not really exist.',
                        'tooltip content is correct'
                    );

                    $tooltip = $allTooltips.eq(2);
                    $tooltip.data('$tooltip').show();
                    contentId = $tooltip.attr('aria-describedby');
                    $tooltipContent = $('#' + contentId);
                    assert.equal($tooltip.html().trim(), 'QTI <strong>prompt</strong>', 'tooltip 3 has the correct target');
                    assert.equal($tooltipContent.length, 1, 'tooltip 3 has a content');
                    assert.equal(
                        $tooltipContent.text().trim(),
                        'The text before the question.',
                        'tooltip content is correct'
                    );

                    $tooltip = $allTooltips.eq(3);
                    $tooltip.data('$tooltip').show();
                    contentId = $tooltip.attr('aria-describedby');
                    $tooltipContent = $('#' + contentId);
                    assert.equal($tooltip.html().trim(), '<i>strange</i> word', 'tooltip 4 has the correct target');
                    assert.equal($tooltipContent.length, 1, 'tooltip 4 has a content');
                    assert.equal(
                        $tooltipContent.text().trim(),
                        'But it will not be revealed here.',
                        'tooltip content is correct'
                    );

                    QUnit.start();
                }, 200);

            })
            .on('error', function(err) {
                window.console.log(err);
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
            .on('error', function(err) {
                window.console.log(err);
            })
            .init()
            .render($container);
    });

});