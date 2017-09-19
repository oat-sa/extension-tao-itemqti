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
define(['module', 'lodash', 'core/promise', 'util/url'], function(module, _, Promise, url) {
    'use strict';

    var baseUrl = window.location.origin + '/taoQtiItem/views/js/test/runner/provider';

    /**
     * Add the type identifier as the prefix of the relative path
     * The provider must indeed return the module definition this way
     *
     * @param {Object} obj
     * @param {String} [prefix]
     * @returns {Object}
     */
    var setPortableElementPrefix = function setPortableElementPrefix(obj, prefix){
        var ret;
        if(!prefix && obj.typeIdentifier){
            prefix = obj.typeIdentifier;
        }
        if(_.isArray(obj)){
            ret = _.map(obj, function(v){
                return setPortableElementPrefix(v, prefix);
            });
        }else if(_.isPlainObject(obj)){
            ret = {};
            _.forIn(obj, function(v, k){
                ret[k] = setPortableElementPrefix(v, prefix);
            });
        }else if(_.isString(obj)){
            ret = obj.replace('./', prefix+'/');
        }
        return ret;
    };

    return {
        load: function load() {
            return Promise.resolve({
                picMock1: [setPortableElementPrefix({
                    'baseUrl': baseUrl,
                    'typeIdentifier': 'picMock1',
                    'label': 'PIC MOCK 1',
                    'version': '1.0.0',
                    'runtime': {
                        'hook': './pic-mock-1.js'
                    }
                })],
                picMock2: [setPortableElementPrefix({
                    'baseUrl': baseUrl,
                    'typeIdentifier': 'picMock2',
                    'label': 'PIC MOCK 2',
                    'version': '1.0.0',
                    'runtime': {
                        'hook': './pic-mock-2.js'
                    }
                })],
                picMock3: [setPortableElementPrefix({
                    'baseUrl': baseUrl,
                    'typeIdentifier': 'picMock3',
                    'label': 'PIC MOCK 3',
                    'version': '1.0.0',
                    'runtime': {
                        'hook': './pic-mock-3.js'
                    }
                })],
                studentToolbar: [setPortableElementPrefix({
                    'baseUrl': baseUrl,
                    'typeIdentifier': 'studentToolbar',
                    'label': 'PIC MOCK TOOLBAR',
                    'version': '1.0.0',
                    'runtime': {
                        'hook': './pic-mock-studentToolbar.js'
                    }
                })]
            });
        }
    };
});
