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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA ;
 */
define([
    'taoQtiItem/qtiCreator/helper/textEntryEvaluationForm',
    'taoQtiItem/qtiCreator/helper/textEntryEvaluationHelper'
], function (textEntryEvaluationForm, evaluationHelper) {
    'use strict';

    /**
     * @param {Object} qtiCreatorContext
     * @param {Function} getItem
     */
    const register = function register(qtiCreatorContext, getItem) {
        if (!qtiCreatorContext || qtiCreatorContext._textEntryEvaluationSaveRegistered) {
            return;
        }

        qtiCreatorContext._textEntryEvaluationSaveRegistered = true;

        qtiCreatorContext.trigger(
            'registerBeforeSaveProcess',
            Promise.resolve().then(() => {
                const item = getItem();

                if (!item) {
                    return;
                }

                textEntryEvaluationForm.flushOpenForms(item);
                evaluationHelper.ensurePersistedBeforeSave(item);
            })
        );
    };

    return {
        register
    };
});
