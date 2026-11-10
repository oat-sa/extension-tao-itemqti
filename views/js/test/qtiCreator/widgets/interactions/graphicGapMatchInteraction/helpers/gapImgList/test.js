/*
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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 *
 */

define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/interactions/graphicGapMatchInteraction/helpers/gapImgList'
], function ($, gapImgList) {
    'use strict';

    function setup() {
        return $(
            '<ul class="source">' +
                '<li class="qti-choice qti-gapImg" data-serial="s1">' +
                '<img src="old.png" width="10" height="5"/>' +
                '</li>' +
                '</ul>'
        ).appendTo('#qunit-fixture');
    }

    function createGapImg() {
        return {
            render: function () {
                return (
                    '<li class="qti-choice qti-gapImg" data-serial="s1">' +
                    '<img src="' +
                    this.src +
                    '" width="' +
                    this.width +
                    '" height="' +
                    this.height +
                    '"/>' +
                    '</li>'
                );
            },
            src: 'old.png',
            width: 10,
            height: 5
        };
    }

    QUnit.module('gapImgList');

    QUnit.test('refreshThumbnail replaces the picture', function (assert) {
        const $list = setup();
        const $gapImgBox = $list.find('li');
        const gapImg = createGapImg();

        gapImg.src = 'new.png';
        gapImg.width = 20;
        gapImg.height = 15;

        assert.strictEqual(gapImgList.refreshThumbnail($gapImgBox, gapImg), true, 'returns true');

        const $img = $gapImgBox.find('img');
        assert.strictEqual($img.attr('src'), 'new.png', 'updates the image source');
        assert.strictEqual($img.attr('width'), '20', 'updates the image width');
        assert.strictEqual($img.attr('height'), '15', 'updates the image height');
        assert.strictEqual($list.find('li').get(0), $gapImgBox.get(0), 'keeps the same list item node');
        assert.strictEqual($gapImgBox.find('img').length, 1, 'keeps a single image');
    });

    QUnit.test('refreshThumbnail keeps the rest of the choice', function (assert) {
        const $list = setup();
        const $gapImgBox = $list.find('li');
        const gapImg = createGapImg();

        $gapImgBox.append('<span class="mini-tlb"></span>').addClass('active');
        gapImg.src = 'new.png';

        assert.strictEqual(gapImgList.refreshThumbnail($gapImgBox, gapImg), true, 'returns true');
        assert.strictEqual($gapImgBox.find('.mini-tlb').length, 1, 'keeps the delete toolbar');
        assert.strictEqual($gapImgBox.hasClass('active'), true, 'keeps the active state');
    });

    QUnit.test('refreshThumbnail returns false and leaves the DOM untouched without a picture', function (assert) {
        const $list = setup();
        const $gapImgBox = $list.find('li');
        const $originalImg = $gapImgBox.find('img');
        const gapImg = createGapImg();
        const originalHtml = $gapImgBox.html();

        gapImg.render = function () {
            return '<li class="qti-choice qti-gapImg" data-serial="s1"></li>';
        };

        assert.strictEqual(gapImgList.refreshThumbnail($gapImgBox, gapImg), false, 'returns false without a picture');
        assert.strictEqual($gapImgBox.find('img').get(0), $originalImg.get(0), 'keeps the original picture');
        assert.strictEqual($gapImgBox.html(), originalHtml, 'leaves the DOM untouched');

        assert.strictEqual(gapImgList.refreshThumbnail($(), createGapImg()), false, 'returns false for an empty box');
        assert.strictEqual($gapImgBox.html(), originalHtml, 'still leaves the DOM untouched');
    });

    QUnit.test('ensureToolbar appends the toolbar only once', function (assert) {
        const $list = setup();
        const $gapImgBox = $list.find('li');

        assert.strictEqual(
            gapImgList.ensureToolbar($gapImgBox, $('<span class="mini-tlb"></span>')),
            true,
            'appends the toolbar on the first call'
        );
        assert.strictEqual($gapImgBox.find('.mini-tlb').length, 1, 'has exactly one toolbar');

        assert.strictEqual(
            gapImgList.ensureToolbar($gapImgBox, $('<span class="mini-tlb"></span>')),
            false,
            'does not append the toolbar on the second call'
        );
        assert.strictEqual($gapImgBox.find('.mini-tlb').length, 1, 'still has exactly one toolbar');

        assert.strictEqual(
            gapImgList.ensureToolbar($gapImgBox, $('<span class="mini-tlb"></span>')),
            false,
            'does not append the toolbar on the third call'
        );
        assert.strictEqual($gapImgBox.find('.mini-tlb').length, 1, 'keeps exactly one toolbar');
    });

    QUnit.test('initWhenLoaded does not accumulate handlers', function (assert) {
        const $list = setup();
        const img = $list.find('img').get(0);
        let calls = 0;
        const init = function () {
            calls++;
        };

        Object.defineProperty(img, 'complete', { value: false, configurable: true });

        assert.strictEqual(gapImgList.initWhenLoaded($(img), init), false, 'waits for the load event');
        assert.strictEqual(gapImgList.initWhenLoaded($(img), init), false, 'waits again for the load event');

        $(img).trigger('load');

        assert.strictEqual(calls, 1, 'runs the callback exactly once');
    });

    QUnit.test('initWhenLoaded calls the callback synchronously when the image is complete', function (assert) {
        const $list = setup();
        const img = $list.find('img').get(0);
        let calls = 0;
        const init = function () {
            calls++;
        };

        Object.defineProperty(img, 'complete', { value: true, configurable: true });

        assert.strictEqual(gapImgList.initWhenLoaded($(img), init), true, 'returns true when called synchronously');
        assert.strictEqual(calls, 1, 'runs the callback once');
        assert.strictEqual(gapImgList.initWhenLoaded($(), init), false, 'returns false without a DOM node');
        assert.strictEqual(calls, 1, 'does not run the callback without a DOM node');
    });
});
