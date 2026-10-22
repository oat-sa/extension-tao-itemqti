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
 * Copyright (c) 2014-2023 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Sam Sipasseuth <sam@taotesting.com>
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
import $ from 'jquery';
import _ from 'lodash';
import __ from 'i18n';
import features from 'services/features';
import strLimiter from 'util/strLimiter';
import template from 'taoQtiItem/qtiCommonRenderer/tpl/interactions/extendedTextInteraction';
import countTpl from 'taoQtiItem/qtiCommonRenderer/tpl/interactions/constraints/count';
import containerHelper from 'taoQtiItem/qtiCommonRenderer/helpers/container';
import instructionMgr from 'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager';
import ckEditor from 'ckeditor';
import ckConfigurator from 'taoQtiItem/qtiCommonRenderer/helpers/ckConfigurator';
import patternMaskHelper from 'taoQtiItem/qtiCommonRenderer/helpers/patternMask';
import { isSafari } from 'taoQtiItem/qtiCommonRenderer/helpers/userAgent';
import tooltip from 'ui/tooltip';
import converter from 'util/converter';
import loggerFactory from 'core/logger';
import {
    getIsWritingModeVerticalRl,
    supportsVerticalFormElement
} from 'taoQtiItem/qtiCommonRenderer/helpers/verticalWriting';

/**
 * Create a logger
 */
const logger = loggerFactory('taoQtiItem/qtiCommonRenderer/renderers/interactions/ExtendedTextInteraction.js');

const hideXhtmlConstraints = !features.isVisible(
    'taoQtiItem/creator/interaction/extendedText/property/xhtmlConstraints'
);
const hideXhtmlRecommendations = !features.isVisible(
    'taoQtiItem/creator/interaction/extendedText/property/xhtmlRecommendations'
);

/**
 * Init rendering, called after template injected into the DOM
 * All options are listed in the QTI v2.1 information model:
 * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10296
 *
 * @param {Object} interaction - the extended text interaction model
 * @returns {Promise} rendering is async
 */
function render(interaction) {
    return new Promise(function (resolve, reject) {
        let $el, expectedLength, minStrings, patternMask, placeholderType, editor;
        let _styleUpdater, themeLoaded, _getNumStrings;
        let $container = containerHelper.get(interaction);

        const multiple = _isMultiple(interaction);
        const limiter = inputLimiter(interaction);

        const placeholderText = interaction.attr('placeholderText');
        const serial = $container.data('serial');

        const getItemLanguage = () => {
            let itemLang = $container.closest('.qti-item').attr('lang');
            let itemLocale = itemLang && itemLang.split('-')[0];
            if (!itemLocale) {
                itemLang = window.document.documentElement.getAttribute('lang');
                itemLocale = itemLang && itemLang.split('-')[0];
            }
            return itemLocale;
        };

        const toolbarType = 'extendedText';
        const ckOptions = {
            resize_enabled: true,
            secure: location.protocol === 'https:',
            forceCustomDomain: true,
            language: getItemLanguage()
        };

        if (!multiple) {
            $el = $container.find('textarea');
            if (placeholderText) {
                $el.attr('placeholder', placeholderText);
            }
            if (_getFormat(interaction) === 'xhtml') {
                if (hideXhtmlConstraints && hideXhtmlRecommendations) {
                    $container.find('.text-counter').hide();
                }

                if (hideXhtmlConstraints) {
                    limiter.enabled = false;
                }

                _styleUpdater = function () {
                    let qtiItemStyle, $editorBody, qtiItem;

                    if (editor.document) {
                        qtiItem = $('.qti-item').get(0);
                        qtiItemStyle = qtiItem.currentStyle || window.getComputedStyle(qtiItem);

                        if (editor.document.$ && editor.document.$.body) {
                            $editorBody = $(editor.document.$.body);
                        } else {
                            $editorBody = $(editor.document.getBody().$);
                        }

                        $editorBody.css({
                            'background-color': 'transparent',
                            color: qtiItemStyle.color
                        });
                    }
                };
                themeLoaded = function () {
                    _styleUpdater();
                };

                editor = _setUpCKEditor(interaction, ckOptions);
                if (!editor) {
                    reject('Unable to instantiate ckEditor');
                }

                editor.on('instanceReady', function () {
                    _styleUpdater();

                    //TAO-6409, disable navigation from cke toolbar
                    if (editor.container && editor.container.$) {
                        $(editor.container.$).addClass('no-key-navigation');
                    }

                    //it seems there's still something done after loaded, so resolved must be defered
                    _.delay(resolve, 300);
                });
                if (editor.status === 'ready' || editor.status === 'loaded') {
                    _.defer(resolve);
                }
                editor.on('configLoaded', function () {
                    editor.config = ckConfigurator.getConfig(editor, toolbarType, ckOptions);

                    if (limiter.enabled) {
                        limiter.listenTextInput();
                    }
                });
                editor.on('change', function () {
                    containerHelper.triggerResponseChangeEvent(interaction, {});
                });

                $(document).on('themechange.themeloader', themeLoaded);
            } else {
                const isVertical = getIsWritingModeVerticalRl($container);
                if (isVertical) {
                    const textareaSupportsVertical = supportsVerticalFormElement();
                    if (!textareaSupportsVertical) {
                        $el.addClass('vertical-unsupported');
                    }
                }

                $el.on('keyup.commonRenderer change.commonRenderer', function () {
                    containerHelper.triggerResponseChangeEvent(interaction, {});
                });

                if (limiter.enabled) {
                    limiter.listenTextInput();
                }

                interaction.safariVerticalRlPatch = _patchSafariVerticalRl($el, serial);

                resolve();
            }

            //multiple inputs
        } else {
            $el = $container.find('input');
            minStrings = interaction.attr('minStrings');
            expectedLength = interaction.attr('expectedLength');
            patternMask = interaction.attr('patternMask');

            //setting the checking for minimum number of answers
            if (minStrings) {
                //get the number of filled inputs
                _getNumStrings = function ($element) {
                    let num = 0;
                    $element.each(function () {
                        if ($(this).val() !== '') {
                            num++;
                        }
                    });

                    return num;
                };

                minStrings = parseInt(minStrings, 10);
                if (minStrings > 0) {
                    $el.on('blur.commonRenderer', function () {
                        setTimeout(function () {
                            //checking if the user was clicked outside of the input fields

                            //TODO remove notifications in favor of instructions

                            if (!$el.is(':focus') && _getNumStrings($el) < minStrings) {
                                instructionMgr.appendNotification(
                                    interaction,
                                    `${__('The minimum number of answers is ')} : ${minStrings}`,
                                    'warning'
                                );
                            }
                        }, 100);
                    });
                }
            }

            //set the fields width
            if (expectedLength) {
                expectedLength = parseInt(expectedLength, 10);

                if (expectedLength > 0) {
                    $el.each(function () {
                        $(this).css('width', `${expectedLength}em`);
                    });
                }
            }

            //set the fields pattern mask
            if (patternMask) {
                $el.each(function () {
                    _setPattern($(this), patternMask);
                });
            }

            //set the fields placeholder
            if (placeholderText) {
                /**
                 * The type of the fileds placeholder:
                 * multiple - set placeholder for each field
                 * first - set placeholder only for first field
                 * none - dont set placeholder
                 */
                placeholderType = 'first';

                if (placeholderType === 'multiple') {
                    $el.each(function () {
                        $(this).attr('placeholder', placeholderText);
                    });
                } else if (placeholderType === 'first') {
                    $el.first().attr('placeholder', placeholderText);
                }
            }
            resolve();
        }
    });
}

