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
 * Copyright (c) 2014-2025 (original work) Open Assessment Technologies SA ;
 */

var regexChar = /\^\[\\s\\S\]\{\d+\,(\d+)\}\$/,
    regexWords = /\^\(\?\:\(\?\:\[\^\\s\\:\\!\\\?\\\;\\\…\\\€\]\+\)\[\\s\\:\\!\\\?\\;\\\…\\\€\]\*\)\{\d+\,(\d+)\}\$/;

var patternMaskHelper = {
    /**
     * Parse the pattern string and according to the given type, try to extract the associate number
     *
     * @param {String} pattern - the pattern string to be parsed
     * @param {String} type - words or chars
     * @returns {String|null} - extracted limit or null
     */
    parsePattern: function parsePattern(pattern, type) {
        if (!pattern) return null;

        if (type === 'words') {
            var result = pattern.match(regexWords);
            return result && result.length > 1 ? result[1] : null;
        } else if (type === 'chars') {
            var result = pattern.match(regexChar);
            return result && result.length > 1 ? result[1] : null;
        }
        return null;
    },

    /**
     * Create a validator for any pattern type
     * @param {String} pattern - the pattern mask from interaction
     * @returns {Object} - validator object with all needed methods
     */
    createValidator: function createValidator(pattern) {
        var patternInfo = this._analyzePattern(pattern);

        return {
            type: patternInfo.type,
            limit: patternInfo.limit,

            isValid: function(text) {
                return patternInfo.validator(text || '');
            },

            getCount: function(text) {
                return patternInfo.counter(text || '');
            },

            getLimit: function() {
                return patternInfo.limit;
            },

            shouldBlockInput: function(currentText, keyCode, isEnterKey) {
                return patternInfo.blocker(currentText || '', keyCode, isEnterKey);
            },

            limitPastedContent: function(currentText, pastedText) {
                return patternInfo.limiter(currentText || '', pastedText || '');
            }
        };
    },

    /**
     * Analyze pattern and return type-specific handlers
     * @private
     */
    _analyzePattern: function _analyzePattern(pattern) {
        if (!pattern) {
            return this._createNullValidator();
        }

        // Character limit: ^[\s\S]{0,10}$ or ^[\s\S]{min,max}$
        var charMatch = pattern.match(/^\^\[\\s\\S\]\{(\d+),(\d+)\}\$$/);
        if (charMatch) {
            var limit = parseInt(charMatch[2], 10);
            return this._createCharValidator(limit);
        }

        // Word limit: complex word pattern
        if (pattern.includes('(?:(?:[^\\s\\:\\!\\?\\;\\…\\€]+)[\\s\\:\\!\\?\\;\\…\\€]*)')) {
            var wordMatch = pattern.match(/\{(\d+),(\d+)\}/);
            if (wordMatch) {
                var wordLimit = parseInt(wordMatch[2], 10);
                return this._createWordValidator(wordLimit);
            }
        }

        // Custom pattern - anything else
        return this._createCustomValidator(pattern);
    },

    /**
     * Type-specific validator factories
     * @private
     */
    _createCharValidator: function(limit) {
        var self = this;
        return {
            type: 'character',
            limit: limit,
            getLimit: function() {
                return limit;
            },
            getCount: function(text) {
                return text.replace(/[\r\n]/g, '').length;
            },
            isValid: function(text) {
                var normalizedText = text.replace(/[\r\n]/g, '');
                return normalizedText.length <= limit;
            },
            shouldBlockInput: function(currentText, keyCode, isEnterKey) {
                // Allow navigation keys regardless of limit
                if (self._isNavigationKey(keyCode)) {
                    return false;
                }

                var normalizedLength = currentText.replace(/[\r\n]/g, '').length;

                // If we're already at or over the limit
                if (normalizedLength >= limit) {
                    // Allow Enter key (newlines don't count toward limit)
                    if (isEnterKey || keyCode === 13) {
                        return false;
                    }
                    // Block all other non-navigation keys
                    return true;
                }

                return false;
            },
            limitPastedContent: function(currentText, pastedText) {
                var normalizedCurrentLength = currentText.replace(/[\r\n]/g, '').length;
                var remaining = limit - normalizedCurrentLength;
                if (remaining <= 0) return '';

                // Limit pasted content by visible character count (newlines don't count)
                var normalizedPasted = pastedText.replace(/[\r\n]/g, '');
                if (normalizedPasted.length <= remaining) {
                    return pastedText; // Return original with newlines preserved
                }

                // Truncate while preserving newlines when possible
                var truncated = '';
                var normalizedCount = 0;
                for (var i = 0; i < pastedText.length && normalizedCount < remaining; i++) {
                    truncated += pastedText[i];
                    if (pastedText[i] !== '\n') {
                        normalizedCount++;
                    }
                }
                return truncated;
            },
            // Legacy method names for backward compatibility
            validator: function(text) {
                var normalizedText = text.replace(/[\r\n]/g, '');
                return normalizedText.length <= limit;
            },
            counter: function(text) {
                return text.replace(/[\r\n]/g, '').length;
            },
            blocker: function(currentText, keyCode, isEnterKey) {
                if (self._isNavigationKey(keyCode)) {
                    return false;
                }

                var normalizedLength = currentText.replace(/[\r\n]/g, '').length;

                if (normalizedLength >= limit) {
                    return !(isEnterKey || keyCode === 13);
                }

                return false;
            },
            limiter: function(currentText, pastedText) {
                var normalizedCurrentLength = currentText.replace(/[\r\n]/g, '').length;
                var remaining = limit - normalizedCurrentLength;
                if (remaining <= 0) return '';

                var normalizedPasted = pastedText.replace(/[\r\n]/g, '');
                if (normalizedPasted.length <= remaining) {
                    return pastedText;
                }

                var truncated = '';
                var normalizedCount = 0;
                for (var i = 0; i < pastedText.length && normalizedCount < remaining; i++) {
                    truncated += pastedText[i];
                    if (pastedText[i] !== '\n') {
                        normalizedCount++;
                    }
                }
                return truncated;
            }
        };
    },

    _createWordValidator: function(limit) {
        var self = this;
        return {
            type: 'word',
            limit: limit,
            getLimit: function() {
                return limit;
            },
            getCount: function(text) {
                return self._countWords(text);
            },
            isValid: function(text) {
                return self._countWords(text) <= limit;
            },
            shouldBlockInput: function(currentText, keyCode, isEnterKey) {
                var currentWords = self._countWords(currentText);
                if (currentWords < limit) return false;

                if (isEnterKey) return true;
                if (self._isNavigationKey(keyCode)) return false;

                // Allow whitespace characters (space, tab, etc.) but block new words
                if (keyCode === 32 || keyCode === 9) return false; // space, tab

                // Block only if text ends with whitespace AND we're typing non-whitespace
                // This prevents starting new words after spaces, but allows continuing after newlines
                return /[ \t]$/.test(currentText);
            },
            limitPastedContent: function(currentText, pastedText) {
                var currentWords = self._countWords(currentText);
                var remainingWords = limit - currentWords;
                if (remainingWords <= 0) return '';

                var pastedWords = self._getWords(pastedText);
                return pastedWords.slice(0, remainingWords).join(' ');
            },
            // Legacy method names for backward compatibility
            validator: function(text) {
                return self._countWords(text) <= limit;
            },
            counter: function(text) {
                return self._countWords(text);
            },
            blocker: function(currentText, keyCode, isEnterKey) {
                var currentWords = self._countWords(currentText);
                if (currentWords < limit) return false;

                if (isEnterKey) return true;
                if (self._isNavigationKey(keyCode)) return false;

                if (keyCode === 32 || keyCode === 9) return false;
                return /[ \t]$/.test(currentText);
            },
            limiter: function(currentText, pastedText) {
                var currentWords = self._countWords(currentText);
                var remainingWords = limit - currentWords;
                if (remainingWords <= 0) return '';

                var pastedWords = self._getWords(pastedText);
                return pastedWords.slice(0, remainingWords).join(' ');
            }
        };
    },

    _createCustomValidator: function(pattern) {
        var regex = this._prepareRegex(pattern);
        return {
            type: 'custom',
            limit: null,
            getLimit: function() { return null; },
            getCount: function() { return 0; },
            isValid: function(text) {
                return regex ? regex.test(text) : true;
            },
            shouldBlockInput: function() { return false; },
            limitPastedContent: function(currentText, pastedText) {
                return regex && regex.test(currentText + pastedText) ? pastedText : '';
            },
            // Legacy methods
            validator: function(text) {
                return regex ? regex.test(text) : true;
            },
            counter: function() { return 0; },
            blocker: function() { return false; },
            limiter: function(currentText, pastedText) {
                return regex && regex.test(currentText + pastedText) ? pastedText : '';
            }
        };
    },

    _createNullValidator: function() {
        return {
            type: 'none',
            limit: null,
            getLimit: function() { return null; },
            getCount: function() { return 0; },
            isValid: function() { return true; },
            shouldBlockInput: function() { return false; },
            limitPastedContent: function(currentText, pastedText) { return pastedText; },
            // Legacy methods
            validator: function() { return true; },
            counter: function() { return 0; },
            blocker: function() { return false; },
            limiter: function(currentText, pastedText) { return pastedText; }
        };
    },

    /**
     * Used externally
     * @param max
     * @return {string}
     */
    createMaxCharPattern: function createMaxCharPattern(max) {
        return '^[\\s\\S]{0,' + max.toString() + '}$';
    },

    /**
     * Helper functions
     * @private
     */
    _countWords: function(text) {
        return text.trim() ? this._getWords(text).length : 0;
    },

    _getWords: function(text) {
        return text.trim().split(/[\s.,:;?!&#%\/*+=]+/).filter(Boolean);
    },

    _isNavigationKey: function(keyCode) {
        return keyCode === 8 || keyCode === 46 ||
            (keyCode >= 35 && keyCode <= 40) ||
            (keyCode >= 112 && keyCode <= 123);
    },

    _prepareRegex: function(pattern) {
        if (!pattern) return null;

        try {
            var cleanPattern = pattern.replace(/^\^/, '').replace(/\$$/, '');

            var flags = 'u';
            try {
                new RegExp('.', 's');
                flags = 'su';
            } catch (e) {
            }

            return new RegExp('^' + cleanPattern + '$', flags);
        } catch (e) {
            console.warn('Invalid patternMask pattern:', pattern, e);
            return null;
        }
    },

    isMaxEntryRestriction: function isMaxEntryRestriction(pattern) {
        var info = this._analyzePattern(pattern);
        return info.type === 'word';
    },

    /**
     * Used outside the project
     * @param max
     * @return {string}
     */
    createMaxWordPattern: function createMaxWordPattern(max) {
        return '^(?:(?:[^\\s\\:\\!\\?\\;\\…\\€]+)[\\s\\:\\!\\?\\;\\…\\€]*){0,' + max.toString() + '}$';
    }
};

export default patternMaskHelper;
