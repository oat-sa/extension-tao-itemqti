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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2014-2026 (original work) Open Assessment Technologies SA;
 */

define(['jquery', 'taoQtiItem/qtiCreator/widgets/static/helpers/itemScrollingMethods'], function (
    $,
    itemScrollingMethods
) {
    'use strict';

    QUnit.module('itemScrollingMethods');

    QUnit.test(
        'getTplVars returns scrollingHeights/options and scrollingWidths/optionsVerticalDirectionWriting',
        function (assert) {
            const vars = itemScrollingMethods.getTplVars();

            assert.ok(vars, 'tpl vars returned');
            assert.deepEqual(
                vars.scrollingHeights,
                itemScrollingMethods.options(),
                'scrollingHeights come from options()'
            );
            assert.deepEqual(
                vars.scrollingWidths,
                itemScrollingMethods.optionsVertical(),
                'scrollingWidths come from optionsVertical()'
            );
        }
    );

    QUnit.test('generateChangeCallback: scrolling calls wrapContent with widget/value/type', function (assert) {
        const widget = { $form: $('<form>') };
        const $form = widget.$form;

        const originalWrapContent = itemScrollingMethods.wrapContent;
        const calls = [];
        itemScrollingMethods.wrapContent = function (w, value, wrapType) {
            calls.push({ w, value, wrapType });
        };

        const cb = itemScrollingMethods.generateChangeCallback(widget, () => null, $form, 'inner');
        cb.scrolling(null, 'true');

        assert.equal(calls.length, 1, 'wrapContent called once');
        assert.strictEqual(calls[0].w, widget, 'wrapContent receives widget');
        assert.equal(calls[0].value, 'true', 'wrapContent receives value');
        assert.equal(calls[0].wrapType, 'inner', 'wrapContent receives scrollingType');

        itemScrollingMethods.wrapContent = originalWrapContent;
    });

    QUnit.test(
        'generateChangeCallback: scrollingHeight/scrollingWidth use wrapCallback and pass wrapped value to setters',
        function (assert) {
            const widget = { $form: $('<form>') };
            const $form = widget.$form;

            const $height = $('<select name="scrollingHeight"><option value="50">50</option></select>');
            const $width = $('<select name="scrollingWidth"><option value="50">50</option></select>');
            $form.append($height, $width);

            const wrapperA = $('<div>');
            const wrapperB = $('<div>');
            let wrapCallbackReturnsB = false;
            const wrapCallback = () => (wrapCallbackReturnsB ? wrapperB : wrapperA);

            const originalSetHeight = itemScrollingMethods.setScrollingHeight;
            const originalSetWeight = itemScrollingMethods.setScrollingWeight;

            const heightCalls = [];
            const widthCalls = [];

            itemScrollingMethods.setScrollingHeight = function ($wrapper, value, $f) {
                heightCalls.push({ $wrapper, value, $f });
            };
            itemScrollingMethods.setScrollingWeight = function ($wrapper, value, $f) {
                widthCalls.push({ $wrapper, value, $f });
            };

            const cb = itemScrollingMethods.generateChangeCallback(widget, wrapCallback, $form, 'inner');

            cb.scrollingHeight(null, '50');
            wrapCallbackReturnsB = true;
            cb.scrollingWidth(null, '50');

            assert.equal(heightCalls.length, 1, 'setScrollingHeight called once');
            assert.strictEqual(heightCalls[0].$wrapper, wrapperA, 'setScrollingHeight uses wrapped element (A)');
            assert.equal(heightCalls[0].value, '50', 'setScrollingHeight passes value');
            assert.strictEqual(heightCalls[0].$f, $form, 'setScrollingHeight passes $form');

            assert.equal(widthCalls.length, 1, 'setScrollingWeight called once');
            assert.strictEqual(widthCalls[0].$wrapper, wrapperB, 'setScrollingWeight uses wrapped element (B)');
            assert.equal(widthCalls[0].value, '50', 'setScrollingWeight passes value');
            assert.strictEqual(widthCalls[0].$f, $form, 'setScrollingWeight passes $form');

            itemScrollingMethods.setScrollingHeight = originalSetHeight;
            itemScrollingMethods.setScrollingWeight = originalSetWeight;
        }
    );

    QUnit.test(
        'setScrollingHeight updates wrapper attribute/classes and syncs scrollingWidth selector',
        function (assert) {
            const $form = $('<form>');
            const $width = $(
                '<select name="scrollingWidth"><option value="50">50</option><option value="75">75</option></select>'
            );
            $form.append($width);

            const $wrapper = $('<div class="tao-quarter-height tao-third-height">');
            $width.val('75');

            itemScrollingMethods.setScrollingHeight($wrapper, '50', $form);

            assert.equal($wrapper.attr('data-scrolling-height'), '50', 'wrapper data-scrolling-height set');
            assert.ok($wrapper.hasClass('tao-half-height'), 'wrapper class for selected height added');
            assert.equal($width.val(), '50', 'scrollingWidth synced to same value');
        }
    );

    QUnit.test(
        'setScrollingWeight updates wrapper attribute/classes and syncs scrollingHeight selector',
        function (assert) {
            const $form = $('<form>');
            const $height = $(
                '<select name="scrollingHeight"><option value="50">50</option><option value="75">75</option></select>'
            );
            $form.append($height);

            const $wrapper = $('<div class="tao-quarter-height tao-third-height">');
            $height.val('75');

            itemScrollingMethods.setScrollingWeight($wrapper, '50', $form);

            assert.equal(
                $wrapper.attr('data-scrolling-height'),
                '50',
                'wrapper data-scrolling-height set (weight setter uses same attr)'
            );
            assert.ok($wrapper.hasClass('tao-half-height'), 'wrapper class for selected value added');
            assert.equal($height.val(), '50', 'scrollingHeight synced to same value');
        }
    );

    QUnit.test('setScrollingHeight throws on invalid value (failure scenario)', function (assert) {
        const $form = $('<form>');
        const $wrapper = $('<div>');

        assert.throws(
            () => itemScrollingMethods.setScrollingHeight($wrapper, '__invalid__', $form),
            /class|undefined|Cannot/,
            'invalid value should fail (matches existing behavior)'
        );
    });

    QUnit.test('setScrollingWeight throws on invalid value (failure scenario)', function (assert) {
        const $form = $('<form>');
        const $wrapper = $('<div>');

        assert.throws(
            () => itemScrollingMethods.setScrollingWeight($wrapper, '__invalid__', $form),
            /class|undefined|Cannot/,
            'invalid value should fail (matches existing behavior)'
        );
    });

    QUnit.test(
        'setScrollingHeight/setScrollingWeight keep selectors synchronized even when wrapCallback returns different wrappers',
        function (assert) {
            const $form = $('<form>');
            const $height = $(
                '<select name="scrollingHeight"><option value="50">50</option><option value="75">75</option></select>'
            );
            const $width = $(
                '<select name="scrollingWidth"><option value="50">50</option><option value="75">75</option></select>'
            );
            $form.append($height, $width);

            const wrapperA = $('<div>');
            const wrapperB = $('<div>');

            const cb = itemScrollingMethods.generateChangeCallback({ $form }, () => wrapperA, $form, 'inner');

            // first update height on wrapperA
            $width.val('75');
            cb.scrollingHeight(null, '50');
            assert.equal($width.val(), '50', 'scrollingWidth updated when scrollingHeight changes (sync)');

            // then update width on wrapperB via a different wrapCallback
            const cb2 = itemScrollingMethods.generateChangeCallback({ $form }, () => wrapperB, $form, 'inner');
            $height.val('75');
            cb2.scrollingWidth(null, '50');
            assert.equal($height.val(), '50', 'scrollingHeight updated when scrollingWidth changes (sync)');
        }
    );
});