/**
 * Reset the textarea / ckEditor
 * @param {Object} interaction - the extended text interaction model
 */
function resetResponse(interaction) {
    if (_getFormat(interaction) === 'xhtml') {
        _getCKEditor(interaction).setData('');
    } else {
        containerHelper.get(interaction).find('input, textarea').val('');
        if (interaction.safariVerticalRlPatch) {
            interaction.safariVerticalRlPatch.syncValue();
        }
    }
}

/**
 * Set the response to the rendered interaction.
 *
 * The response format follows the IMS PCI recommendation :
 * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
 *
 * Available base types are defined in the QTI v2.1 information model:
 * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10296
 *
 * @param {Object} interaction - the extended text interaction model
 * @param {object} response
 */
function setResponse(interaction, response) {
    const _setMultipleVal = (identifier, value) => {
        interaction.getContainer().find(`#${identifier}`).val(value);
    };

    const baseType = interaction.getResponseDeclaration().attr('baseType');

    if (response.base === null && Object.keys(response).length === 1) {
        response = { base: { string: '' } };
    }

    if (response.base && typeof response.base[baseType] !== 'undefined') {
        setText(interaction, response.base[baseType]);
    } else if (response.list && response.list[baseType]) {
        for (let i in response.list[baseType]) {
            const serial = typeof response.list.serial === 'undefined' ? '' : response.list.serial[i];
            _setMultipleVal(`${serial}_${i}`, response.list[baseType][i]);
        }
    } else {
        throw new Error('wrong response format in argument.');
    }
}

/**
 * Return the response of the rendered interaction
 *
 * The response format follows the IMS PCI recommendation :
 * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
 *
 * Available base types are defined in the QTI v2.1 information model:
 * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10296
 *
 * @param {Object} interaction - the extended text interaction model
 * @returns {object}
 */
function getResponse(interaction) {
    const $container = containerHelper.get(interaction);
    const attributes = interaction.getAttributes();
    const responseDeclaration = interaction.getResponseDeclaration();
    const baseType = responseDeclaration.attr('baseType');
    const numericBase = attributes.base || 10;
    const patternMask = attributes.patternMask;
    const multiple = !!(
        attributes.maxStrings &&
        (responseDeclaration.attr('cardinality') === 'multiple' ||
            responseDeclaration.attr('cardinality') === 'ordered')
    );
    const ret = multiple ? { list: {} } : { base: {} };
    let values;
    let value = '';

    if (multiple) {
        values = [];

        $container.find('input').each(function (i) {
            const editorValue = $(this).val();
            const isInvalid = patternMask && $(this).hasClass('field-error');

            if (isInvalid) {
                values[i] = '';
            } else if (attributes.placeholderText && value === attributes.placeholderText) {
                values[i] = '';
            } else {
                const convertedValue = converter.convert(editorValue);
                if (baseType === 'integer') {
                    values[i] = parseInt(convertedValue, numericBase);
                    values[i] = isNaN(values[i]) ? '' : values[i];
                } else if (baseType === 'float') {
                    values[i] = parseFloat(convertedValue);
                    values[i] = isNaN(values[i]) ? '' : values[i];
                } else if (baseType === 'string') {
                    values[i] = convertedValue;
                }
            }
        });

        ret.list[baseType] = values;
    } else {
        const isInvalid = patternMask && $container.hasClass('invalid');

        if (isInvalid) {
            value = '';
        } else if (attributes.placeholderText && _getTextareaValue(interaction) === attributes.placeholderText) {
            value = '';
        } else {
            if (baseType === 'integer') {
                value = parseInt(converter.convert(_getTextareaValue(interaction)), numericBase);
            } else if (baseType === 'float') {
                value = converter.convert(_getTextareaValue(interaction));
            } else if (baseType === 'string') {
                value = converter.convert(_getTextareaValue(interaction, true));
            }
        }

        ret.base[baseType] = isNaN(value) && typeof value === 'number' ? '' : value;
    }

    return ret;
}

/**
 * Creates an input limiter object
 * @param {Object} interaction - the extended text interaction
 * @returns {Object} the limiter
 */
