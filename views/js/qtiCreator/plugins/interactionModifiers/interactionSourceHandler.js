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

    const CONSTANTS = {
        INTERACTION_PLACEHOLDER_FORMAT: '{{%s}}',
        INTERACTION_REGEX: /<interaction_([^>]+)>/,
        STRUCTURAL_CLASSES: ['grid-row', 'col-12', 'grid-container', 'grid-col']
    };

    const Utils = {
        formatPlaceholder(serial) {
            return CONSTANTS.INTERACTION_PLACEHOLDER_FORMAT.replace('%s', serial);
        },

        arraysEqual(arr1, arr2) {
            if (!arr1 || !arr2) return false;
            if (arr1.length !== arr2.length) return false;

            for (let i = 0; i < arr1.length; i++) {
                const obj1 = arr1[i];
                const obj2 = arr2[i];

                if (obj1.className !== obj2.className) return false;

                const attrs1 = obj1.attributes || {};
                const attrs2 = obj2.attributes || {};

                const keys1 = Object.keys(attrs1);
                const keys2 = Object.keys(attrs2);

                if (keys1.length !== keys2.length) return false;

                for (const key of keys1) {
                    if (attrs1[key] !== attrs2[key]) return false;
                }
            }

            return true;
        },

        createAttributesString(attributes, className) {
            if (!attributes) return className ? `class="${className}"` : '';

            const attrs = {...attributes};
            if (className) {
                attrs.class = className;
            }

            return Object.entries(attrs)
                .filter(([key]) => key !== 'class' || attrs[key])
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ');
        },

        isStructuralClass(className) {
            if (!className) return false;
            const classNames = className.split(/\s+/);
            return classNames.some(cls => CONSTANTS.STRUCTURAL_CLASSES.includes(cls));
        },

        findPlaceholderNode(rootElement, placeholder) {
            if (!rootElement || !placeholder) return null;

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

            findPlaceholder(rootElement);
            return placeholderNode;
        }
    };

    const InteractionFinder = {
        find(serial, interactions) {
            if (!serial) return null;

            if (interactions[serial]) {
                return interactions[serial];
            }

            const interactionKey = Object.keys(interactions).find(key => key.includes(serial));
            return interactionKey ? interactions[interactionKey] : null;
        }
    };

    const HtmlParser = {
        parseInteractionMatch(match) {
            if (!match || !match[1]) return {serial: null, isContainer: false};

            const fullTag = match[1];
            const isContainer = fullTag.includes('_container_');
            const parts = fullTag.split('_');
            const serial = parts[parts.length - 1];

            return {serial, isContainer};
        },

        extractAttributes(element) {
            const attributes = {};
            Array.from(element.attributes).forEach(attr => {
                attributes[attr.name] = attr.value;
            });
            return attributes;
        },

        parse(html) {
            if (!html) {
                throw new Error('Empty HTML content provided');
            }

            const normalizedHtml = html.replace(/\r\n/g, '\n').trim();

            try {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = normalizedHtml;

                const placeholderMatch = normalizedHtml.match(CONSTANTS.INTERACTION_REGEX);

                if (!placeholderMatch) {
                    return {
                        error: 'No interaction tag found in HTML content',
                        originalHtml: normalizedHtml,
                        wrapperStructure: []
                    };
                }

                const parsed = this.parseInteractionMatch(placeholderMatch);
                const serial = parsed.serial;
                const isTextContainer = parsed.isContainer;

                if (!serial) {
                    throw new Error('No interaction serial found in HTML content');
                }

                const placeholderTag = placeholderMatch[0];
                const allDivs = Array.from(tempDiv.querySelectorAll('div'));
                const containingDivs = allDivs.filter(div => {
                    return div.innerHTML.includes(placeholderTag.toLowerCase());
                });

                const sortedDivs = containingDivs.sort((a, b) => {
                    if (a.contains(b)) return 1;
                    if (b.contains(a)) return -1;
                    return 0;
                });

                const wrapperStructure = sortedDivs.map(div => ({
                    className: div.className,
                    attributes: this.extractAttributes(div)
                }));

                return {
                    serial,
                    wrapperStructure,
                    isTextContainer,
                    wrapperRemoved: wrapperStructure?.length === 0,
                    originalHtml: normalizedHtml
                };
            } catch (e) {
                logger.error('Error parsing HTML:', e);
                return {
                    error: e.message,
                    originalHtml: normalizedHtml,
                    wrapperStructure: []
                };
            }
        }
    };

    const Dom = {
        findWidgetElement(interaction) {
            if (!interaction?.data('widget')?.$container?.length) {
                return null;
            }

            return $(`.widget-box[data-serial="${interaction.serial}"]`);
        },

        prepareDomForInteractionBody(interaction) {
            const bodyObj = interaction['rootElement']?.bdy;
            if (!bodyObj?.bdy) {
                return { success: false };
            }

            const bodyContent = bodyObj.bdy;
            const placeholder = Utils.formatPlaceholder(interaction.serial);

            if (!bodyContent.includes(placeholder)) {
                return { success: false };
            }

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = bodyContent;

            const placeholderNode = Utils.findPlaceholderNode(tempDiv, placeholder);

            if (!placeholderNode) {
                return { success: false };
            }

            return {
                success: true,
                tempDiv,
                placeholder,
                placeholderNode,
                bodyContent,
                bodyObj
            };
        },

        applyWrapperStructure(interaction, wrapperStructure) {
            if (!wrapperStructure || !Array.isArray(wrapperStructure) || wrapperStructure.length === 0) {
                return;
            }

            const $widget = this.findWidgetElement(interaction);

            if (!$widget || !$widget.length) {
                return;
            }

            const appliedClasses = new Set();
            let $current = $widget;

            for (const wrapper of wrapperStructure) {
                let className = wrapper.className || '';

                if (className && appliedClasses.has(className)) {
                    continue;
                }

                if (className) {
                    appliedClasses.add(className);
                }

                const attrStr = Utils.createAttributesString(wrapper.attributes, className);
                $current.wrap(`<div ${attrStr}></div>`);
                $current = $current.parent();
            }
        },

        removeWrappers(interaction) {
            const $widget = this.findWidgetElement(interaction);

            if (!$widget || !$widget.length) {
                return;
            }

            const maxUnwraps = 10;
            let unwrapsPerformed = 0;

            while (unwrapsPerformed < maxUnwraps) {
                const $parent = $widget.parent();

                if (!$parent.length ||
                    $parent.is('body') ||
                    $parent.is('html') ||
                    CONSTANTS.STRUCTURAL_CLASSES.some(cls => $parent.hasClass(cls))) {
                    break;
                }

                $widget.unwrap();
                unwrapsPerformed++;
            }
        }
    };

    const Model = {
        storeWrapperStructure(interaction, wrapperStructure) {
            if (interaction.data) {
                interaction.data('wrapperStructure', wrapperStructure);
            }

            if (!wrapperStructure || !Array.isArray(wrapperStructure) || wrapperStructure.length === 0) {
                interaction.removeAttr('customWrappers');
                return;
            }

            const classNames = wrapperStructure
                .map(w => w.className || '')
                .filter(c => c);

            if (classNames.length > 0) {
                interaction.attr('customWrappers', classNames.join(','));
            } else {
                interaction.removeAttr('customWrappers');
            }
        },

        getWrapperStructure(interaction) {
            let wrapperStructure = [];

            if (interaction.data && interaction.data('wrapperStructure')) {
                wrapperStructure = interaction.data('wrapperStructure');
            }
            else if (interaction.attr && interaction.attr('customWrappers')) {
                const classNames = interaction.attr('customWrappers').split(',');
                wrapperStructure = classNames.map(className => ({
                    className: className.trim(),
                    attributes: {class: className.trim()}
                }));
            }

            if (wrapperStructure.length === 0) {
                return [];
            }

            return wrapperStructure.filter(wrapper => {
                if (!wrapper.className) return false;
                return !Utils.isStructuralClass(wrapper.className);
            });
        },

        removeWrapperFromBody(interaction) {
            const result = Dom.prepareDomForInteractionBody(interaction);
            if (!result.success) return false;

            const { tempDiv, placeholderNode, bodyObj } = result;

            const wrapperNodes = [];
            let currentNode = placeholderNode;

            while (currentNode && currentNode !== tempDiv) {
                currentNode = currentNode.parentNode;
                if (currentNode &&
                    currentNode.nodeType === Node.ELEMENT_NODE &&
                    currentNode.tagName.toLowerCase() === 'div') {
                    wrapperNodes.push(currentNode);
                }
            }

            if (wrapperNodes.length > 0) {
                const innermostWrapper = wrapperNodes[0];
                const fragment = document.createDocumentFragment();

                while (innermostWrapper.firstChild) {
                    fragment.appendChild(innermostWrapper.firstChild);
                }

                innermostWrapper.parentNode.replaceChild(fragment, innermostWrapper);
                bodyObj.bdy = tempDiv.innerHTML;
                return true;
            }

            return false;
        },

        extractWrapperStructureFromBody(interaction) {
            const result = Dom.prepareDomForInteractionBody(interaction);
            if (!result.success) return [];

            const { tempDiv, placeholderNode } = result;

            const wrapperDivs = [];
            let currentNode = placeholderNode;
            const processedClasses = new Set();

            while (currentNode && currentNode !== tempDiv) {
                currentNode = currentNode.parentNode;
                if (currentNode &&
                    currentNode.nodeType === Node.ELEMENT_NODE &&
                    currentNode.tagName.toLowerCase() === 'div') {

                    const className = currentNode.className.trim();
                    if (className && !processedClasses.has(className)) {
                        processedClasses.add(className);

                        const attributes = {};
                        Array.from(currentNode.attributes).forEach(attr => {
                            attributes[attr.name] = attr.value;
                        });

                        wrapperDivs.push({
                            className: className,
                            attributes: attributes
                        });
                    }
                }
            }

            return wrapperDivs.filter(wrapper => {
                if (!wrapper.className) return false;
                return !Utils.isStructuralClass(wrapper.className);
            });
        },

        setupRenderHook(interaction) {
            const wrapperStructure = this.getWrapperStructure(interaction);

            if (wrapperStructure.length === 0 || interaction._originalRenderer) {
                return;
            }

            interaction._originalRenderer = interaction.render;

            interaction.render = function () {
                const originalResult = this._originalRenderer.apply(this, arguments);
                return CustomWrappedInteraction.wrapInteraction(this, originalResult);
            };
        },

        removeRenderHook(interaction) {
            if (interaction._originalRenderer) {
                interaction.render = interaction._originalRenderer;
                interaction._originalRenderer = null;
            }
        },

        clearWrapperData(interaction) {
            interaction.removeAttr('customWrappers');

            if (interaction.data) {
                interaction.data('wrapperStructure', null);
            }
        }
    };

    const WrapperManager = {
        getState(interaction) {
            const wrapperStructure = Model.getWrapperStructure(interaction);
            const hasWrappersInBody = this.hasWrappersInBody(interaction);
            const hasWrappersInDom = this.hasWrappersInDOM(interaction);

            return {
                hasWrappers: wrapperStructure.length > 0,
                wrapperStructure: wrapperStructure,
                inBody: hasWrappersInBody,
                inDOM: hasWrappersInDom,
                isTextContainer: interaction && interaction.qtiClass === '_container'
            };
        },

        hasWrappersInBody(interaction) {
            const result = Dom.prepareDomForInteractionBody(interaction);
            if (!result.success) return false;

            const { tempDiv, placeholderNode } = result;
            let currentNode = placeholderNode;

            while (currentNode && currentNode !== tempDiv) {
                currentNode = currentNode.parentNode;
                if (currentNode &&
                    currentNode.nodeType === Node.ELEMENT_NODE &&
                    currentNode.tagName.toLowerCase() === 'div') {
                    return true;
                }
            }

            return false;
        },

        hasWrappersInDOM(interaction) {
            if (!interaction?.data('widget')?.$container?.length) {
                return false;
            }

            const $container = interaction.data('widget').$container;
            const wrapperStructure = Model.getWrapperStructure(interaction);

            if (wrapperStructure.length === 0) {
                return false;
            }

            let $element = $container;
            let wrappersFound = 0;
            const expectedWrappers = wrapperStructure.length;

            let parentsChecked = 0;
            const maxParentsToCheck = 10;

            while ($element.length && parentsChecked < maxParentsToCheck) {
                const $parent = $element.parent();
                if (!$parent.length || $parent.is('body') || $parent.is('html')) {
                    break;
                }

                if (CONSTANTS.STRUCTURAL_CLASSES.some(cls => $parent.hasClass(cls))) {
                    $element = $parent;
                    parentsChecked++;
                    continue;
                }

                for (const wrapper of wrapperStructure) {
                    if (!wrapper.className) continue;

                    const classSelector = '.' + wrapper.className.split(' ').join('.');
                    if ($parent.is(classSelector)) {
                        wrappersFound++;
                        wrapperStructure.splice(wrapperStructure.indexOf(wrapper), 1);
                        break;
                    }
                }

                $element = $parent;
                parentsChecked++;
            }

            return wrappersFound === expectedWrappers;
        },

        synchronize(interaction) {
            const state = this.getState(interaction);

            if (!state.hasWrappers && !state.inBody && !state.inDOM) {
                return;
            }

            if (state.inBody && !state.hasWrappers) {
                const extractedStructure = Model.extractWrapperStructureFromBody(interaction);
                if (extractedStructure.length > 0) {
                    Model.storeWrapperStructure(interaction, extractedStructure);
                }
            }

            if (state.hasWrappers) {
                Model.setupRenderHook(interaction);
            }

            if (state.hasWrappers && !state.inDOM) {
                Dom.removeWrappers(interaction);
                Dom.applyWrapperStructure(interaction, state.wrapperStructure);
            }
        }
    };

    const ChangeManager = {
        apply(interaction, parsedData) {
            if (!interaction) {
                return false;
            }

            const currentStructure = Model.getWrapperStructure(interaction);
            const newWrapperStructure = parsedData.wrapperStructure || [];
            const structureChanged = !Utils.arraysEqual(currentStructure, newWrapperStructure);

            if (newWrapperStructure.length > 0 && structureChanged) {
                Model.storeWrapperStructure(interaction, newWrapperStructure);
                Model.removeRenderHook(interaction);
                Dom.removeWrappers(interaction);
                Dom.applyWrapperStructure(interaction, newWrapperStructure);
                Model.setupRenderHook(interaction);
                return true;
            }

            else if (parsedData.wrapperRemoved && currentStructure.length > 0) {
                if (currentStructure.length > 1) {
                    const newStructure = currentStructure.slice(1);
                    Model.storeWrapperStructure(interaction, newStructure);
                    Model.removeRenderHook(interaction);
                    Dom.removeWrappers(interaction);
                    Model.removeWrapperFromBody(interaction);
                    Dom.applyWrapperStructure(interaction, newStructure);
                    Model.setupRenderHook(interaction);
                    return true;
                }
                else {
                    Model.removeRenderHook(interaction);
                    Dom.removeWrappers(interaction);
                    Model.removeWrapperFromBody(interaction);
                    Model.clearWrapperData(interaction);
                    return true;
                }
            }

            return false;
        }
    };

    return function interactionSourceHandlerFactory(options) {
        let initialized = false;
        const itemCreator = options?.itemCreator;

        const handleContentModification = (data) => {
            if (!data?.html || !itemCreator) {
                return;
            }

            try {
                const parsedData = HtmlParser.parse(data.html);
                const item = itemCreator.getItem();

                if (!item) {
                    logger.error('Item not found in itemCreator');
                    return;
                }

                const interactions = item.getElements();
                const interaction = InteractionFinder.find(parsedData.serial, interactions);

                if (!interaction) {
                    logger.error(`Could not find interaction with serial ${parsedData.serial}`);
                    return;
                }

                if (ChangeManager.apply(interaction, parsedData)) {
                    itemCreator.trigger('save', true);
                }
            } catch (error) {
                logger.error('Error handling content modification:', error.message);
            }
        };

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
            }

            initialized = true;
        };

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
            }

            initialized = false;
        };

        return {
            init,
            destroy
        };
    };
});
