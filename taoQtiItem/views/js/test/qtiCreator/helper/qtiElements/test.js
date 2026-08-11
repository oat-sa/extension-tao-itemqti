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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define(['taoQtiItem/qtiCreator/helper/qtiElements'], function (qtiElements) {
    'use strict';

    QUnit.module('API');

    QUnit.cases.init([{ title: 'isVisible' }]).test('helper API ', (data, assert) => {
        assert.expect(1);
        assert.equal(typeof qtiElements[data.title], 'function', `The instance exposes a "${data.title}" function`);
    });

    QUnit.module('Behavior');

    QUnit.cases
        .init([
            { title: 'endAttemptInteraction', visible: false },
            { title: 'choiceInteraction', visible: true },
            { title: 'associateInteraction', visible: true },
            { title: 'graphicGapMatchInteraction', visible: true },
            { title: 'notAnInteraction', visible: true }
        ])
        .test('is interaction visible ', (data, assert) => {
            assert.expect(1);

            assert.equal(
                qtiElements.isVisible(data.title),
                data.visible,
                `${data.title} ${data.visible ? 'is' : 'is not'} visible`
            );
        });
});
