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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 */
define(['lodash'], function (_) {
    'use strict';

    const UMFI_ITEM_TYPE = 'umfi-closed';
    const DATA_ITEM_TYPE = 'data-item-type';
    const DATA_UMFI_VALUES = 'data-umfi-values';
    const DATA_CASE_SENSITIVE = 'data-case-sensitive';
    const DATA_ALLOW_LEXICAL_FIELDS = 'data-allow-lexical-fields-on-scoring';
    const TEXT_ENTRY_QTI_CLASS = 'textEntryInteraction';

    /**
     * @param {Object} interaction
     * @returns {Object[]}
     */
    const getItemTextEntries = function getItemTextEntries(interaction) {
        const item = interaction.getRootElement();

        if (!item || !_.isFunction(item.getElements)) {
            return [interaction];
        }

        return _.values(item.getElements(TEXT_ENTRY_QTI_CLASS));
    };

    /**
     * @param {Object[]} textEntries
     * @returns {Object|null}
     */
    const getPrimaryTextEntry = function getPrimaryTextEntry(textEntries) {
        return textEntries.length ? textEntries[0] : null;
    };

    /**
     * @param {Object} interaction
     * @returns {boolean}
     */
    const isUmfiEnabled = function isUmfiEnabled(interaction) {
        const primaryTextEntry = getPrimaryTextEntry(getItemTextEntries(interaction));

        return !!(primaryTextEntry && primaryTextEntry.attr(DATA_ITEM_TYPE) === UMFI_ITEM_TYPE);
    };

    /**
     * @param {Object} interaction
     * @returns {boolean}
     */
    const isAllowLexicalFieldsOnScoring = function isAllowLexicalFieldsOnScoring(interaction) {
        const primaryTextEntry = getPrimaryTextEntry(getItemTextEntries(interaction));

        return !!(primaryTextEntry && primaryTextEntry.attr(DATA_ALLOW_LEXICAL_FIELDS) === 'true');
    };

    /**
     * @param {Object} interaction
     * @param {boolean} enabled
     */
    const setUmfiEnabled = function setUmfiEnabled(interaction, enabled) {
        const textEntries = getItemTextEntries(interaction);
        const primaryTextEntry = getPrimaryTextEntry(textEntries);

        if (!primaryTextEntry || !_.isFunction(primaryTextEntry.attr)) {
            return;
        }

        if (enabled) {
            primaryTextEntry.attr(DATA_ITEM_TYPE, UMFI_ITEM_TYPE);

            if (!primaryTextEntry.attr(DATA_UMFI_VALUES)) {
                primaryTextEntry.attr(DATA_UMFI_VALUES, '[]');
            }

            if (!primaryTextEntry.attr(DATA_CASE_SENSITIVE)) {
                primaryTextEntry.attr(DATA_CASE_SENSITIVE, 'false');
            }
        } else {
            _.forEach(textEntries, textEntry => {
                textEntry.removeAttr(DATA_ITEM_TYPE);
                textEntry.removeAttr(DATA_UMFI_VALUES);
                textEntry.removeAttr(DATA_CASE_SENSITIVE);
                textEntry.removeAttr(DATA_ALLOW_LEXICAL_FIELDS);
            });
        }
    };

    /**
     * @param {Object} interaction
     * @param {boolean} enabled
     */
    const setAllowLexicalFieldsOnScoring = function setAllowLexicalFieldsOnScoring(interaction, enabled) {
        const primaryTextEntry = getPrimaryTextEntry(getItemTextEntries(interaction));

        if (!primaryTextEntry || !_.isFunction(primaryTextEntry.attr)) {
            return;
        }

        if (enabled) {
            primaryTextEntry.attr(DATA_ALLOW_LEXICAL_FIELDS, 'true');
        } else {
            primaryTextEntry.removeAttr(DATA_ALLOW_LEXICAL_FIELDS);
        }
    };

    return {
        UMFI_ITEM_TYPE,
        DATA_ITEM_TYPE,
        DATA_UMFI_VALUES,
        DATA_CASE_SENSITIVE,
        DATA_ALLOW_LEXICAL_FIELDS,
        getItemTextEntries,
        isUmfiEnabled,
        isAllowLexicalFieldsOnScoring,
        setUmfiEnabled,
        setAllowLexicalFieldsOnScoring
    };
});
