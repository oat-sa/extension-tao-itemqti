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
define([
    'jquery',
    'taoQtiItem/qtiCreator/helper/textEntryEvaluationHelper'
], function ($, evaluationHelper) {
    'use strict';

    const NS = '.textEntryEvaluation';

    /**
     * @param {Object} interaction
     * @returns {{evaluateAsUmfi: boolean, allowLexicalFieldsOnScoring: boolean}}
     */
    const getTplData = function getTplData(interaction) {
        return {
            evaluateAsUmfi: evaluationHelper.isUmfiEnabled(interaction),
            allowLexicalFieldsOnScoring: evaluationHelper.isAllowLexicalFieldsOnScoring(interaction)
        };
    };

    /**
     * @param {jQuery} $responseForm
     * @param {boolean} expanded
     */
    const toggleDetails = function toggleDetails($responseForm, expanded) {
        $responseForm.find('.text-entry-evaluation-expanded').toggleClass('hidden', !expanded);
    };

    /**
     * @param {jQuery} $responseForm
     * @param {Object} widget
     */
    const bindEvents = function bindEvents($responseForm, widget) {
        const interaction = widget.element;

        $responseForm.off(NS);

        $responseForm.on(`change${NS}`, 'input[name="evaluateAsUmfi"]', function () {
            const enabled = $(this).prop('checked');

            evaluationHelper.setUmfiEnabled(interaction, enabled);
            toggleDetails($responseForm, enabled);

            if (!enabled) {
                $responseForm.find('input[name="allowLexicalFieldsOnScoring"]').prop('checked', false);
            }
        });

        $responseForm.on(`change${NS}`, 'input[name="allowLexicalFieldsOnScoring"]', function () {
            evaluationHelper.setAllowLexicalFieldsOnScoring(interaction, $(this).prop('checked'));
        });
    };

    /**
     * @param {jQuery} $responseForm
     */
    const unbindEvents = function unbindEvents($responseForm) {
        $responseForm.off(NS);
    };

    return {
        getTplData,
        bindEvents,
        unbindEvents
    };
});
