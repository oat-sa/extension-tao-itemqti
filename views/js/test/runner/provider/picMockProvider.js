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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

define(['module', 'core/promise'], function(module, Promise) {
    'use strict';

    var baseUrl = module.uri.substring(0, module.uri.indexOf('picMockProvider'));

    return {
        load: function load() {
            return Promise.resolve({
                picMock1: [{
                    'baseUrl': baseUrl,
                    'typeIdentifier': 'picMock1',
                    'label': 'PIC MOCK 1',
                    'version': '1.0.0',
                    'runtime': {
                        'hook': 'pic-mock-1.js',
                        'libraries': [
                            'pick-mock.js'
                        ],
                    }
                }],
                picMock2: [{
                    'baseUrl': baseUrl,
                    'typeIdentifier': 'picMock2',
                    'label': 'PIC MOCK 2',
                    'version': '1.0.0',
                    'runtime': {
                        'hook': 'pic-mock-2.js',
                        'libraries': [
                            'pick-mock.js'
                        ],
                    }
                }],
                picMock3: [{
                    'baseUrl': baseUrl,
                    'typeIdentifier': 'picMock3',
                    'label': 'PIC MOCK 3',
                    'version': '1.0.0',
                    'runtime': {
                        'hook': 'pic-mock-3.js',
                        'libraries': [
                            'pick-mock.js'
                        ],
                    }
                }],
                studentToolbar: [{
                    'baseUrl': baseUrl,
                    'typeIdentifier': 'studentToolbar',
                    'label': 'PIC MOCK TOOLBAR',
                    'version': '1.0.0',
                    'runtime': {
                        'hook': 'pic-mock-studentToolbar.js',
                        'libraries': [
                            'pick-mock.js'
                        ],
                    }
                }]
            });
        }
    };
});
