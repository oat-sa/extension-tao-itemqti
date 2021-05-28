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
 * Copyright (c) 2014-2021 (original work) Open Assessment Technologies SA;
 *
 */
define(['lodash'], function (_) {
    'use strict';
    const invalidator = {
        completelyValid: function (element) {
            const item = element.getRootElement();
            if (item) {
                const serial = element.getSerial();
                const invalidElements = item.data('invalid') || {};

                delete invalidElements[serial];
                item.data('invalid', invalidElements);
            }
        },
        valid: function (element, key) {
            const item = element.getRootElement();
            const serial = element.getSerial();

            if (item) {
                const invalidElements = item.data('invalid') || {};

                if (key) {
                    if (invalidElements[serial] && invalidElements[serial][key]) {
                        delete invalidElements[serial][key];
                        if (!_.size(invalidElements[serial])) {
                            delete invalidElements[serial];
                        }

                        item.data('invalid', invalidElements);
                    }
                } else {
                    throw new Error('missing required argument "key"');
                }
            }
        },
        invalid: function (element, key, message, stateName) {
            const item = element.getRootElement();
            const serial = element.getSerial();

            if (item) {
                const invalidElements = item.data('invalid') || {};

                if (key) {
                    if (!invalidElements[serial]) {
                        invalidElements[serial] = {};
                    }

                    invalidElements[serial][key] = {
                        message: message || '',
                        stateName: stateName || 'active'
                    };
                    item.data('invalid', invalidElements);
                } else {
                    throw new Error('missing required arguments "key"');
                }
            }
        },
        isValid: function (element, key) {
            const item = element.getRootElement();
            const serial = element.getSerial();

            if (item) {
                const invalidElements = item.data('invalid') || {};
                if (!key) {
                    return !invalidElements[serial];
                } else {
                    return !(invalidElements[serial] && invalidElements[serial][key]);
                }
            }
            return true;
        }
    };

    return invalidator;
});
