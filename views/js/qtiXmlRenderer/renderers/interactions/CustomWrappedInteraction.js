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

define(['lodash', 'core/logger'], function(_, loggerFactory) {
    'use strict';

    const logger = loggerFactory('taoQtiItem/qtiXmlRenderer/renderers/interactions/CustomWrappedInteraction');

    function wrapInteraction(interaction, interactionMarkup) {
        if (interaction._wrapperBeingApplied) {
            return interactionMarkup;
        }

        interaction._wrapperBeingApplied = true;

        try {
            let wrapperStructure = [];

            if (interaction.data && interaction.data('wrapperStructure')) {
                wrapperStructure = interaction.data('wrapperStructure');
            } else if (interaction.attr && interaction.attr('customWrappers')) {
                const classNames = interaction.attr('customWrappers').split(',');
                wrapperStructure = classNames.map(className => ({
                    className: className.trim(),
                    attributes: { class: className.trim() }
                }));
            } else if (interaction.attr && interaction.attr('customWrapperClass')) {
                const customClass = interaction.attr('customWrapperClass');
                wrapperStructure = [{
                    className: customClass,
                    attributes: { class: customClass }
                }];
            }

            if (!wrapperStructure || wrapperStructure.length === 0) {
                return interactionMarkup;
            }

            let wrappersToApply = wrapperStructure.slice(0);

            if (interaction && interaction.rootElement &&
                interaction.rootElement.bdy && interaction.rootElement.bdy.bdy) {
                const bodyContent = interaction.rootElement.bdy.bdy;
                const placeholder = '{{' + interaction.serial + '}}';

                if (bodyContent.includes(placeholder)) {
                    const bodyWrappers = extractClassesFromBody(bodyContent, placeholder);

                    if (bodyWrappers.length > 0) {
                        wrappersToApply = wrappersToApply.filter(wrapper =>
                            !bodyWrappers.includes(wrapper.className));

                        logger.debug('Avoiding duplicate wrappers', {
                            serial: interaction.serial,
                            bodyWrappers: bodyWrappers,
                            remainingToApply: wrappersToApply.map(w => w.className)
                        });
                    }
                }
            }

            let wrappedMarkup = interactionMarkup;

            for (let i = 0; i < wrappersToApply.length; i++) {
                const wrapper = wrappersToApply[i];
                if (!wrapper.className) continue;

                const attributes = wrapper.attributes || { class: wrapper.className };
                const attrStr = Object.entries(attributes)
                    .filter(([key, value]) => value !== undefined && value !== null)
                    .map(([key, value]) => `${key}="${value}"`)
                    .join(' ');

                wrappedMarkup = `<div ${attrStr}>${wrappedMarkup}</div>`;
            }

            return wrappedMarkup;
        } catch (error) {
            logger.error('Error applying interaction wrapper:', error);
            return interactionMarkup;
        } finally {
            setTimeout(() => {
                interaction._wrapperBeingApplied = false;
            }, 0);
        }
    }

    function extractClassesFromBody(bodyContent, placeholder) {
        const classes = [];

        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = bodyContent;

            const findPlaceholder = (node) => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.includes(placeholder)) {
                    return node;
                }

                if (node.childNodes) {
                    for (let i = 0; i < node.childNodes.length; i++) {
                        const found = findPlaceholder(node.childNodes[i]);
                        if (found) return found;
                    }
                }

                return null;
            };

            const placeholderNode = findPlaceholder(tempDiv);

            if (placeholderNode) {
                let currentNode = placeholderNode.parentNode;

                while (currentNode && currentNode !== tempDiv) {
                    if (currentNode.nodeType === Node.ELEMENT_NODE &&
                        currentNode.tagName.toLowerCase() === 'div' &&
                        currentNode.className) {

                        classes.push(currentNode.className);
                    }

                    currentNode = currentNode.parentNode;
                }
            }
        } catch (e) {
            logger.error('Error extracting classes from body:', e);
        }

        return classes;
    }

    return {
        wrapInteraction
    };
});
