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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */

define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/static/helpers/itemScrollingMethods'
], function ($, itemScrollingMethods) {
    'use strict';

    QUnit.module('qtiCreator/widgets/static/helpers/itemScrollingMethods');

    function createForm(itemWritingMode) {
        return $(
            `
            <div>
                <label><input type="radio" name="writingModeItem" value="horizontal" ${itemWritingMode === 'horizontal' ? 'checked="checked"' : ''} /></label>
                <label><input type="radio" name="writingModeItem" value="vertical" ${itemWritingMode === 'vertical' ? 'checked="checked"' : ''} /></label>
                <div class="panel scrollingSelect">
                    <select>
                        <option value="100">100</option>
                        <option value="75">75</option>
                        <option value="50" selected="selected">50</option>
                    </select>
                </div>
                <div class="panel scrollingSelect dw-depended dw-height" style="display:none;"></div>
                <div class="panel scrollingSelect dw-depended dw-width" style="display:none;"></div>
            </div>
        `.trim()
        );
    }

    QUnit.test('text wrapper scrolling behavior remains unchanged', function (assert) {
        assert.expect(7);

        const $fixture = $('#qunit-fixture').empty();
        const $form = createForm('horizontal');
        const $container = $('<div><div data-html-editable><div class="qti-block">Text</div></div></div>');
        const widget = {
            $form,
            $container
        };

        $fixture.append($form);
        $fixture.append($container);

        itemScrollingMethods.wrapContent(widget, true);

        const $wrapper = $container.children('[data-html-editable]').children('.custom-text-box');

        assert.strictEqual($wrapper.length, 1, 'text content is wrapped once');
        assert.strictEqual($wrapper.attr('data-scrolling'), 'true', 'wrapper stores scrolling flag');
        assert.strictEqual($wrapper.attr('data-scrolling-height'), '50', 'wrapper stores selected height');
        assert.ok($wrapper.hasClass('key-navigation-focusable'), 'wrapper remains keyboard focusable');
        assert.ok($wrapper.hasClass('tao-overflow-y'), 'wrapper keeps existing vertical overflow utility class');
        assert.ok($wrapper.hasClass('tao-half-height'), 'wrapper keeps existing size utility class');
        assert.strictEqual($form.attr('data-scrolling'), 'true', 'form state remains in sync');
    });

    QUnit.test('toggleScrollingSelect hides all scrolling controls when scrolling is disabled', function (assert) {
        assert.expect(3);

        const $fixture = $('#qunit-fixture').empty();
        const $form = createForm('horizontal');
        $fixture.append($form);

        itemScrollingMethods.toggleScrollingSelect($form, false);

        assert.strictEqual($form.find('.scrollingSelect').filter(':visible').length, 0, 'all scrolling selects are hidden');
        assert.strictEqual($form.find('.dw-height').is(':visible'), false, 'height-specific control stays hidden');
        assert.strictEqual($form.find('.dw-width').is(':visible'), false, 'width-specific control stays hidden');
    });

    QUnit.test('toggleScrollingSelect shows height control for horizontal items', function (assert) {
        assert.expect(3);

        const $fixture = $('#qunit-fixture').empty();
        const $form = createForm('horizontal');
        $fixture.append($form);

        itemScrollingMethods.toggleScrollingSelect($form, true);

        assert.ok($form.find('.scrollingSelect').is(':visible'), 'scrolling controls are shown');
        assert.strictEqual($form.find('.dw-height').is(':visible'), true, 'height-specific control is shown');
        assert.strictEqual($form.find('.dw-width').is(':visible'), false, 'width-specific control remains hidden');
    });

    QUnit.test('toggleScrollingSelect shows width control for vertical items', function (assert) {
        assert.expect(3);

        const $fixture = $('#qunit-fixture').empty();
        const $form = createForm('vertical');
        $fixture.append($form);

        itemScrollingMethods.toggleScrollingSelect($form, true);

        assert.ok($form.find('.scrollingSelect').is(':visible'), 'scrolling controls are shown');
        assert.strictEqual($form.find('.dw-width').is(':visible'), true, 'width-specific control is shown');
        assert.strictEqual($form.find('.dw-height').is(':visible'), false, 'height-specific control remains hidden');
    });
});
