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
    const REGEX = {
        INTERACTION_MATCH: /<interaction_([^>]+)>/,
        WRAPPER_DIV_MATCH: /<div\s+class="([^"]+)">\s*<interaction_/,
        DIV_CLASS_PATTERN: /<div\s+class="([^"]+)">/g,
        CLOSING_DIV: /<\/div>/
    };

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

            const placeholderPos = bodyContent.indexOf(placeholder);
            const beforePlaceholder = bodyContent.substring(0, placeholderPos);
            const divWithClass = `<div class="${className}">`;

            if (!beforePlaceholder.includes(divWithClass)) {
                return false;
            }

            const divPos = beforePlaceholder.lastIndexOf(divWithClass);
            const textBetween = beforePlaceholder.substring(divPos + divWithClass.length);

            if (textBetween.trim() && textBetween.trim().length >= 10) {
                return false;
            }

            const afterPlaceholder = bodyContent.substring(placeholderPos + placeholder.length);
            return afterPlaceholder.includes('</div>');
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
                inDOM: this.hasWrapperInDOM(interaction)
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

            const placeholderPos = bodyContent.indexOf(placeholder);
            const beforePlaceholder = bodyContent.substring(0, placeholderPos);

            let match;
            let lastMatch = null;
            const pattern = REGEX.DIV_CLASS_PATTERN;
            pattern.lastIndex = 0;

            while ((match = pattern.exec(beforePlaceholder)) !== null) {
                lastMatch = match;
            }

            if (!lastMatch || !lastMatch[1]) {
                return null;
            }

            const afterPlaceholder = bodyContent.substring(placeholderPos + placeholder.length);
            return afterPlaceholder.includes('</div>') ? lastMatch[1] : null;
        },

        /**
         * DOM Operations
         */
        dom: {
            /**
             * Apply wrapper in the DOM
             * @param {Object} interaction - The interaction
             * @param {String} className - Class name to apply
             */
            applyWrapper(interaction, className) {
                if (!interaction?.data('widget')?.$container?.length || !className) {
                    return;
                }

                const $container = interaction.data('widget').$container;

                this.removeWrapper(interaction);

                let wrapperClasses = className;
                if (!wrapperClasses.includes(WRAPPER_MARKER_CLASS)) {
                    wrapperClasses = `${className} ${WRAPPER_MARKER_CLASS}`;
                }

                $container.wrap(`<div class="${wrapperClasses}"></div>`);
            },

            /**
             * Remove wrapper from DOM
             * @param {Object} interaction - The interaction
             */
            removeWrapper(interaction) {
                if (!interaction?.data('widget')?.$container?.length) {
                    return;
                }

                const $container = interaction.data('widget').$container;
                const customClass = interaction.attr('customWrapperClass');

                if (customClass && $container.parent(`.${customClass}`).length) {
                    const $customWrapper = $container.parent(`.${customClass}`);
                    const $parentOfWrapper = $customWrapper.parent();

                    if ($parentOfWrapper.children().length > 1 ||
                        $parentOfWrapper.hasClass('grid-row') ||
                        $parentOfWrapper.hasClass('col-12')) {
                        $container.unwrap();
                    }
                    return;
                }

                if ($container.parent(`.${WRAPPER_MARKER_CLASS}`).length) {
                    const $markerWrapper = $container.parent(`.${WRAPPER_MARKER_CLASS}`);
                    const $parentOfWrapper = $markerWrapper.parent();

                    if ($parentOfWrapper.children().length > 1 ||
                        $parentOfWrapper.hasClass('grid-row') ||
                        $parentOfWrapper.hasClass('col-12')) {
                        $container.unwrap();
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

                const divWithCustomClass = `<div class="${customClass}">`;
                const divWithMixedClass = new RegExp(`<div\\s+class="([^"]*\\s)?${customClass}(\\s[^"]*)?"`);

                const placeholderPos = bodyContent.indexOf(placeholder);
                const beforePlaceholder = bodyContent.substring(0, placeholderPos);

                let lastCustomDivPos = beforePlaceholder.lastIndexOf(divWithCustomClass);

                if (lastCustomDivPos === -1) {
                    const mixedClassMatch = divWithMixedClass.exec(beforePlaceholder);
                    if (mixedClassMatch) {
                        lastCustomDivPos = mixedClassMatch.index;
                    }
                }

                if (lastCustomDivPos === -1) {
                    return false;
                }

                const afterPlaceholder = bodyContent.substring(placeholderPos + placeholder.length);
                const closingDivPos = afterPlaceholder.indexOf('</div>');

                if (closingDivPos === -1) {
                    return false;
                }

                interaction.rootElement.bdy.bdy =
                    beforePlaceholder.substring(0, lastCustomDivPos) +
                    placeholder +
                    afterPlaceholder.substring(closingDivPos + 6);

                return true;
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
         * @param {String} html - HTML content
         * @returns {Object} Parsed data
         */
        parse(html) {
            const normalizedHtml = html.replace(/\r\n/g, '\n').trim();

            const interactionMatch = normalizedHtml.match(REGEX.INTERACTION_MATCH);
            if (!interactionMatch) {
                throw new Error('No interaction placeholder found in the HTML');
            }

            const extractedId = interactionMatch[1];
            const serial = extractedId.startsWith('interaction_')
                ? extractedId
                : `interaction_${extractedId}`;

            const wrapperMatch = normalizedHtml.match(REGEX.WRAPPER_DIV_MATCH);
            const customClass = wrapperMatch ? wrapperMatch[1] : null;

            return {
                serial,
                customClass,
                wrapperRemoved: !customClass,
                originalHtml: normalizedHtml
            };
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
            if (interactions[serial]) {
                return interactions[serial];
            }

            const alternateSerial = serial.startsWith('interaction_')
                ? serial.substring('interaction_'.length)
                : `interaction_${serial}`;

            if (interactions[alternateSerial]) {
                return interactions[alternateSerial];
            }

            const serialEnd = serial.split('_').pop();
            if (serialEnd) {
                const matchingKey = Object.keys(interactions).find(key => key.endsWith(serialEnd));
                if (matchingKey) {
                    return interactions[matchingKey];
                }
            }

            return null;
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

            if (parsedData.customClass) {
                const isNewOrChanged = !currentClass || currentClass !== parsedData.customClass;

                if (isNewOrChanged) {
                    WrapperManager.removeRenderHook(interaction);

                    interaction.attr('customWrapperClass', parsedData.customClass);

                    WrapperManager.dom.removeWrapper(interaction);
                    WrapperManager.dom.applyWrapper(interaction, parsedData.customClass);
                    WrapperManager.setupRenderHook(interaction);
                }

                return true;
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

                const item = itemCreator.getItem();
                if (!item) {
                    return;
                }

                const interactions = item.getElements();
                const interaction = InteractionFinder.find(parsedData.serial, interactions);

                if (!interaction) {
                    logger.warn(`Could not find interaction with serial ${parsedData.serial}`);
                    return;
                }

                if (applyChanges(interaction, parsedData)) {
                    itemCreator.trigger('save', true);
                }
            } catch (error) {
                logger.error('Error handling content modification:', error);
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
