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
 * Copyright (c) 2016-2024 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define(['jquery'], function ($) {
    'use strict';

    /**
     * @param {Object} options
     * @param {jQuery} options.$container - the element in which the selection is allowed
     * @param {boolean} options.allowQtiElements - if qtiElements can be wrapped
     * @param {Array} options.whiteListQtiClasses - array of allowed qtiClasses
     * @returns {Object} selection wrapper helper
     */
    return function (options) {
        const $container = options.$container;
        const allowQtiElements = options.allowQtiElements;
        const whiteListQtiClasses = options.whiteListQtiClasses || [];

        const selection = window.getSelection();
        let containForbiddenQtiElement;

        /**
         * traverse a DOM tree to check if it contains a QTI element
         * @param {Node} rootNode
         */
        function searchQtiElement(rootNode) {
            const childNodes = rootNode.childNodes;
            let currentNode, i;
            for (i = 0; i < childNodes.length; i++) {
                currentNode = childNodes[i];
                if (!containForbiddenQtiElement && isElement(currentNode)) {
                    if (isQtiElement(currentNode) && !isQtiClassFromWhiteList(currentNode)) {
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
            return (
                (node.className && node.className.indexOf('qti-choice') > -1) || (node.dataset && node.dataset.qtiClass)
            );
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
            return (
                $.contains($container.get(0), range.commonAncestorContainer) ||
                $container.get(0).isSameNode(range.commonAncestorContainer)
            );
        }
        /**
         * Make sure that the current selection is not already inside a furigana/ruby
         * @param {Node} node
         * @returns {CKEDITOR.dom.node|null}
         */
        function isInRuby(node) {
            return $(node).parents('ruby').length > 0;
        }
        /**
         * The selection wrapper helper
         */
        return {
            /**
             * Can the content of the active selection be wrapped?
             * @returns {boolean|*}
             */
            canWrap: function canWrap(providedRange) {
                const range = providedRange || selection.getRangeAt(0);
                if (!range) {
                    return false;
                }
                if (range.isCollapsed || isInRuby(range.startContainer)) {
                    return false;
                }
                containForbiddenQtiElement = false;
                if (!allowQtiElements) {
                    searchQtiElement(range.cloneContents());
                }

                return range.toString().trim() !== '' && isRangeValid(range) && !containForbiddenQtiElement;
            },

            /**
             * Wraps the current active selection inside the given element
             * Warning: will lose any event handlers attached to the wrapped nodes!
             *
             * @param {jQuery} $wrapper - the element that will wrap the selection
             * @returns {boolean}
             */
            wrapWith: function wrapWith($wrapper, providedRange) {
                const range = providedRange || selection.getRangeAt(0);

                if (this.canWrap(range)) {
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
            wrapHTMLWith: function wrapWith($wrapper, providedRange) {
                const range = providedRange || selection.getRangeAt(0);

                if (this.canWrap(range)) {
                    try {
                        $wrapper[0].appendChild(range.extractContents());
                        range.insertNode($wrapper[0]);
                        if (!providedRange) {
                            selection.removeAllRanges();
                        }
                        return true;
                    } catch (err) {
                        // this happens when wrapping of partially selected nodes is attempted, which would result in an invalid markup
                        // we return false to feedback the wrapping failure
                    }
                }
                return false;
            },

            /**
             * Returns true if the current selection is a multiple selection, false otherwise
             *
             * @returns {boolean}
             */
            isMultipleSelection: function isMultipleSelection() {
                const selectionText = selection.toString().replace(/(\r\n|\n|\r)/g, " ");
                const words = selectionText.split(/\s+/).length;
                return words > 1;
            },
            /**
             * Returns span with selected fragment
             *
             * @returns {JQueryElement}
             */
            getCloneOfContents: function getCloneOfContents() {
                const range = selection.getRangeAt(0);
                return $('<span>').append(range.cloneContents());
            },
            /**
             * Returns next text node sibling
             *
             * @returns {Node}
             */
            getNextTextSibling: function getNextTextSibling(currentNode, isParent = false) {
                let nextSibling = null;
                if (currentNode.childNodes.length > 0 && !isParent) {
                    nextSibling = currentNode.childNodes[0];
                } else if (currentNode.nextSibling) {
                    nextSibling = currentNode.nextSibling;
                } else if (currentNode.parentNode && currentNode.parentNode.nextSibling) {
                    nextSibling = currentNode.parentNode.nextSibling;
                } else if (currentNode.parentNode && currentNode.parentNode.parentNode) {
                    return getNextTextSibling(currentNode.parentNode.parentNode, true);
                }
                if (nextSibling && nextSibling.nodeType !== Node.TEXT_NODE) {
                    return getNextTextSibling(nextSibling);
                }
                return nextSibling;
            },
            /**
             * Returns an array of objects with selected fragments and it's ranges
             *
             * @returns {Array}
             */
            getCloneOfContentsInBatch: function getCloneOfContentsInBatch() {
                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                const text = selection.toString().replace(/(\r\n|\n|\r)/g, ' ');
                const words = text.split(/\s+/).filter(Boolean);
                const results = [];
                let startOffset = range.startOffset;
                let currentNode = range.startContainer;
            
                words.forEach(word => {
                    let wordLength = word.length;
                    let remainingLength = wordLength;
                    let wordRange = document.createRange();
                    let rollover = false;
                    
                    while (currentNode && remainingLength > 0) {
                        if (currentNode.nodeType === Node.TEXT_NODE) {
                            if (currentNode.textContent.trim().length === 0) {
                                currentNode = this.getNextTextSibling(currentNode);
                                continue;
                            }
                            const nextTextPart = currentNode.textContent.slice(startOffset);
                            const match = nextTextPart.match(/^[ \xA0]*/);
                            const spaces = match[0].length;
                            startOffset += spaces;
                            if (!rollover) {
                                wordRange.setStart(currentNode, startOffset);
                            }
                            const currentNodeText = currentNode.textContent.replace(/\s+$/, '');
                            let currentNodeLength = currentNodeText.length - startOffset;
                            let takeLength = Math.min(remainingLength, currentNodeLength);
                            remainingLength -= takeLength;
            
                            if (currentNodeLength === takeLength) {
                                if (remainingLength > 0) {
                                    currentNode = this.getNextTextSibling(currentNode);
                                    startOffset = 0;
                                    rollover = true;
                                    continue;
                                }
                                wordRange.setEnd(currentNode, startOffset + takeLength);
                                currentNode = this.getNextTextSibling(currentNode);
                                startOffset = 0;
                                rollover = false;
                            } else {
                                wordRange.setEnd(currentNode, startOffset + takeLength);
                                startOffset += takeLength;
                                rollover = false;
                            }
                        } else {
                            currentNode = this.getNextTextSibling(currentNode);
                        }
                    }
            
                    if (!currentNode && remainingLength > 0) {
                        throw new Error('Reached the end of the document while processing words');
                    }
            
                    results.push({ node: $('<span>').append(wordRange.cloneContents()), range: wordRange });
                });
            
                return results;
            }
            
        };
    };
});
