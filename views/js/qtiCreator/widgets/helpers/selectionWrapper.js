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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define(['jquery'], function($) {
    'use strict';

    /**
     * @param {Object} options
     * @param {jQuery} options.$container - the element in which the selection is allowed
     * @param {boolean} options.allowQtiElements - if qtiElements can be wrapped
     * @param {Array} options.whiteListQtiClasses - array of allowed qtiClasses
     */
    return function(options) {
        var $container = options.$container;
        var allowQtiElements = options.allowQtiElements;
        var whiteListQtiClasses = options.whiteListQtiClasses || [];

        var selection = window.getSelection();
        var containForbiddenQtiElement;

        /**
         * traverse a DOM tree to check if it contains a QTI element
         * @param {Node} rootNode
         */
        function searchQtiElement(rootNode) {
            var childNodes = rootNode.childNodes,
                currentNode, i;
            for (i = 0; i < childNodes.length; i++) {
                currentNode = childNodes[i];
                if (!containForbiddenQtiElement && isElement(currentNode)) {
                    if(isQtiElement(currentNode) && !isQtiClassFromWhiteList(currentNode)) {
                        containForbiddenQtiElement = true;
                    } else {
                        searchQtiElement(currentNode);
                    }
                }
            }
        }

        /**
         * Check if the given node is an element
         * @param {Node} node
         * @returns {boolean}
         */
        function isElement(node) {
            return node.nodeType === window.Node.ELEMENT_NODE;
        }

        /**
         * Check if the given node represent a QTI Element
         * @param {Node} node
         * @returns {boolean}
         */
        function isQtiElement(node) {
            return node.className && (node.className.indexOf('qti-choice') > -1) || node.dataset && node.dataset.qtiClass;
        }

        /**
         * Checks data-qti-class in whiteListQtiClasses
         * @param {Node} node
         * @returns {boolean}
         */
        function isQtiClassFromWhiteList(node) {
            return whiteListQtiClasses.includes(node.dataset && node.dataset.qtiClass);
        }

        /**
         * Check that the given range is in the allowed container
         * @param {Range} range
         * @returns {boolean}
         */
        function isRangeValid(range) {
            return $.contains($container.get(0), range.commonAncestorContainer)
                || $container.get(0).isSameNode(range.commonAncestorContainer);
        }

        /**
         * The selection wrapper helper
         */
        return {
            /**
             * Can the content of the active selection be wrapped?
             * @returns {boolean|*}
             */
            canWrap: function canWrap() {
                var range = !selection.isCollapsed && selection.getRangeAt(0);

                if (range) {
                    containForbiddenQtiElement = false;
                    if (! allowQtiElements) {
                        searchQtiElement(range.cloneContents());
                    }

                    return range.toString().trim() !== ''
                        && isRangeValid(range)
                        && !containForbiddenQtiElement;
                }
                return false;
            },

            /**
             * Wraps the current active selection inside the given element
             * Warning: will lose any event handlers attached to the wrapped nodes!
             *
             * @param {jQuery} $wrapper - the element that will wrap the selection
             * @returns {boolean}
             */
            wrapWith: function wrapWith($wrapper) {
                var range = selection.getRangeAt(0);

                if (this.canWrap()) {
                    try {
                        range.surroundContents($wrapper[0]);
                        selection.removeAllRanges();
                        return true;
                    } catch (err) {
                        // this happens when wrapping of partially selected nodes is attempted, which would result in an invalid markup
                        // we return false to feedback the wrapping failure
                    }
                }
                return false;
            },

            /**
             * Wraps the current active selection inside the given element
             * Warning: will lose any event handlers attached to the wrapped nodes!
             *
             * @param {jQuery} $wrapper - the element that will wrap the selection
             * @returns {boolean}
             */
            wrapHTMLWith: function wrapWith($wrapper) {
                var range = selection.getRangeAt(0);

                if (this.canWrap()) {
                    try {
                        $wrapper[0].appendChild(range.extractContents());
                        range.insertNode($wrapper[0]);
                        selection.removeAllRanges();
                        return true;
                    } catch (err) {
                        // this happens when wrapping of partially selected nodes is attempted, which would result in an invalid markup
                        // we return false to feedback the wrapping failure
                    }
                }
                return false;
            }
        };
    };
});
