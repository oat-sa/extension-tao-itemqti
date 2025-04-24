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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

define([
    'jquery',
    'lodash',
    'core/logger',
    'taoQtiItem/qtiXmlRenderer/renderers/interactions/CustomWrappedInteraction'
], function ($, _, loggerFactory, CustomWrappedInteraction) {
    'use strict';

    const logger = loggerFactory('taoQtiItem/qtiCreator/plugins/interactionModifiers/interactionSourceHandler');

    const WRAPPER_MARKER_CLASS = 'custom-interaction-wrapper';
    const INTERACTION_PLACEHOLDER_FORMAT = '{{%s}}';
    const INTERACTION_REGEX = /<interaction_([^>]+)>/;

    /**
     * Wrapper State Manager - handles all wrapper-related operations
     */
    const WrapperManager = {
        /**
         * Formats an interaction placeholder
         * @param {String} serial - Interaction serial
         * @returns {String} Formatted placeholder
         */
        formatPlaceholder(serial) {
            return INTERACTION_PLACEHOLDER_FORMAT.replace('%s', serial);
        },

        /**
         * Checks if an interaction is wrapped in the HTML body
         * @param {Object} interaction - The interaction
         * @param {String} className - The wrapper class
         * @returns {Boolean} True if wrapped
         */
        isWrappedInBody(interaction, className) {
            if (!interaction?.rootElement?.bdy?.bdy || !className) {
                return false;
            }

            const bodyContent = interaction.rootElement.bdy.bdy;
            const placeholder = this.formatPlaceholder(interaction.serial);

            if (!bodyContent.includes(placeholder)) {
                return false;
            }

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = bodyContent;

            let placeholderNode = null;
            const findPlaceholder = (node) => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.includes(placeholder)) {
                    placeholderNode = node;
                    return true;
                }

                if (node.childNodes) {
                    for (let i = 0; i < node.childNodes.length; i++) {
                        if (findPlaceholder(node.childNodes[i])) {
                            return true;
                        }
                    }
                }
                return false;
            };

            findPlaceholder(tempDiv);

            if (!placeholderNode) {
                return false;
            }

            let currentNode = placeholderNode;
            while (currentNode && currentNode !== tempDiv) {
                currentNode = currentNode.parentNode;
                if (currentNode &&
                    currentNode.nodeType === Node.ELEMENT_NODE &&
                    currentNode.tagName.toLowerCase() === 'div' &&
                    currentNode.classList.contains(className)) {
                    return true;
                }
            }

            return false;
        },

        /**
         * Checks if the interaction is a text container
         * @param {Object} interaction - The interaction
         * @returns {Boolean} True if it's a text container
         */
        isTextContainer(interaction) {
            return interaction && interaction.qtiClass === '_container';
        },

        /**
         * Checks if an interaction has a wrapper in the DOM
         * @param {Object} interaction - The interaction
         * @returns {Boolean} True if has wrapper in DOM
         */
        hasWrapperInDOM(interaction) {
            if (!interaction?.data('widget')?.$container?.length) {
                return false;
            }

            const $container = interaction.data('widget').$container;
            const customClass = interaction.attr('customWrapperClass');

            if (!customClass) {
                return false;
            }

            return $container.parent(`.${customClass}`).length > 0 ||
                $container.parent(`.${WRAPPER_MARKER_CLASS}`).length > 0;
        },

        /**
         * Gets the wrapper state for an interaction
         * @param {Object} interaction - The interaction
         * @returns {Object} State object
         */
        getState(interaction) {
            const className = interaction.attr('customWrapperClass');
            return {
                hasWrapper: !!className,
                className,
                inBody: className ? this.isWrappedInBody(interaction, className) : false,
                inDOM: this.hasWrapperInDOM(interaction),
                isTextContainer: this.isTextContainer(interaction)
            };
        },

        /**
         * Extract wrapper class from HTML body
         * @param {Object} interaction - The interaction
         * @returns {String|null} Extracted class name or null
         */
        extractClassFromBody(interaction) {
            if (!interaction?.rootElement?.bdy?.bdy) {
                return null;
            }

            const bodyContent = interaction.rootElement.bdy.bdy;
            const placeholder = this.formatPlaceholder(interaction.serial);

            if (!bodyContent.includes(placeholder)) {
                return null;
            }

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = bodyContent;

            let placeholderNode = null;
            const findPlaceholder = (node) => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.includes(placeholder)) {
                    placeholderNode = node;
                    return true;
                }

                if (node.childNodes) {
                    for (let i = 0; i < node.childNodes.length; i++) {
                        if (findPlaceholder(node.childNodes[i])) {
                            return true;
                        }
                    }
                }
                return false;
            };

            findPlaceholder(tempDiv);

            if (!placeholderNode) {
                return null;
            }

            let currentNode = placeholderNode;
            while (currentNode && currentNode !== tempDiv) {
                currentNode = currentNode.parentNode;
                if (currentNode &&
                    currentNode.nodeType === Node.ELEMENT_NODE &&
                    currentNode.tagName.toLowerCase() === 'div' &&
                    currentNode.classList.length > 0) {
                    return currentNode.classList[0];
                }
            }

            return null;
        },

        /**
         * DOM Operations
         */
        dom: {
            /**
             * Find the widget element in the DOM
             * @param {Object} interaction - The interaction
             * @returns {jQuery|null} Widget jQuery element or null
             */
            findWidgetElement(interaction) {
                if (!interaction?.data('widget')?.$container?.length) {
                    return null;
                }

                return $(`.widget-box[data-serial="${interaction.serial}"]`);
            },

            /**
             * Apply wrapper in the DOM
             * @param {Object} interaction - The interaction
             * @param {String} className - Class name to apply
             */
            applyWrapper(interaction, className) {
                if (!className) {
                    return;
                }

                const $widget = this.findWidgetElement(interaction);

                if (!$widget || !$widget.length) {
                    logger.warn('Could not find widget element to wrap', {
                        serial: interaction.serial,
                        qtiClass: interaction.qtiClass
                    });
                    return;
                }

                this.removeWrapper(interaction);

                let wrapperClasses = className;
                if (!wrapperClasses.includes(WRAPPER_MARKER_CLASS)) {
                    wrapperClasses = `${className} ${WRAPPER_MARKER_CLASS}`;
                }

                logger.debug('Applying wrapper', {
                    serial: interaction.serial,
                    class: wrapperClasses,
                    widget: $widget.attr('data-serial')
                });

                const $existingWrapper = $widget.parent(`.${wrapperClasses}`);
                if ($existingWrapper.length) {
                    logger.debug('Widget already wrapped correctly', {
                        serial: interaction.serial
                    });
                    return;
                }

                $widget.wrap(`<div class="${wrapperClasses}"></div>`);

                const $newWrapper = $widget.parent(`.${wrapperClasses}`);
                if (!$newWrapper.length) {
                    logger.warn('Failed to apply wrapper', {
                        serial: interaction.serial
                    });
                }
            },

            /**
             * Remove wrapper from DOM
             * @param {Object} interaction - The interaction
             */
            removeWrapper(interaction) {
                const $widget = this.findWidgetElement(interaction);

                if (!$widget || !$widget.length) {
                    return;
                }

                const customClass = interaction.attr('customWrapperClass');

                if (customClass) {
                    const $wrapper = $widget.parent(`.${customClass}`);
                    if ($wrapper.length) {
                        const $parent = $wrapper.parent();
                        if ($parent.children().length > 1 ||
                            $parent.hasClass('grid-row') ||
                            $parent.hasClass('col-12')) {
                            logger.debug('Removing custom class wrapper', {
                                serial: interaction.serial,
                                class: customClass
                            });
                            $widget.unwrap();
                        }
                    }
                }

                const $markerWrapper = $widget.parent(`.${WRAPPER_MARKER_CLASS}`);
                if ($markerWrapper.length) {
                    const $parent = $markerWrapper.parent();
                    if ($parent.children().length > 1 ||
                        $parent.hasClass('grid-row') ||
                        $parent.hasClass('col-12')) {
                        logger.debug('Removing marker class wrapper', {
                            serial: interaction.serial
                        });
                        $widget.unwrap();
                    }
                }
            }
        },

        /**
         * Model Operations
         */
        model: {
            /**
             * Remove wrapper from HTML body model
             * @param {Object} interaction - The interaction
             * @returns {Boolean} Success flag
             */
            removeWrapper(interaction) {
                if (!interaction?.rootElement?.bdy?.bdy) {
                    return false;
                }

                const bodyContent = interaction.rootElement.bdy.bdy;
                const placeholder = WrapperManager.formatPlaceholder(interaction.serial);
                const customClass = interaction.attr('customWrapperClass');

                if (!bodyContent.includes(placeholder) || !customClass) {
                    return false;
                }

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = bodyContent;

                let placeholderNode = null;
                const findPlaceholder = (node) => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.includes(placeholder)) {
                        placeholderNode = node;
                        return true;
                    }

                    if (node.childNodes) {
                        for (let i = 0; i < node.childNodes.length; i++) {
                            if (findPlaceholder(node.childNodes[i])) {
                                return true;
                            }
                        }
                    }
                    return false;
                };

                findPlaceholder(tempDiv);

                if (!placeholderNode) {
                    return false;
                }

                let currentNode = placeholderNode;
                let wrapperNode = null;

                while (currentNode && currentNode !== tempDiv) {
                    currentNode = currentNode.parentNode;
                    if (currentNode &&
                        currentNode.nodeType === Node.ELEMENT_NODE &&
                        currentNode.tagName.toLowerCase() === 'div' &&
                        currentNode.classList.contains(customClass)) {
                        wrapperNode = currentNode;
                        break;
                    }
                }

                if (wrapperNode) {
                    const placeholderText = document.createTextNode(placeholder);
                    wrapperNode.parentNode.replaceChild(placeholderText, wrapperNode);
                    interaction.rootElement.bdy.bdy = tempDiv.innerHTML;
                    return true;
                }

                return false;
            }
        },

        /**
         * Setup XML rendering hook for interaction
         * @param {Object} interaction - The interaction
         */
        setupRenderHook(interaction) {
            const customClass = interaction.attr('customWrapperClass');

            if (!customClass || interaction._originalRenderer) {
                return;
            }

            interaction._originalRenderer = interaction.render;

            interaction.render = function () {
                const originalResult = this._originalRenderer.apply(this, arguments);

                if (WrapperManager.isWrappedInBody(this, customClass)) {
                    return originalResult;
                }

                return CustomWrappedInteraction.wrapInteraction(this, originalResult);
            };
        },

        /**
         * Remove XML rendering hook
         * @param {Object} interaction - The interaction
         */
        removeRenderHook(interaction) {
            if (interaction._originalRenderer) {
                interaction.render = interaction._originalRenderer;
                interaction._originalRenderer = null;
            }
        },

        /**
         * Synchronize wrapper state
         * @param {Object} interaction - The interaction
         */
        synchronize(interaction) {
            if (!interaction.attr('customWrapperClass')) {
                const extractedClass = this.extractClassFromBody(interaction);
                if (extractedClass) {
                    interaction.attr('customWrapperClass', extractedClass);
                }
            }

            const state = this.getState(interaction);

            if (state.hasWrapper) {
                this.setupRenderHook(interaction);

                if (!state.inBody && !state.inDOM) {
                    this.dom.applyWrapper(interaction, state.className);
                }
            }
        }
    };

    /**
     * HTML Parser for interaction content
     */
    const HtmlParser = {
        /**
         * Parse HTML content to extract interaction data
         * @returns {Object} Parsed data
         * @param match
         */

        parseInteractionMatch(match) {
            if (!match || !match[1]) return { serial: null, isContainer: false };

            const fullTag = match[1];
            const isContainer = fullTag.includes('_container_');
            const parts = fullTag.split('_');
            const serial = parts[parts.length - 1];

            return { serial, isContainer };
        },

        parse(html) {
            if (!html) {
                throw new Error('Empty HTML content provided');
            }

            const normalizedHtml = html.replace(/\r\n/g, '\n').trim();
            let serial = null;
            let customClass = null;
            let isTextContainer = false;

            try {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = normalizedHtml;

                const placeholderMatch = normalizedHtml.match(INTERACTION_REGEX);

                if (placeholderMatch) {
                    const parsed = this.parseInteractionMatch(placeholderMatch);
                    serial = parsed.serial;
                    isTextContainer = parsed.isContainer;

                    const placeholderTag = placeholderMatch[0];

                    const divs = Array.from(tempDiv.querySelectorAll('div'));
                    const containingDivs = divs.filter(div =>
                        div.innerHTML.includes(placeholderTag.toLowerCase())
                    );

                    const placeholderDiv = containingDivs.find(div =>
                        !containingDivs.some(otherDiv =>
                            otherDiv !== div && div.contains(otherDiv)
                        )
                    );

                    if (placeholderDiv && placeholderDiv.className) {
                        customClass = placeholderDiv.className;
                    }
                }

                if (!serial) {
                    throw new Error('No interaction serial found in HTML content');
                }

                logger.debug('Parsed HTML data', {
                    serial,
                    customClass,
                    isTextContainer
                });

                return {
                    serial,
                    customClass,
                    isTextContainer,
                    wrapperRemoved: !customClass,
                    originalHtml: normalizedHtml
                };
            } catch (e) {
                logger.error('Error parsing HTML:', e);
                throw e;
            }
        }
    };

    /**
     * Interaction finder utility
     */
    const InteractionFinder = {
        /**
         * Find interaction by serial
         * @param {String} serial - The serial to find
         * @param {Object} interactions - Available interactions
         * @returns {Object|null} Found interaction or null
         */
        find(serial, interactions) {
            if (!serial) {
                return null;
            }

            if (interactions[serial]) {
                return interactions[serial];
            }

            const interactionKey = Object.keys(interactions).find(key =>
                key.includes(serial)
            );

            return interactionKey ? interactions[interactionKey] : null;
        }
    };

    /**
     * Handler for the interactionsource plugin's content modifications
     *
     * @param {Object} options - Configuration options
     * @returns {Object} Plugin API
     */
    return function interactionSourceHandlerFactory(options) {
        let initialized = false;
        const itemCreator = options?.itemCreator;

        /**
         * Apply changes based on parsed HTML data
         * @param {Object} interaction - Target interaction
         * @param {Object} parsedData - Parsed HTML data
         * @returns {Boolean} Success flag
         */
        const applyChanges = (interaction, parsedData) => {
            if (!interaction) {
                return false;
            }

            const currentClass = interaction.attr('customWrapperClass');
            const isTextContainer = WrapperManager.isTextContainer(interaction);

            logger.debug('Applying changes', {
                serial: interaction.serial,
                qtiClass: interaction.qtiClass,
                isTextContainer: isTextContainer,
                currentClass: currentClass,
                newClass: parsedData.customClass,
                wrapperRemoved: parsedData.wrapperRemoved
            });

            if (parsedData.customClass) {
                const isNewOrChanged = !currentClass || currentClass !== parsedData.customClass;

                if (isNewOrChanged) {
                    WrapperManager.removeRenderHook(interaction);
                    interaction.attr('customWrapperClass', parsedData.customClass);
                    WrapperManager.dom.removeWrapper(interaction);
                    WrapperManager.dom.applyWrapper(interaction, parsedData.customClass);
                    WrapperManager.setupRenderHook(interaction);

                    return true;
                }
            } else if (parsedData.wrapperRemoved && currentClass) {
                WrapperManager.removeRenderHook(interaction);
                interaction.removeAttr('customWrapperClass');
                WrapperManager.dom.removeWrapper(interaction);
                WrapperManager.model.removeWrapper(interaction);

                return true;
            }

            return false;
        };

        /**
         * Handle content modification from editor
         * @param {Object} data - Event data
         */
        const handleContentModification = (data) => {
            if (!data?.html || !itemCreator) {
                return;
            }

            try {
                const parsedData = HtmlParser.parse(data.html);
                logger.debug('Parsed interaction data', parsedData);

                const item = itemCreator.getItem();
                if (!item) {
                    logger.warn('Item not found in itemCreator');
                    return;
                }

                const interactions = item.getElements();
                logger.debug('Available interactions', Object.keys(interactions));

                const interaction = InteractionFinder.find(parsedData.serial, interactions);

                if (!interaction) {
                    logger.warn(`Could not find interaction with serial ${parsedData.serial}`);
                    return;
                }

                if (applyChanges(interaction, parsedData)) {
                    itemCreator.trigger('save', true);
                }
            } catch (error) {
                logger.error('Error handling content modification:', error.message);
            }
        };

        /**
         * Attach event listener to CKEditor
         * @param {Object} editor - CKEditor instance
         */
        const attachEditorListener = (editor) => {
            if (typeof editor?.on !== 'function') {
                return;
            }

            editor.on('pluginContentModified', event => {
                const data = event.data;
                if (data?.pluginName === 'interactionsourcedialog') {
                    handleContentModification(data);
                }
            });
        };

        /**
         * Process all interactions in the item
         */
        const processAllInteractions = () => {
            if (!itemCreator) {
                return;
            }

            const item = itemCreator.getItem();
            if (!item) {
                return;
            }

            const interactions = item.getElements();
            Object.values(interactions).forEach(interaction => {
                WrapperManager.synchronize(interaction);
            });
        };

        /**
         * Initialize the handler
         */
        const init = () => {
            if (initialized) {
                return;
            }

            $('[data-html-editable]').each(function () {
                const editor = $(this).data('editor');
                attachEditorListener(editor);
            });

            $(document).on('editorready', (event, editor) => {
                attachEditorListener(editor);
            });

            processAllInteractions();

            if (itemCreator) {
                itemCreator.on('widgetCreated', widget => {
                    if (widget?.element) {
                        WrapperManager.synchronize(widget.element);
                    }
                });

                itemCreator.on('beforesave', processAllInteractions);
            }

            initialized = true;
        };

        /**
         * Destroy the handler
         */
        const destroy = () => {
            if (!initialized) {
                return;
            }

            $('[data-html-editable]').each(function () {
                const editor = $(this).data('editor');
                if (editor && typeof editor.removeListener === 'function') {
                    editor.removeListener('pluginContentModified');
                }
            });

            $(document).off('editorready');

            if (itemCreator) {
                itemCreator.off('widgetCreated');
                itemCreator.off('beforesave');
            }

            initialized = false;
        };

        return {
            init,
            destroy
        };
    };
});
