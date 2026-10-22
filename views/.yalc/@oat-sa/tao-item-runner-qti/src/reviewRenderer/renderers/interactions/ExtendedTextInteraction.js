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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Ansul Sharma <ansultaotesting.com>
 */
import $ from 'jquery';
import _ from 'lodash';
import template from 'taoQtiItem/reviewRenderer/tpl/interactions/extendedTextInteraction';
import patternMaskHelper from 'taoQtiItem/qtiCommonRenderer/helpers/patternMask';
import extendedTextInteraction from 'taoQtiItem/qtiCommonRenderer/renderers/interactions/ExtendedTextInteraction';
import containerHelper from 'taoQtiItem/qtiCommonRenderer/helpers/container';

/**
 * * Disables the ckEditor and renders the interaction as usual
 *
 * @param {Object} interaction
 * @returns {*}
 */
const render = interaction => {
    return new Promise(resolve => {
        let $el, expectedLength, minStrings, patternMask, placeholderType;
        const $container = containerHelper.get(interaction);
        const multiple = _isMultiple(interaction);
        const placeholderText = interaction.attr('placeholderText');

        if (!multiple) {
            $el = $container.find('.text-container');
            if (placeholderText) {
                $el.attr('placeholder', placeholderText);
            }
            $el.on('keyup.commonRenderer change.commonRenderer', () => {
                containerHelper.triggerResponseChangeEvent(interaction, {});
            });

            resolve();

            //multiple inputs
        } else {
            $el = $container.find('.text-container');
            minStrings = interaction.attr('minStrings');
            expectedLength = interaction.attr('expectedLength');
            patternMask = interaction.attr('patternMask');

            //set the fields width
            if (expectedLength) {
                expectedLength = parseInt(expectedLength, 10);

                if (expectedLength > 0) {
                    $el.each(function () {
                        $(this).css('width', expectedLength + 'em');
                    });
                }
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
};

/**
 * Get the interaction format
 * @param {Object} interaction - the extended text interaction model
 * @returns {String} format in 'plain', 'xhtml', 'preformatted'
 */
const _getFormat = interaction => {
    const format = interaction.attr('format');
    if (['plain', 'xhtml', 'preformatted'].includes(format)) {
        return format;
    }
    return 'plain';
};

/**
 * return the value of the textarea or ckeditor data
 * @param  {Object} interaction
 * @param  {Boolean} raw Tells if the returned data does not have to be filtered (i.e. XHTML tags not removed)
 * @return {String}             the value
 */
const _getTextContainerValue = interaction => {
    if (_getFormat(interaction) === 'xhtml') {
        return containerHelper.get(interaction).find('.text-container')[0].innerHTML;
    } else {
        return containerHelper.get(interaction).find('.text-container')[0].innerText;
    }
};

/**
 * Whether or not multiple strings are expected from the candidate to
 * compose a valid response.
 *
 * @param {Object} interaction - the extended text interaction model
 * @returns {Boolean} true if a multiple
 */
const _isMultiple = interaction => {
    const attributes = interaction.getAttributes();
    const response = interaction.getResponseDeclaration();
    return !!(
        attributes.maxStrings &&
        (response.attr('cardinality') === 'multiple' || response.attr('cardinality') === 'ordered')
    );
};

/**
 * Creates an input limiter object
 * @param {Object} interaction - the extended text interaction
 * @returns {Object} the limiter
 */
const inputLimiter = interaction => {
    const $container = containerHelper.get(interaction);
    const expectedLength = interaction.attr('expectedLength');
    const expectedLines = interaction.attr('expectedLines');
    const patternMask = interaction.attr('patternMask');
    let patternRegEx;
    let $textarea, $charsCounter, $wordsCounter, maxWords, maxLength, $maxLengthCounter, $maxWordsCounter;
    let enabled = false;

    if (expectedLength || expectedLines || patternMask) {
        enabled = true;

        $textarea = $('.text-container', $container);
        $charsCounter = $('.count-chars', $container);
        $wordsCounter = $('.count-words', $container);
        $maxLengthCounter = $('.count-max-length', $container);
        $maxWordsCounter = $('.count-max-words', $container);

        if (patternMask !== '') {
            maxWords = parseInt(patternMaskHelper.parsePattern(patternMask, 'words'), 10);
            maxLength = parseInt(patternMaskHelper.parsePattern(patternMask, 'chars'), 10);
            maxWords = _.isNaN(maxWords) ? 0 : maxWords;
            maxLength = _.isNaN(maxLength) ? 0 : maxLength;
            if (!maxLength && !maxWords) {
                patternRegEx = new RegExp(patternMask);
            }
            $maxLengthCounter.text(maxLength);
            $maxWordsCounter.text(maxWords);
        }
    }

    /**
     * The limiter instance
     */
    const limiter = {
        /**
         * Is the limiter enabled regarding the interaction configuration
         */
        enabled: enabled,

        /**
         * Get the number of words that are actually written in the response field
         * @return {Number} number of words
         */
        getWordsCount: () => {
            let value = _getTextContainerValue(interaction) || '';
            if (_.isEmpty(value)) {
                return 0;
            }
            // convert it to text
            if (_getFormat(interaction) === 'xhtml') {
                const div = document.createElement('div');
                div.innerHTML = value;
                value = div.textContent || div.innerText || '';
            }
            // leading and trailing white space don't qualify as words
            return value.trim().replace(/\s+/gi, ' ').split(' ').length;
        },

        /**
         * Get the number of characters that are actually written in the response field
         * @return {Number} number of characters
         */
        getCharsCount: () => {
            let value = _getTextContainerValue(interaction) || '';

            // convert it to text
            if (_getFormat(interaction) === 'xhtml') {
                const div = document.createElement('div');
                div.innerHTML = value;
                value = div.textContent || div.innerText || '';
            }
            // remove NO-BREAK SPACE in empty lines added and all new line symbols
            return value.replace(/[\r\n]{1}\xA0[\r\n]{1}/gm, '\r').replace(/[\r\n]+/gm, '').length;
        },

        /**
         * Update the counter element
         */
        updateCounter: function udpateCounter() {
            $charsCounter.text(this.getCharsCount());
            $wordsCounter.text(this.getWordsCount());
        }
    };

    return limiter;
};

/**
 * Reset the textarea / ckEditor
 * @param {Object} interaction - the extended text interaction model
 */
const resetResponse = interaction => {
    containerHelper.get(interaction).find('.text-container')[0].innerText = '';
};

const setText = (interaction, text) => {
    if (['plain', 'preformatted'].includes(_getFormat(interaction))) {
        containerHelper.get(interaction).find('.text-container')[0].innerText = text;
    } else {
        containerHelper.get(interaction).find('.text-container')[0].innerHTML = text;
    }

    const limiter = inputLimiter(interaction);
    if (limiter.enabled) {
        limiter.updateCounter();
    }
};

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
const getResponse = interaction => {
    const $container = containerHelper.get(interaction);
    const attributes = interaction.getAttributes();
    const responseDeclaration = interaction.getResponseDeclaration();
    const baseType = responseDeclaration.attr('baseType');
    const numericBase = attributes.base || 10;
    const multiple = _isMultiple(interaction);
    let ret = multiple ? { list: {} } : { base: {} };
    let values;
    let value = '';

    if (multiple) {
        values = [];

        $container.find('.text-container').each(function (i) {
            const $el = $(this);

            if (attributes.placeholderText && $el.innerText === attributes.placeholderText) {
                values[i] = '';
            } else {
                if (baseType === 'integer') {
                    values[i] = parseInt($el.innerText, numericBase);
                    values[i] = isNaN(values[i]) ? '' : values[i];
                } else if (baseType === 'float') {
                    values[i] = parseFloat($el.innerText);
                    values[i] = isNaN(values[i]) ? '' : values[i];
                } else if (baseType === 'string') {
                    values[i] = $el.innerText;
                }
            }
        });

        ret.list[baseType] = values;
    } else {
        if (attributes.placeholderText && _getTextContainerValue(interaction) === attributes.placeholderText) {
            value = '';
        } else {
            if (baseType === 'integer') {
                value = parseInt(_getTextContainerValue(interaction), numericBase);
            } else if (baseType === 'float') {
                value = parseFloat(_getTextContainerValue(interaction));
            } else if (baseType === 'string') {
                value = _getTextContainerValue(interaction, true);
            }
        }

        ret.base[baseType] = isNaN(value) && typeof value === 'number' ? '' : value;
    }

    return ret;
};

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
const setResponse = (interaction, response) => {
    const _setMultipleVal = (identifier, value) => {
        interaction.getContainer().find(`#${identifier}`)[0].innerHTML = value;
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
};

/**
 * Expose the common renderer for the extended text interaction
 * @exports qtiCommonRenderer/renderers/interactions/ExtendedTextInteraction
 */

export default Object.assign({}, extendedTextInteraction, {
    template,
    render,
    getResponse,
    setResponse,
    resetResponse,
    setText,
    inputLimiter
});
