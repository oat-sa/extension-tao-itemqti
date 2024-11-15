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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA
 *
 */
define([
    'lodash',
    'jquery',
    'core/encoder/entity',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/model/helper/event',
    'taoQtiItem/qtiCreator/model/helper/invalidator'
], function (_, $, entity, Element, event, invalidator) {
    'use strict';

    const _removeSelf = function (element) {
        let removed = false;
        const related = element.getRootElement();

        if (related) {
            const found = related.find(element.getSerial());

            if (found) {
                const parent = found.parent;
                if (element.getResponseDeclaration) {
                    const response = element.getResponseDeclaration();
                    if (response) {
                        invalidator.completelyValid(response);
                        Element.unsetElement(response);
                    }
                }
                const parentIsInteraction = Element.isA(parent, 'interaction');
                if (parentIsInteraction && element.qtiClass === 'gapImg') {
                    parent.removeGapImg(element);
                    removed = true;
                } else if (parentIsInteraction && Element.isA(element, 'choice')) {
                    parent.removeChoice(element);
                    removed = true;
                } else if (found.location === 'body' && _.isFunction(parent.initContainer)) {
                    if (_.isFunction(element.beforeRemove)) {
                        element.beforeRemove();
                    }
                    parent.getBody().removeElement(element);
                    removed = true;
                } else if (Element.isA(parent, '_container')) {
                    if (_.isFunction(element.beforeRemove)) {
                        element.beforeRemove();
                    }
                    parent.removeElement(element);
                    removed = true;
                }

                if (removed) {
                    //mark it instantly as removed in case its is being used somewhere else
                    element.data('removed', true);
                    invalidator.completelyValid(element);
                    event.deleted(element, parent);
                }
            }
        } else {
            throw new Error('no related item found');
        }

        return removed;
    };

    const _removeElement = function (element, containerPropName, eltToBeRemoved) {
        let targetSerial = '',
            targetElt;

        if (element[containerPropName]) {
            if (typeof eltToBeRemoved === 'string') {
                targetSerial = eltToBeRemoved;
                targetElt = Element.getElementBySerial(targetSerial);
            } else if (eltToBeRemoved instanceof Element) {
                targetSerial = eltToBeRemoved.getSerial();
                targetElt = eltToBeRemoved;
            }

            if (targetSerial) {
                invalidator.completelyValid(targetElt);
                delete element[containerPropName][targetSerial];
                Element.unsetElement(targetSerial);
            }
        }

        return element;
    };

    const methods = {
        init: function (serial, attributes) {
            const attr = {};

            //init call in the format init(attributes)
            if (typeof serial === 'object') {
                attributes = serial;
                serial = '';
            }

            if (_.isFunction(this.getDefaultAttributes)) {
                _.extend(attr, this.getDefaultAttributes());
            }
            _.extend(attr, attributes);

            this._super(serial, attr);
        },

        /**
         * Get or set an attribute
         * @param {String} key - the attribute name
         * @param {String} [value] - only to set the new value, let empty for a get
         * @returns {String} the attribute value
         */
        attr: function (key, value) {
            const ret = this._super(key, value);

            if (typeof key !== 'undefined' && typeof value !== 'undefined') {
                $(document).trigger('attributeChange.qti-widget', {
                    element: this,
                    key: key,
                    value: entity.encode(value)
                });
            }
            return _.isString(ret) ? entity.decode(ret) : ret;
        },

        removeAttr: function (key) {
            const ret = this._super(key);
            $(document).trigger('attributeChange.qti-widget', { element: this, key: key, value: null });
            return ret;
        },
        remove: function () {
            if (arguments.length === 0) {
                return _removeSelf(this);
            } else if (arguments.length === 2) {
                return _removeElement(this, arguments[0], arguments[1]);
            } else {
                throw new Error('invalid number of argument given');
            }
        }
    };

    return methods;
});
