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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA ;
 */
define(['taoQtiItem/qtiCreator/widgets/helpers/stringResponse'], function (stringResponseHelper) {
    'use strict';

    function responseDeclarationMock(value) {
        let correct = [];

        const responseDeclaration = {
            getCorrect() {
                if (correct) {
                    return correct;
                }

                return {};
            },

            setCorrect(response) {
                if (Array.isArray(response) || 'object' === typeof response) {
                    correct = response;
                } else if (response) {
                    correct = [response];
                } else {
                    correct = [];
                }
            },

            resetCorrect() {
                correct = null;
            }
        };

        responseDeclaration.setCorrect(value);

        return responseDeclaration;
    }

    QUnit.module('stringResponse');

    QUnit.test('module', assert => {
        assert.equal(typeof stringResponseHelper, 'object', 'The module exposes an object');
        assert.equal(
            typeof stringResponseHelper.getCorrectResponse,
            'function',
            'The helper has a getCorrectResponse function'
        );
        assert.equal(
            typeof stringResponseHelper.setCorrectResponse,
            'function',
            'The helper has a setCorrectResponse function'
        );
        assert.equal(
            typeof stringResponseHelper.rewriteCorrectResponse,
            'function',
            'The helper has a rewriteCorrectResponse function'
        );
    });

    QUnit.cases
        .init([
            { title: '', expected: '' },
            { title: ['42'], expected: '42' },
            { title: { string: '42' }, expected: '42' },
            { title: '42', expected: '42' },
            { title: '4.2', expected: '4.2' },
            { title: '４２', expected: '42' },
            { title: '４.２', expected: '4.2' },
            { title: '4２', expected: '42' },
            { title: '４2', expected: '42' },
            { title: 'this is a test', expected: 'this is a test' }
        ])
        .test('get correct response ', (data, assert) => {
            const response = responseDeclarationMock(data.title);
            assert.equal(
                stringResponseHelper.getCorrectResponse(response),
                data.expected,
                `Got correct response from "${data.title}" to ${data.expected}`
            );
        });

    QUnit.cases
        .init([
            { title: '', expected: '' },
            { title: '42', expected: '42' },
            { title: '4.2', expected: '4.2' },
            { title: '４２', expected: '42' },
            { title: '４.２', expected: '4.2' },
            { title: '4２', expected: '42' },
            { title: '４2', expected: '42' },
            { title: 'this is a test', expected: 'this is a test' }
        ])
        .test('set correct response ', (data, assert) => {
            const response = responseDeclarationMock();
            stringResponseHelper.setCorrectResponse(response, data.title);
            assert.equal(
                stringResponseHelper.getCorrectResponse(response),
                data.expected,
                `Got correct response from "${data.title}" to ${data.expected}`
            );
        });

    QUnit.cases
        .init([
            { title: '', expected: '' },
            { title: ' 42 ', expected: '42' },
            { title: ' ４２ ', expected: '42' },
            { title: ' this is a test ', expected: 'this is a test' }
        ])
        .test('trim correct response ', (data, assert) => {
            const response = responseDeclarationMock();
            stringResponseHelper.setCorrectResponse(response, data.title, { trim: true });
            assert.equal(
                stringResponseHelper.getCorrectResponse(response),
                data.expected,
                `Got correct response from "${data.title}" to ${data.expected}`
            );
        });

    QUnit.cases
        .init([
            { title: '', expected: '' },
            { title: '42', expected: '42' },
            { title: '4.2', expected: '4.2' },
            { title: '４２', expected: '42' },
            { title: '４.２', expected: '4.2' },
            { title: '4２', expected: '42' },
            { title: '４2', expected: '42' },
            { title: 'this is a test', expected: 'this is a test' }
        ])
        .test('rewrite correct response ', (data, assert) => {
            const response = responseDeclarationMock(data.title);
            stringResponseHelper.rewriteCorrectResponse(response);
            assert.equal(
                stringResponseHelper.getCorrectResponse(response),
                data.expected,
                `Got correct response from "${data.title}" to ${data.expected}`
            );
        });
});
