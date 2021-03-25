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
    'ui/validator/validators',
    'lodash',
    'i18n',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/model/helper/invalidator'
], function (validators, _, __, Element, invalidator) {
    'use strict';

    var _qtiIdPattern = /^[A-Za-z_][A-Za-z_0-9-]*$/u;
    const typeToMessage = {
        response: 'Invalid response identifier',
        item: 'Invalid identifier',
        default: 'Invalid identifier'
    };

    var qtiValidators = [
        {
            name: 'qtiIdentifier',
            message: __(
                '<b>Invalid identifier</b></br>Identifiers must start with a letter or an underscore and contain only letters, numbers, underscores ( _ ), or hyphens ( - ).'
            ),
            validate: function validate(value, callback, options) {
                if (typeof callback === 'function') {
                    const valid = _qtiIdPattern.test(value);
                    if (options && options.serial) {
                        const element = Element.getElementBySerial(options.serial);
                        if (valid) {
                            invalidator.valid(element, 'qtiIdentifier');
                        } else {
                            invalidator.invalid(
                                element,
                                'qtiIdentifier',
                                options.type ? typeToMessage[options.type] : typeToMessage.default
                            );
                        }
                    }
                    callback(valid);
                }
            }
        },
        {
            name: 'qtiResponseIdentifier',
            message: __(
                '<b>Invalid response identifier</b></br>Identifiers must start with a letter or an underscore and contain only letters, numbers, underscores ( _ ), or hyphens ( - ).'
            ),
            validate: function validate(value, callback, options) {
                if (typeof callback === 'function') {
                    callback(_qtiIdPattern.test(value));
                }
            }
        },
        //warning: simplistic implementation, allow only one unique identifier in the item no matter the element class/type
        {
            name: 'availableIdentifier',
            message: __('This identifier must not be used by any other response or item variable.'),
            validate: function validate(value, callback, options) {
                if (options.serial) {
                    var element = Element.getElementBySerial(options.serial);
                    if (element && typeof callback === 'function') {
                        var ids = element.getRootElement().getUsedIdentifiers();
                        var available = !ids[value] || ids[value].serial === element.serial;
                        callback(available);
                    }
                } else {
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
                        var available =
                            !ids[value] ||
                            ids[value].serial === element.serial ||
                            !ids[value].is('variableDeclaration');
                        callback(available);
                    }
                } else {
                    throw 'missing required option "serial"';
                }
            }
        },
        //Define a validator that checks validity of the URL
        {
            name: 'isValidUrl',
            message: __('Invalid URL'),
            validate: function validate(value, callback) {
                if (value) {
                    try {
                        callback(new URL(value));
                    } catch (error) {
                        callback(false);
                    }
                } else {
                    callback(true);
                }
            }
        }
    ];

    _.each(qtiValidators, function (rule) {
        validators.register(rule.name, rule);
    });

    return validators;
});
