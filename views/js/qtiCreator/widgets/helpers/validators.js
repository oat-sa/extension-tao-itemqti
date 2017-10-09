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
 * Copyright (c) 2014-2016 (original work) Open Assessment Technologies SA
 *
 */
define([
    'core/validator/validators',
    'lodash',
    'i18n',
    'taoQtiItem/qtiItem/core/Element'
], function(validators, _, __, Element) {
    'use strict';

    var _qtiIdPattern = /^[_a-zA-Z]{1}[a-zA-Z0-9\-._]{0,31}$/i;

    var qtiValidators = [
        {
            name: 'qtiIdentifier',
            message: __('invalid identifier'),
            validate: function validate(value, callback) {
                if (typeof callback === 'function') {
                    callback(_qtiIdPattern.test(value));
                }
            }
        },
        //warning: simplistic implementation, allow only one unique identifier in the item no matter the element class/type
        {
            name: 'availableIdentifier',
            message: __('this identifier is already in use'),
            validate: function validate(value, callback, options) {
                if (options.serial) {
                    var element = Element.getElementBySerial(options.serial);
                    if (element && typeof callback === 'function') {
                        var ids = element.getRootElement().getUsedIdentifiers();
                        var available = (!ids[value] || ids[value].serial === element.serial);
                        callback(available);
                    }
                }else{
                    throw 'missing required option "serial"';
                }
            }
        },
        //define a validator that check unicity of the identifier for a variable declaration
        {
            name: 'availableVariableIdentifier',
            message: __('identifier already taken'),
            validate: function validate(value, callback, options) {
                if (options.serial) {
                    var element = Element.getElementBySerial(options.serial);
                    if (element && typeof callback === 'function') {
                        var ids = element.getRootElement().getUsedIdentifiers();
                        var available = (!ids[value] || ids[value].serial === element.serial || !ids[value].is('variableDeclaration'));
                        callback(available);
                    }
                }else{
                    throw 'missing required option "serial"';
                }
            }
        }
    ];

    _.each(qtiValidators, function(rule) {
        validators.register(rule.name, rule);
    });

    return validators;
});

