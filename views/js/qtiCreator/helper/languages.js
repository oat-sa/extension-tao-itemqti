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
 * Copyright (c) 2015-2022 (original work) Open Assessment Technologies SA ;
 */

/**
 * Languages utils to handle getting list of available language name, code and direction.
 * Note:
 * v1 example: [{"ar-arb": "Arabic"}, ...]
 * v2 example: [{code: "ar-arb", label: "Arabic", orientation: "rtl", uri: "http://www.tao.lu/Ontologies/TAO.rdf#Langar-arb"}, ...]
 */
define(['util/url', 'core/dataProvider/request'], function (urlUtil, request) {
    'use strict';

    const languagesUrl = urlUtil.route('index', 'Languages', 'tao');
    const headers = { 'Accept-version': 'v2' };

    let languagesRequest = null;

    /**
     * Format languages to v1 format to avoid breaking changes in existing code,
     * Warning Please avoid usage of this method for new development.
     * uses legacyLanguagesData as a cache
     *
     * @param {Array} languages languages v2 format
     * @returns {Array} languages v1 data format
     */
    const useLegacyFormatting = languages => {
        return languages.reduce((memo, lang) => {
            memo[lang.code] = lang.label;

            return memo;
        }, {});
    };

    /**
     * Format languages to CKE format
     * example: lang
     * uses legacyLanguagesData as a cache
     *
     * @param {Array} languages languages v2 format
     * @returns {Array} languages v1 data format
     */
    const useCKEFormatting = languages => {
        return languages.map(lang => {
            return `${lang.code}:${lang.label}:${lang.orientation}`;
        });
    };

    /**
     * Create a Promise request getting the list of available languages
     * or return the cached Promise if already requested
     *
     * @returns {Promise<Array>} Promise with languages v2 format
     */
    const getList = () => {
        if (languagesRequest === null) {
            return (languagesRequest = request(languagesUrl, null, null, headers));
        } else {
            return languagesRequest;
        }
    };

    /**
     * Return promise with boolean if language by provided code is RTL
     *
     * @param {String} code language code ex: 'ar-arb'
     * @returns {Promise<boolean>} Promise with resolved boolean is rtl
     */
    const isRTLbyLanguageCode = code => {
        return getList().then(languages => {
            const lang = languages.filter(lang => lang.code === code);
            return lang[0] && lang[0].orientation === 'rtl' || false;
        });
    };

    /**
     * Does language support vertical writing mode; and if does, which one - rl or lr.
     * @param {String} code language code ex: 'ja-JP'
     * @returns {Promise<string|null>} Promise with resolved with: null, 'vertical-rl', 'vertical-lr'
     */
    const getVerticalWritingModeByLang = code => {
        return getList().then(languages => {
            const lang = languages.filter(lang => lang.code === code);
            return lang[0] && lang[0].verticalWritingMode || null;
        });
    }

    return {
        useLegacyFormatting,
        useCKEFormatting,
        getList,
        isRTLbyLanguageCode,
        getVerticalWritingModeByLang
    };
});
