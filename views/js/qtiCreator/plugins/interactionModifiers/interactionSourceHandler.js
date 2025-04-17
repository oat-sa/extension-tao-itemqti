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
], function($, _, loggerFactory, CustomWrappedInteraction) {
    'use strict';

    const logger = loggerFactory('taoQtiItem/qtiCreator/plugins/interactionModifiers/interactionSourceHandler');

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
         * Extracts the interaction data from the HTML representation
         *
         * @param {String} html - The HTML string containing the interaction
         * @returns {Object} Object containing the extracted parts
         */
        const parseInteractionHtml = (html) => {
            const normalizedHtml = html.replace(/\r\n/g, '\n').trim();
            let serial = null;

            const fullMatch = normalizedHtml.match(/<interaction_([^>]+)>/);
            if (!fullMatch) {
                throw new Error('No interaction placeholder found in the HTML');
            }

            const extractedId = fullMatch[1];
            serial = extractedId.startsWith('interaction_') ? extractedId : `interaction_${extractedId}`;

            const wrapperMatch = normalizedHtml.match(/<div\s+class="([^"]+)">/);
            const customClass = wrapperMatch ? wrapperMatch[1] : null;

            return {
                serial,
                customClass
            };
        };

        /**
         * Finds interaction by serial or attempts to match based on partial serial
         *
         * @param {String} targetSerial - The serial to find
         * @param {Object} interactions - Available interactions
         * @returns {Object|null} - Found interaction or null
         */
        const findInteraction = (targetSerial, interactions) => {
            if (interactions[targetSerial]) {
                return interactions[targetSerial];
            }

            const alternateSerial = targetSerial.startsWith('interaction_')
                ? targetSerial.substring('interaction_'.length)
                : `interaction_${targetSerial}`;

            if (interactions[alternateSerial]) {
                return interactions[alternateSerial];
            }

            const serialEndPart = targetSerial.split('_').pop();
            if (serialEndPart) {
                const matchingKey = Object.keys(interactions).find(key => key.endsWith(serialEndPart));
                if (matchingKey) {
                    return interactions[matchingKey];
                }
            }

            return null;
        };

        /**
         * Apply the HTML changes to the QTI model
         * @param {Object} interaction - The QTI interaction instance
         * @param {Object} parsedData - The parsed data object from parseInteractionHtml
         * @returns {Boolean} Success status
         */
        const applyHtmlChangesToQti = (interaction, parsedData) => {
            try {
                if (!interaction) {
                    throw new Error('Invalid interaction object');
                }

                if (parsedData.customClass) {
                    interaction.attr('customWrapperClass', parsedData.customClass);

                    ensureInteractionWrapper(interaction);

                    setupXmlRenderHook(interaction);

                    logger.debug(`Applied custom wrapper class '${parsedData.customClass}' to interaction ${parsedData.serial}`);
                } else {
                    if (interaction.attr('customWrapperClass')) {
                        interaction.removeAttr('customWrapperClass');

                        removeInteractionWrapper(interaction);

                        if (interaction._originalRenderer) {
                            interaction.render = interaction._originalRenderer;
                            interaction._originalRenderer = null;
                        }

                        logger.debug(`Removed custom wrapper class from interaction ${parsedData.serial}`);
                    }
                }

                return true;
            } catch (error) {
                logger.error('Error applying HTML changes to QTI:', error);
                return false;
            }
        };

        /**
         * Remove wrapper div from interaction in the DOM
         * @param {Object} interaction - The interaction object
         */
        const removeInteractionWrapper = (interaction) => {
            if (!interaction || !interaction.data('widget')) {
                return;
            }

            const $container = interaction.data('widget').$container;
            if ($container?.length && $container.parent('.custom-interaction-wrapper').length) {
                $container.unwrap();
            }
        };

        /**
         * Hook into the XML rendering process to ensure wrapper divs are included
         * @param {Object} interaction - The interaction object
         */
        const setupXmlRenderHook = (interaction) => {
            if (!interaction || !interaction.attr('customWrapperClass')) {
                return;
            }

            if (!interaction._originalRenderer && interaction.render) {
                interaction._originalRenderer = interaction.render;

                interaction.render = function() {
                    const originalResult = this._originalRenderer.apply(this, arguments);
                    return CustomWrappedInteraction.wrapInteraction(this, originalResult);
                };
            }
        };

        /**
         * Handle CKEditor pluginContentModified event
         * @param {Object} editor - The CKEditor instance
         * @param {Object} data - Event data with HTML
         */
        const handleEditorPluginContentModified = (editor, data) => {
            try {
                const parsedData = parseInteractionHtml(data.html);

                if (!itemCreator) {
                    throw new Error('No itemCreator available');
                }

                const item = itemCreator.getItem();
                if (!item) {
                    throw new Error('Could not get item from itemCreator');
                }

                const interactions = item.getElements();
                const interaction = findInteraction(parsedData.serial, interactions);

                if (!interaction) {
                    throw new Error(`Could not find interaction with serial ${parsedData.serial}`);
                }

                const success = applyHtmlChangesToQti(interaction, parsedData);

                if (success) {
                    itemCreator.trigger('save', true);
                    logger.info('Successfully processed interaction HTML modification');
                }
            } catch (error) {
                logger.error('Error handling plugin content modification:', error);
            }
        };

        /**
         * Ensures a specific interaction has the appropriate DOM wrapper
         * @param {Object} interaction - The interaction object
         */
        const ensureInteractionWrapper = (interaction) => {
            if (!interaction) {
                return;
            }

            const customClass = interaction.attr('customWrapperClass');
            if (!customClass || !interaction.data('widget')) {
                return;
            }

            const $container = interaction.data('widget').$container;

            if ($container?.length) {
                if (!$container.parent().hasClass(customClass)) {
                    if ($container.parent('.custom-interaction-wrapper').length) {
                        $container.unwrap();
                    }

                    $container.wrap(`<div class="${customClass} custom-interaction-wrapper"></div>`);
                }
            }
        };

        /**
         * Ensures all interactions with customWrapperClass have appropriate DOM wrappers
         */
        const ensureAllInteractionWrappers = () => {
            if (!itemCreator) {
                return;
            }

            const item = itemCreator.getItem();
            if (!item) {
                return;
            }

            const interactions = item.getElements();

            Object.entries(interactions).forEach(([, interaction]) => {
                if (interaction.attr('customWrapperClass')) {
                    setupXmlRenderHook(interaction);
                    ensureInteractionWrapper(interaction);
                }
            });
        };

        /**
         * Attach event listener to a specific CKEditor instance
         * @param {Object} editor - The CKEditor instance
         */
        const attachListenerToCKEditor = (editor) => {
            if (typeof editor?.on !== 'function') {
                return;
            }

            editor.on('pluginContentModified', (event) => {
                const data = event.data;
                if (data?.pluginName === 'interactionsourcedialog') {
                    handleEditorPluginContentModified(editor, data);
                }
            });
        };

        /**
         * Attach listeners to all existing CKEditor instances
         */
        const attachToCKEditorInstances = () => {
            $('[data-html-editable]').each(function() {
                const editor = $(this).data('editor');
                attachListenerToCKEditor(editor);
            });
        };

        /**
         * Initialize the handler
         */
        const init = () => {
            if (initialized) {
                return;
            }

            attachToCKEditorInstances();

            $(document).on('editorready', (event, editor) => {
                attachListenerToCKEditor(editor);
            });

            if (itemCreator) {
                const item = itemCreator.getItem();
                if (item) {
                    const interactions = item.getElements();
                    Object.values(interactions).forEach(interaction => {
                        if (interaction.attr('customWrapperClass')) {
                            setupXmlRenderHook(interaction);
                            ensureInteractionWrapper(interaction);
                        }
                    });
                }

                itemCreator.on('widgetCreated', (widget) => {
                    if (widget?.element?.attr('customWrapperClass')) {
                        setupXmlRenderHook(widget.element);
                        ensureInteractionWrapper(widget.element);
                    }
                });

                itemCreator.on('beforesave', ensureAllInteractionWrappers);
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

            // Remove editor listeners
            $('[data-html-editable]').each(function() {
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
            logger.info('InteractionSourceHandler destroyed');
        };

        return {
            init,
            destroy
        };
    };
});