function inputLimiter(interaction) {
    const $container = containerHelper.get(interaction);
    const expectedLength = interaction.attr('expectedLength');
    const expectedLines = interaction.attr('expectedLines');
    const patternMask = interaction.attr('patternMask');
    const isCke = _getFormat(interaction) === 'xhtml';
    let patternRegEx;
    let $textarea,
        $charsCounter,
        $wordsCounter,
        maxWords,
        maxLength,
        $maxLengthCounter,
        $maxWordsCounter,
        $expectedLengthCounter;
    let enabled = false;

    if (expectedLength || expectedLines || patternMask) {
        enabled = true;
        $textarea = $('.text-container', $container);
        $charsCounter = $('.count-chars', $container);
        $wordsCounter = $('.count-words', $container);
        $maxLengthCounter = $('.count-max-length', $container);
        $maxWordsCounter = $('.count-max-words', $container);
        $expectedLengthCounter = $('.count-expected-length', $container);

        if (patternMask !== '') {
            maxWords = parseInt(patternMaskHelper.parsePattern(patternMask, 'words'), 10);
            maxLength = parseInt(patternMaskHelper.parsePattern(patternMask, 'chars'), 10);
            maxWords = _.isNaN(maxWords) ? 0 : maxWords;
            maxLength = _.isNaN(maxLength) ? 0 : maxLength;
            if (!maxLength && !maxWords) {
                patternRegEx = true;
            }
            $maxLengthCounter.html(maxLength);
            $maxWordsCounter.text(maxWords);
        }
        if (expectedLength || expectedLines) {
            $expectedLengthCounter.html($expectedLengthCounter.text());
        }
    }

    const validator = patternMask ? patternMaskHelper.createValidator(patternMask) : null;

    /**
     * The limiter instance
     */
    const limiter = {
        /**
         * Is the limiter enabled regarding the interaction configuration
         */
        enabled,

        /**
         * Listen for text input into the interaction and limit it if necessary
         */
        listenTextInput() {
            const ignoreKeyCodes = [
                8, // backspace
                13, // enter
                16, // shift
                17, // control
                46, // delete
                37, // arrow left
                38, // arrow up
                39, // arrow right
                40, // arrow down
                35, // home
                36, // end

                // ckeditor specific:
                1114177, // home
                3342401, // Shift + home
                1114181, // end
                3342405, // Shift + end

                2228232, // Shift + backspace
                2228261, // Shift + arrow left
                4456485, // Alt   + arrow left
                2228262, // Shift + arrow up
                2228263, // Shift + arrow right
                4456487, // Alt   + arrow right
                2228264, // Shift + arrow down
                2228237, // Shift + enter

                1114120, // Ctrl + backspace
                1114177, // Ctrl + a
                1114202, // Ctrl + z
                1114200 // Ctrl + x
            ];
            const spaceKeyCodes = [
                32, // space
                13, // enter
                2228237 // shift + enter in ckEditor
            ];
            let isComposing = false;
            let hasCompositionJustEnded = false;
            let valueBeforeComposition = null;
            let selectionStartBeforeComposition = null;
            let selectionEndBeforeComposition = null;

            const acceptKeyCode = keyCode => ignoreKeyCodes.includes(keyCode);
            const emptyOrSpace = txt => (txt && txt.trim() === '') || /\^s*$/.test(txt);
            const hasSpace = txt => /\s+/.test(txt);
            const getCharBefore = (str, pos) => str && str.substring(Math.max(0, pos - 1), pos);
            const getCharAfter = (str, pos) => str && str.substring(pos, pos + 1);
            const noSpaceNode = node =>
                node.type === ckEditor.NODE_TEXT || (!node.isBlockBoundary() && node.getName() !== 'br');
            const getPreviousNotEmptyNode = range => {
                let node = range.getPreviousNode();
                /**
                 * The previous node isn't always the right one, because it can be an empty <b> tag for example.
                 * So we need to get the previous node until we find a non empty one, but we should not go above body.
                 */
                while (node && (node.isEmpty ? node.isEmpty() : node.getText() === '')) {
                    let previousSourceNode = node.getPreviousSourceNode();
                    let nodeElement = previousSourceNode;
                    if (previousSourceNode && previousSourceNode.type === ckEditor.NODE_TEXT) {
                        nodeElement = previousSourceNode.parentNode || previousSourceNode.$.parentNode;
                    }
                    if (
                        !nodeElement ||
                        !nodeElement.ownerDocument ||
                        !nodeElement.ownerDocument.body.contains(nodeElement)
                    ) {
                        return null;
                    }
                    node = previousSourceNode;
                }
                return node;
            };
            const getNextNotEmptyNode = range => {
                let node = range.getNextNode();
                while (node && (node.isEmpty ? node.isEmpty() : node.getText() === '')) {
                    let nextSourceNode = node.getNextSourceNode();
                    let nodeElement = nextSourceNode;
                    if (nextSourceNode && nextSourceNode.type === ckEditor.NODE_TEXT) {
                        nodeElement = nextSourceNode.parentNode || nextSourceNode.$.parentNode;
                    }
                    if (
                        !nodeElement ||
                        !nodeElement.ownerDocument ||
                        !nodeElement.ownerDocument.body.contains(nodeElement)
                    ) {
                        return null;
                    }
                    node = nextSourceNode;
                }
                return node;
            };
            const cancelEvent = e => {
                if (e.cancel) {
                    e.cancel();
                } else {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
                return false;
            };
            const invalidToolip = tooltip.error($container, __('This is not a valid answer'), {
                position: 'bottom',
                trigger: 'manual'
            });
            const patternHandler = function patternHandler(e) {
                if (isComposing || hasCompositionJustEnded) {
                    // IME composing fires keydown/keyup events
                    hasCompositionJustEnded = false;
                    return;
                }

                if (patternRegEx) {
                    let newValue;
                    if (isCke) {
                        newValue = this.getData();
                    } else {
                        newValue = e.currentTarget.value;
                    }

                    if (!newValue) {
                        return false;
                    }
                    _.debounce(function () {
                        const isValid = validator.isValid(newValue);
                        if (!isValid) {
                            $container.addClass('invalid');
                            $container.show();
                            invalidToolip.show();
                            containerHelper.triggerResponseChangeEvent(interaction);
                        } else {
                            $container.removeClass('invalid');
                            invalidToolip.dispose();
                        }
                    }, 400)();
                }
            };

            /**
             * This part works on keyboard input
             *
             * @param {Event} e
             * @returns {boolean}
             */
            const keyLimitHandler = function (e) {
                if (isComposing) {
                    return;
                }
                // Safari on OS X may send a keydown of 229 after compositionend
                if (e.which !== 229) {
                    hasCompositionJustEnded = false;
                }

                const keyCode = e.data ? e.data.keyCode : e.which;
                let wordsCount = maxWords && this.getWordsCount();
                let charsCount = maxLength && this.getCharsCount();

                if (maxWords && wordsCount >= maxWords) {
                    let left, right, middle;

                    if (isCke) {
                        const editor = _getCKEditor(interaction);
                        const sel = editor.getSelection();
                        const range = sel.getRanges()[0];

                        if (range.startContainer && range.startContainer.type === ckEditor.NODE_TEXT) {
                            left = getCharBefore(range.startContainer.getText(), range.startOffset);
                        }
                        if (!left) {
                            const node = getPreviousNotEmptyNode(range);
                            if (node && noSpaceNode(node)) {
                                const text = node.getText();
                                left = getCharBefore(text, text && text.length);
                            } else {
                                left = ' ';
                            }
                        }

                        if (range.endContainer && range.endContainer.type === ckEditor.NODE_TEXT) {
                            right = getCharAfter(range.endContainer.getText(), range.endOffset);
                        }
                        if (!right) {
                            const node = getNextNotEmptyNode(range);
                            if (node && noSpaceNode(node)) {
                                right = getCharAfter(node.getText(), 0);
                            } else {
                                right = ' ';
                            }
                        }

                        middle = sel.getSelectedText();
                    } else {
                        const { selectionStart, selectionEnd, value } = $textarea[0];
                        left = getCharBefore(value, selectionStart);
                        right = getCharAfter(value, selectionEnd);
                        middle = value.substring(selectionStart, selectionEnd);
                    }

                    // Will prevent the keystroke:
                    // - IF there is a word part before and after the selection,
                    //   AND the selection does not contain spaces,
                    //   AND the keystroke is either a space or enter
                    // - IF there is no word part before and after the selection,
                    //   AND the selection is empty,
                    //   AND the keystroke is not from the list of accepted codes,
                    //   AND the keystroke is not a space
                    if (
                        (!emptyOrSpace(left) &&
                            !emptyOrSpace(right) &&
                            !hasSpace(middle) &&
                            spaceKeyCodes.includes(keyCode)) ||
                        (emptyOrSpace(left) &&
                            emptyOrSpace(right) &&
                            !middle &&
                            !acceptKeyCode(keyCode) &&
                            keyCode !== 32)
                    ) {
                        return cancelEvent(e);
                    }
                }

                if (validator) {
                    const currentValue = isCke ? _getCKEditor(interaction).getData() : $textarea[0].value;
                    const isEnterKey = keyCode === 13 || keyCode === 2228237;

                    if (validator.shouldBlockInput(currentValue, keyCode, isEnterKey)) {
                        if (!isCke && !validator.isValid(currentValue)) {
                            const textarea = $textarea[0];
                            textarea.value = this._truncateToLimit(currentValue, validator);
                            $textarea.trigger('inputlimiter-limited');
                            textarea.focus();
                            _.defer(() => this.updateCounter());
                        }
                        return cancelEvent(e);
                    }
                } else if (maxLength || maxWords) {
                    charsCount = maxLength && this.getCharsCount();
                    wordsCount = maxWords && this.getWordsCount();
                    const isEnterKey = keyCode === 13 || keyCode === 2228237;

                    if (maxLength && charsCount >= maxLength && !acceptKeyCode(keyCode) && !isEnterKey) {
                        // Check if user has selected text that would be replaced
                        let hasSelection = false;

                        if (isCke) {
                            const editor = _getCKEditor(interaction);
                            const selection = editor.getSelection();
                            const selectedText = selection ? selection.getSelectedText() : '';
                            hasSelection = selectedText && selectedText.length > 0;
                        } else {
                            hasSelection = $textarea[0].selectionStart !== $textarea[0].selectionEnd;
                        }

                        if (!hasSelection) {
                            return cancelEvent(e);
                        }
                    }

                    if (maxWords && wordsCount >= maxWords && !acceptKeyCode(keyCode)) {
                        return cancelEvent(e);
                    }
                }

                _.defer(() => this.updateCounter());
            };

            /**
             * This part works on drop or paste
             * @param {Event} e
             * @returns {boolean}
             */
            const nonKeyLimitHandler = function (e) {
                let newValue;

                if (typeof $(e.target).attr('data-clipboard') === 'string') {
                    newValue = $(e.target).attr('data-clipboard');
                } else if (isCke) {
                    // cke has its own object structure
                    newValue = e.data.dataValue;
                } else {
                    // covers input via paste or drop
                    newValue = e.originalEvent.clipboardData
                        ? e.originalEvent.clipboardData.getData('text')
                        : e.originalEvent.dataTransfer.getData('text') ||
                        e.originalEvent.dataTransfer.getData('text/plain') ||
                        '';
                }

                // prevent insertion of non-limited data
                cancelEvent(e);

                if (!newValue) {
                    return false;
                }

                if (validator) {
                    const currentValue = isCke ? _getCKEditor(interaction).getData() : $textarea[0].value;
                    newValue = validator.limitPastedContent(currentValue, newValue);
                } else {
                    // Legacy logic for old-style limits
                    if (maxWords) {
                        newValue = strLimiter.limitByWordCount(newValue, maxWords - this.getWordsCount());
                    } else if (maxLength) {
                        newValue = strLimiter.limitByCharCount(newValue, maxLength - this.getCharsCount());
                    }
                }

                // insert the cut-off text
                if (isCke) {
                    _getCKEditor(interaction).insertHtml(newValue);
                } else {
                    let elements = containerHelper.get(interaction).find('textarea');
                    let el = elements[0];
                    let { selectionStart: start, selectionEnd: end, value: text } = el;
                    elements.val(text.substring(0, start) + newValue + text.substring(end, text.length));
                    el.focus();
                    el.selectionStart = start + newValue.length;
                    el.selectionEnd = el.selectionStart;
                    elements.trigger('inputlimiter-limited');
                }

                _.defer(() => this.updateCounter());
            };

            const handleCompositionStart = function (e) {
                // Check if we should block composition entirely
                if (_getFormat(interaction) !== 'xhtml') {
                    const currentValue = $textarea[0].value;
                    const selectionStart = $textarea[0].selectionStart;
                    const selectionEnd = $textarea[0].selectionEnd;
                    const hasSelection = selectionEnd > selectionStart;

                    let shouldBlock = false;
                    if (validator) {
                        if (!validator.isValid(currentValue) && !hasSelection) {
                            shouldBlock = true;
                        }
                    } else if (maxLength) {
                        const currentLength = currentValue.replace(/[\r\n]/g, '').length;
                        if (currentLength >= maxLength && !hasSelection) {
                            shouldBlock = true;
                        }
                    }

                    // If we should block, prevent the composition and cancel the event
                    if (shouldBlock) {
                        e.preventDefault();
                        $textarea.trigger('inputlimiter-limited');
                        return false;
                    }

                    // Store the value and selection range before composition starts
                    valueBeforeComposition = currentValue;
                    selectionStartBeforeComposition = selectionStart;
                    selectionEndBeforeComposition = selectionEnd;
                }

                isComposing = true;
                return e;
            };

            const handleCompositionEnd = function (e) {
                isComposing = false;
                hasCompositionJustEnded = true;
                if (_getFormat(interaction) !== 'xhtml') {
                    const currentValue = $textarea[0].value;
                    let shouldRevert = false;
                    let shouldTruncate = false;

                    // Check if there was a selection before composition
                    const hadSelection =
                        selectionStartBeforeComposition !== null &&
                        selectionEndBeforeComposition !== null &&
                        selectionEndBeforeComposition > selectionStartBeforeComposition;

                    // Check if the composition result exceeds the limit
                    if (validator && !validator.isValid(currentValue)) {
                        // Count chars excluding newlines (matching backend behavior)
                        const originalLength = valueBeforeComposition
                            ? valueBeforeComposition.replace(/[\r\n]/g, '').length
                            : 0;
                        const currentLength = this.getCharsCount();

                        // If we were at/above limit with no selection, block insertion entirely
                        if (!hadSelection && originalLength >= validator.getLimit() && currentLength > originalLength) {
                            shouldRevert = true;
                        } else {
                            // Otherwise truncate to limit
                            shouldTruncate = true;
                        }
                    } else if (maxLength) {
                        // Count chars excluding newlines (matching backend behavior)
                        const originalLength = valueBeforeComposition
                            ? valueBeforeComposition.replace(/[\r\n]/g, '').length
                            : 0;
                        const currentLength = this.getCharsCount();

                        // If we were at/above limit with no selection, block any insertion that increases count
                        if (!hadSelection && originalLength >= maxLength && currentLength > originalLength) {
                            shouldRevert = true;
                        }
                        // Otherwise if over limit, truncate to limit
                        else if (currentLength > maxLength) {
                            shouldTruncate = true;
                        }
                    }

                    // Revert: restore previous value (block insertion entirely)
                    if (shouldRevert && valueBeforeComposition !== null) {
                        $textarea[0].value = valueBeforeComposition;
                        // Restore cursor position
                        if (selectionStartBeforeComposition !== null) {
                            $textarea[0].setSelectionRange(
                                selectionStartBeforeComposition,
                                selectionStartBeforeComposition
                            );
                        }
                        $textarea.trigger('inputlimiter-limited');
                        _.defer(() => this.updateCounter());
                    } else if (shouldTruncate) {
                        let truncatedValue;
                        if (validator) {
                            truncatedValue = this._truncateToLimit(currentValue, validator);
                        } else if (maxLength) {
                            let count = 0;
                            let result = '';
                            for (let i = 0; i < currentValue.length && count < maxLength; i++) {
                                result += currentValue[i];
                                if (currentValue[i] !== '\n' && currentValue[i] !== '\r') {
                                    count++;
                                }
                            }
                            truncatedValue = result;
                        }
                        $textarea[0].value = truncatedValue;
                        // Place cursor at end of truncated content
                        $textarea[0].setSelectionRange(truncatedValue.length, truncatedValue.length);
                        $textarea.trigger('inputlimiter-limited');
                        _.defer(() => this.updateCounter());
                    }

                    // Clear stored values
                    valueBeforeComposition = null;
                    selectionStartBeforeComposition = null;
                    selectionEndBeforeComposition = null;
                }
                _.defer(() => this.updateCounter());
                return e;
            };

            const handleBeforeInput = function (e) {
                _.defer(() => this.updateCounter());
                return e;
            };

            if (isCke) {
                const editor = _getCKEditor(interaction);

                if (validator || maxLength) {
                    let previousSnapshot = editor.getSnapshot();
                    const CKEditorKeyLimit = function () {
                        const range = this.createRange();
                        const currentContent = editor.getData();
                        let isValid = true;

                        if (validator) {
                            isValid = validator.isValid(currentContent);
                        } else if (limiter.maxLength) {
                            isValid = limiter.getCharsCount() <= limiter.maxLength;
                        }

                        if (!isValid) {
                            const editable = this.editable();
                            editable.setData('', true);
                            editable.setData(previousSnapshot, true);
                            range.moveToElementEditablePosition(editable, true);
                            editor.getSelection().selectRanges([range]);
                            _.defer(() => limiter.updateCounter());
                        } else {
                            previousSnapshot = editor.getSnapshot();
                            _.defer(() => limiter.updateCounter());
                        }
                    };
                    editor.on('instanceReady', function () {
                        const editorInstance = this;
                        const editableElement = editor.editable().$;
                        editableElement.addEventListener('compositionend', function () {
                            CKEditorKeyLimit.call(editorInstance);
                            _.defer(() => limiter.updateCounter());
                        });
                    });
                    editor.on('key', CKEditorKeyLimit);
                    editor.on('blur', CKEditorKeyLimit);
                }
                editor.on('key', keyLimitHandler);
                editor.on('change', evt => {
                    patternHandler(evt);
                    _.defer(() => this.updateCounter());
                });
                editor.on('paste', nonKeyLimitHandler);
                // @todo: drop requires cke 4.5
                // cke.on('drop', nonKeyLimitHandler);
            } else {
                const handleBlur = function (e) {
                    // Skip truncation during IME composition
                    if (isComposing) {
                        return;
                    }

                    if (validator) {
                        const currentValue = $textarea[0].value;
                        if (!validator.isValid(currentValue)) {
                            $textarea[0].value = this._truncateToLimit(currentValue, validator);
                            $textarea.trigger('inputlimiter-limited');
                            _.defer(() => this.updateCounter());
                        }
                    } else if (maxLength) {
                        const currentLength = this.getCharsCount();
                        if (currentLength > maxLength) {
                            const currentValue = $textarea[0].value;
                            $textarea[0].value = currentValue.substring(0, maxLength);
                            $textarea.trigger('inputlimiter-limited');
                            _.defer(() => this.updateCounter());
                        }
                    }
                };

                $textarea
                    .on('beforeinput.commonRenderer', handleBeforeInput.bind(this))
                    .on(
                        'input.commonRenderer',
                        function () {
                            if (!isComposing && validator) {
                                const currentValue = $textarea[0].value;
                                if (!validator.isValid(currentValue)) {
                                    $textarea[0].value = this._truncateToLimit(currentValue, validator);
                                    $textarea.trigger('inputlimiter-limited');
                                }
                            }
                            _.defer(() => this.updateCounter());
                        }.bind(this)
                    )
                    .on('compositionstart.commonRenderer', handleCompositionStart)
                    .on('compositionend.commonRenderer', handleCompositionEnd.bind(this))
                    .on('keyup.commonRenderer', patternHandler)
                    .on('keydown.commonRenderer', keyLimitHandler.bind(this))
                    .on('paste.commonRenderer drop.commonRenderer', nonKeyLimitHandler.bind(this))
                    .on('blur.commonRenderer', handleBlur.bind(this));
            }
        },

        /**
         * Get the number of words that are actually written in the response field
         * Updated to use backend-compatible word counting when patternMask defines word limits
         * @returns {Number} number of words
         */
        getWordsCount() {
            const value = _getTextareaValue(interaction) || '';
            if (_.isEmpty(value)) {
                return 0;
            }

            if (patternMask && patternMaskHelper.isMaxEntryRestriction(patternMask)) {
                return value
                    .trim()
                    .split(/[\s.,:;?!&#%\/*+=]+/)
                    .filter(Boolean).length;
            }

            return value.trim().replace(/\s+/gi, ' ').split(' ').length;
        },

        /**
         * Get the number of characters that are actually written in the response field
         * Updated to NOT count newlines when patternMask is character-based
         * This matches backend behavior where newlines are removed before validation
         * @returns {Number} number of characters
         */
        getCharsCount() {
            const value = _getTextareaValue(interaction) || '';

            // For patternMask character limits, don't count newlines
            // This matches backend behavior where newlines are removed before validation
            if (patternMask && patternMaskHelper.parsePattern(patternMask, 'chars')) {
                return value.replace(/[\r\n]/g, '').length;
            }

            // Fallback to original logic for backwards compatibility when no patternMask
            return value.replace(/[\r\n]{1}\xA0[\r\n]{1}/gm, '\r').replace(/[\r\n]+/gm, '').length;
        },

        /**
         * Update the counter element
         */
        updateCounter() {
            $charsCounter.html(this.getCharsCount());
            $wordsCounter.text(this.getWordsCount());
        },

        _truncateToLimit(currentValue, validator) {
            const limit = validator.getLimit();
            const currentCount = validator.getCount(currentValue);

            if (!limit || currentCount <= limit) return currentValue;

            if (validator.type === 'character') {
                let truncated = '';
                let count = 0;
                for (let i = 0; i < currentValue.length && count < limit; i++) {
                    truncated += currentValue[i];
                    if (currentValue[i] !== '\n' && currentValue[i] !== '\r') {
                        count++;
                    }
                }
                return truncated;
            } else if (validator.type === 'word') {
                const words = currentValue
                    .trim()
                    .split(/[\s.,:;?!&#%\/*+=]+/)
                    .filter(Boolean);
                return words.slice(0, limit).join(' ');
            } else {
                return currentValue.substring(0, limit);
            }
        },

        maxLength
    };

    return limiter;
}

/**
 * In Safari & `writing-mode: vertical-rl`, for *multiline* text:
 *   - when user is typing, browser doesn't always repaint, so user doesn't see what he's typing.
 *   - when user clicks (or key-navigates) inside text, cursor is shown in wrong position.
 *     `textarea.selectionStart/textarea.selectionEnd` are set correctly, just visually cursor is painted in a wrong place.
 * Create a workaround:
 *   - force browser to repaint on every typed letter, using a trick
 *   - hide native cursor, show custom div as a cursor instead
 *   - position this custom cursor:
 *     - create a shadow div contianing same text as textarea (<textarea>ab</textarea> -> <shadow><span>a</span><span>b</span></shadow>)
 *     - shadow div should also have same size, font, and text-wrapping rules.
 *     - when after click/key-nav browser changes `textarea.selectionStart` to N, use shadow to understand what are the coordinates of the Nth letter of text
 *     - then draw custom cursor at those coordinates.
 * Unsolved issues:
 *   - when user clicks between lines (in a space left by the difference of line-height & font-size), `textarea.selectionStart` is wrong, cursor jumps randomly
 *   - when user clicks on empty space left in the line, or at empty lines, `textarea.selectionStart` is wrong, cursor jumps randomly
 *   - key-navigation is not intuitive (left/right still jump letters, and up/down - lines, as in horizontal-tb)
 * @param {JQuery} $textarea
 * @param {string} serial
 * @returns {Object|null} if safari & vertical-rl,`{ syncValue: () => void, destroy: () => void }` . Otherwise `null`.
 */
function _patchSafariVerticalRl($textarea, serial) {
    if (!getIsWritingModeVerticalRl($textarea) || !isSafari() || !supportsVerticalFormElement()) {
        return null;
    }

    $textarea.addClass('hide-caret');

    const $shadow = $('<div>', { class: 'shadow-textarea' });
    const $cursor = $('<div>', { class: 'extendedText-shadow-caret' });
    $(document.body).append($cursor);
    $textarea.after($('<div>', { class: 'shadow-container' }).append($shadow));

    let repaintIdx = 0;

    function setShadowString(str) {
        const shadowString = [...str, ' ']
            .map(i => {
                if (i === '\n') {
                    return '<br/>';
                } else if (i === ' ') {
                    return `<span>&#x20;</span>`;
                } else {
                    return `<span>${i}</span>`;
                }
            })
            .join('');

        $shadow.get(0).innerHTML = shadowString;
    }

    function forceTextareaRepaint() {
        if (repaintIdx % 2 === 0) {
            $textarea.get(0).style.opacity = '99%';
        } else {
            $textarea.get(0).style.opacity = '97%';
        }
        repaintIdx++;
    }

    function showHideCursor(show) {
        if (show && ($cursor.get(0).style.display === 'none' || !$cursor.get(0).style.display)) {
            $cursor.get(0).style.display = 'block';
        }
        if (!show && ($cursor.get(0).style.display !== 'none' || !$cursor.get(0).style.display)) {
            $cursor.get(0).style.display = 'none';
        }
    }

    function positionCursor() {
        const selectionStart = $textarea.get(0).selectionStart;
        const selectionEnd = $textarea.get(0).selectionEnd;
        //range selection seems to be painted fine
        if (selectionStart === selectionEnd && document.activeElement === $textarea.get(0)) {
            const shadowLetterEl = $shadow.get(0).children[selectionStart];

            const shadowLetterRect = shadowLetterEl.getBoundingClientRect();
            const shadowRect = $shadow.get(0).getBoundingClientRect();
            const textareaRect = $textarea.get(0).getBoundingClientRect();
            const cursorRect = $cursor.get(0).getBoundingClientRect();
            const bodyRect = document.body.getBoundingClientRect();

            //iPad, when keyboard opened: 'position:fixed' is off because of addressbar height,
            //  so for cursor use 'position:absolute' from 'body', and 'bodyRect.top' (='-window.scrollY')
            const cursorTop = textareaRect.top + (shadowLetterRect.top - shadowRect.top) - bodyRect.top;
            const cursorLeft =
                textareaRect.left -
                $textarea.get(0).scrollLeft +
                (shadowLetterRect.left - shadowRect.left + $shadow.get(0).scrollLeft);

            const cursorTopStyle = `${Math.round(cursorTop)}px`;
            const cursorLeftStyle = `${Math.round(cursorLeft)}px`;
            if ($cursor.get(0).style.top !== cursorTopStyle) {
                $cursor.get(0).style.top = cursorTopStyle;
            }
            if ($cursor.get(0).style.left !== cursorLeftStyle) {
                $cursor.get(0).style.left = cursorLeftStyle;
            }

            //hide if out of bounds (after scroll for example)
            if (
                cursorLeft > textareaRect.left + textareaRect.width ||
                cursorLeft + cursorRect.width < textareaRect.left
            ) {
                showHideCursor(false);
            } else {
                showHideCursor(true);
            }
        } else {
            showHideCursor(false);
        }
    }

    function syncShadowStyles() {
        const textareaStyles = getComputedStyle($textarea.get(0));
        const shadowStyles = getComputedStyle($shadow.get(0));
        for (const propName of [
            'width',
            'height',
            'padding',
            'writing-mode',
            'dir',
            'line-height',
            'font-family',
            'font-size',
            'word-break',
            'white-space',
            'overflow-wrap',
            'hyphens',
            'tab-size'
        ]) {
            const textareaPropVal = textareaStyles.getPropertyValue(propName);
            const shadowPropVal = shadowStyles.getPropertyValue(propName);
            if (textareaPropVal !== shadowPropVal) {
                $shadow.get(0).style[propName] = textareaPropVal;
            }
        }
    }

    const debouncedPositionCursor = _.debounce(() => {
        if (document.activeElement === $textarea.get(0)) {
            requestAnimationFrame(() => {
                positionCursor();
            });
        }
    }, 100);

    $textarea.on('input', e => {
        forceTextareaRepaint();
        setShadowString(e.target.value);
        positionCursor();
    });
    $textarea.on('inputlimiter-limited', () => {
        forceTextareaRepaint();
        setShadowString($textarea.get(0).value);
        positionCursor();
    });
    $textarea.on('selectionchange', () => {
        positionCursor();
    });
    $textarea.on('focus', () => {
        syncShadowStyles();
        positionCursor();
    });
    $textarea.on('blur', () => {
        showHideCursor(false);
    });
    $textarea.on('scroll', () => {
        requestAnimationFrame(() => {
            positionCursor();
        });
    });

    //scroll containers
    $('.qti-itemBody, .tao-overflow-y').on(`scroll.exttext-verticalsafari-${serial}`, debouncedPositionCursor);
    //document is scrolled on iPad when keyboard opens
    $(document).on(`scroll.exttext-verticalsafari-${serial}`, debouncedPositionCursor);
    $(window).on(`resize.exttext-verticalsafari-${serial}`, debouncedPositionCursor);

    $(document).on(`themeapplied.exttext-verticalsafari-${serial}`, () => {
        syncShadowStyles();
        positionCursor();
    });

    syncShadowStyles();
    setShadowString($textarea.get(0).value);

    const api = {
        syncValue: function () {
            setShadowString($textarea.get(0).value);
            positionCursor();
        },
        destroy: function () {
            $(document).off(`themeapplied.exttext-verticalsafari-${serial}`);
            $(window).off(`resize.exttext-verticalsafari-${serial}`);
            $('.qti-itemBody, .tao-overflow-y').off(`scroll.exttext-verticalsafari-${serial}`);
            $cursor.remove();
        }
    };
    return api;
}

/**
 * return the value of the textarea or ckeditor data
 * @param  {Object} interaction
 * @param  {Boolean} raw Tells if the returned data does not have to be filtered (i.e. XHTML tags not removed)
 * @returns {String} the value
 */
function _getTextareaValue(interaction, raw) {
    if (_getFormat(interaction) === 'xhtml') {
        return _ckEditorData(interaction, raw);
    } else {
        return containerHelper.get(interaction).find('textarea').val();
    }
}

/**
 * Setting the pattern mask for the input, for browsers which doesn't support this feature
 * @param {jQuery} $element
 * @param {string} pattern
 */
function _setPattern($element, pattern) {
    const validator = patternMaskHelper.createValidator(pattern);

    //test when some data is entering in the input field
    //@todo plug the validator + tooltip
    $element.on('keyup.commonRenderer', function () {
        $element.removeClass('field-error');
        if (!validator.isValid($element.val())) {
            $element.addClass('field-error');
        }
    });
}

/**
 * Whether or not multiple strings are expected from the candidate to
 * compose a valid response.
 *
 * @param {Object} interaction - the extended text interaction model
 * @returns {Boolean} true if a multiple
 */
function _isMultiple(interaction) {
    const attributes = interaction.getAttributes();
    const response = interaction.getResponseDeclaration();
    return !!(
        attributes.maxStrings &&
        (response.attr('cardinality') === 'multiple' || response.attr('cardinality') === 'ordered')
    );
}

/**
 * Instantiate CkEditor for the interaction
 *
 * @param {Object} interaction - the extended text interaction model
 * @param {Object} [options= {}] - the CKEditor configuration options
 * @returns {Object} the ckEditor instance (or you'll be in trouble
 */
function _setUpCKEditor(interaction, options) {
    const $container = containerHelper.get(interaction);
    const editor = ckEditor.replace($container.find('.text-container')[0], options || {});
    if (editor) {
        $container.data('editor', editor.name);
        return editor;
    }
}

/**
 * Destroy CKEditor
 *
 * @param {Object} interaction - the extended text interaction model
 */
function _destroyCkEditor(interaction) {
    const $container = containerHelper.get(interaction);
    const name = $container.data('editor');
    let editor;
    if (name) {
        editor = ckEditor.instances[name];
    }
    if (editor) {
        editor.destroy();
        $container.removeData('editor');
    }
}

/**
 * Gets the CKEditor instance
 * @param {Object} interaction - the extended text interaction model
 * @returns {Object}  CKEditor instance
 */
function _getCKEditor(interaction) {
    const $container = containerHelper.get(interaction);
    const name = $container.data('editor');

    return ckEditor.instances[name];
}

/**
 * get the text content of the ckEditor ( not the entire html )
 * @param  {object} interaction the interaction
 * @param  {Boolean} raw Tells if the returned data does not have to be filtered (i.e. XHTML tags not removed)
 * @returns {string}             text content of the ckEditor
 */
function _ckEditorData(interaction, raw) {
    const editor = _getCKEditor(interaction);
    let data = (editor && editor.getData()) || '';

    if (!raw) {
        data = _stripTags(data);
    }

    return data;
}

/**
 * Remove HTML tags from a string
 * @param {String} str
 * @returns {String}
 */
function _stripTags(str) {
    const tempNode = document.createElement('div');
    tempNode.innerHTML = str;
    return tempNode.textContent;
}

/**
 * Get the interaction format
 * @param {Object} interaction - the extended text interaction model
 * @returns {String} format in 'plain', 'xhtml', 'preformatted'
 */
function _getFormat(interaction) {
    const format = interaction.attr('format');
    if (['plain', 'xhtml', 'preformatted'].includes(format)) {
        return format;
    }
    return 'plain';
}

function enable(interaction) {
    const $container = containerHelper.get(interaction);
    let editor;

    $container.find('input, textarea').removeAttr('disabled');

    if (_getFormat(interaction) === 'xhtml') {
        editor = _getCKEditor(interaction);
        if (editor) {
            if (editor.status === 'ready') {
                editor.setReadOnly(false);
            } else {
                editor.readOnly = false;
            }
        }
    }
}

function disable(interaction) {
    const $container = containerHelper.get(interaction);
    let editor;

    $container.find('input, textarea').attr('disabled', 'disabled');

    if (_getFormat(interaction) === 'xhtml') {
        editor = _getCKEditor(interaction);
        if (editor) {
            if (editor.status === 'ready') {
                editor.setReadOnly(true);
            } else {
                editor.readOnly = true;
            }
        }
    }
}

function clearText(interaction) {
    setText(interaction, '');
}

function setText(interaction, text) {
    const limiter = inputLimiter(interaction);
    if (_getFormat(interaction) === 'xhtml') {
        try {
            _getCKEditor(interaction).setData(text, function () {
                if (limiter.enabled) {
                    limiter.updateCounter();
                }
            });
        } catch (e) {
            logger.warn(`setText error ${e}!`);
        }
    } else {
        containerHelper.get(interaction).find('textarea').val(text);
        if (limiter.enabled) {
            limiter.updateCounter();
        }
        if (interaction.safariVerticalRlPatch) {
            interaction.safariVerticalRlPatch.syncValue();
        }
    }
}

/**
 * Clean interaction destroy
 * @param {Object} interaction
 */
function destroy(interaction) {
    const $container = containerHelper.get(interaction);
    const $el = $container.find('input, textarea');

    if (_getFormat(interaction) === 'xhtml') {
        _destroyCkEditor(interaction);
    }

    //remove event
    $el.off('.commonRenderer');
    $(document).off('.commonRenderer');

    if (interaction.safariVerticalRlPatch) {
        interaction.safariVerticalRlPatch.destroy();
    }

    //remove instructions
    instructionMgr.removeInstructions(interaction);

    //remove all references to a cache container
    containerHelper.reset(interaction);
}

/**
 * Set the interaction state. It could be done anytime with any state.
 *
 * @param {Object} interaction - the interaction instance
 * @param {Object} state - the interaction state
 */
function setState(interaction, state) {
    if (_.isObject(state)) {
        if (state.response) {
            try {
                interaction.setResponse(state.response);
            } catch (e) {
                interaction.resetResponse();
                throw e;
            }
        }
    }
}

/**
 * Get the interaction state.
 *
 * @param {Object} interaction - the interaction instance
 * @returns {Object} the interaction current state
 */
function getState(interaction) {
    const state = {};
    const response = interaction.getResponse();

    if (response) {
        state.response = response;
    }
    return state;
}

/**
 * Hydrates the dataset for the interaction with respect to its attributes.
 *
 * @param {object} interaction - the interaction instance
 * @param {object} data - the default data object
 * @returns {object} the hydrated data set
 */
function getData(interaction, data) {
    const pattern = interaction.attr('patternMask');
    const maxWords = parseInt(patternMaskHelper.parsePattern(pattern, 'words'), 10);
    const maxLength = parseInt(patternMaskHelper.parsePattern(pattern, 'chars'), 10);
    const expectedLines = parseInt(interaction.attr('expectedLines'), 10);
    const expectedLength = !isNaN(expectedLines)
        ? expectedLines * 72
        : parseInt(interaction.attr('expectedLength'), 10);

    // Build DOM placeholders, this is needed to properly assemble the constraint hints
    // The interaction will later rely on this to bind the values
    const countChars = countTpl({ name: 'count-chars', value: 0 });
    const countWords = countTpl({ name: 'count-words', value: 0 });
    const countExpectedLength = countTpl({ name: 'count-expected-length', value: expectedLength });
    const countMaxLength = countTpl({ name: 'count-max-length', value: maxLength });
    const countMaxWords = countTpl({ name: 'count-max-words', value: maxWords });

    return _.merge(data || {}, {
        maxWords: !isNaN(maxWords) ? maxWords : 0,
        maxLength: !isNaN(maxLength) ? maxLength : 0,
        attributes: !isNaN(expectedLines) ? { expectedLength } : void 0,
        // Build the constraint hints from translated text and DOM placeholders
        // The template will render them as it, then the interaction will update the value from the binding
        constraintHints: {
            expectedLength: __('%s of %s characters recommended.', countChars, countExpectedLength),
            maxLength: __('%s of %s characters maximum.', countChars, countMaxLength),
            maxWords: __('%s of %s words maximum.', countWords, countMaxWords)
        }
    });
}

/**
 * Expose the common renderer for the extended text interaction
 * @exports qtiCommonRenderer/renderers/interactions/ExtendedTextInteraction
 */
export default {
    qtiClass: 'extendedTextInteraction',
    getContainer: containerHelper.get,
    template,
    render,
    setResponse,
    getResponse,
    getData,
    resetResponse,
    destroy,
    getState,
    setState,
    enable,
    disable,
    clearText,
    setText,
    inputLimiter
};
