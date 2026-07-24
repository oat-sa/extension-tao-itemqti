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
define(['jquery', 'taoQtiItem/qtiCreator/helper/scoringModelForm'], function ($, scoringModelForm) {
    'use strict';

    QUnit.module('scoringModelForm');

    QUnit.test('readPolytomousLevelsFromForm collects valid rows', assert => {
        const $form = $(
            `<div class="scoring-model-panel">
                <div class="scoring-model-level">
                    <input class="scoring-level-threshold" value="5" />
                    <input class="scoring-level-score" value="2" />
                </div>
                <div class="scoring-model-level">
                    <input class="scoring-level-threshold" value="3" />
                    <input class="scoring-level-score" value="1" />
                </div>
                <div class="scoring-model-level">
                    <input class="scoring-level-threshold" value="" />
                    <input class="scoring-level-score" value="1" />
                </div>
            </div>`
        );

        assert.deepEqual(scoringModelForm.readPolytomousLevelsFromForm($form), [
            { threshold: 5, score: 2 },
            { threshold: 3, score: 1 }
        ]);
    });

    QUnit.test('getTplData exposes dichotomous fields from attribute', assert => {
        const attrs = {
            responseIdentifier: 'RESPONSE',
            'data-scoring-model': '{"5":1}'
        };
        const interaction = {
            qtiClass: 'textEntryInteraction',
            is: function (qtiClass) {
                return qtiClass === 'textEntryInteraction';
            },
            getRootElement: function () {
                return {
                    getComposingElements: function () {
                        return { 1: interaction };
                    }
                };
            },
            getResponseDeclaration: function () {
                return {
                    template: 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response',
                    getTemplate: function () {
                        return this.template;
                    }
                };
            },
            attr: function (name, value) {
                if (typeof value === 'undefined') {
                    return attrs[name];
                }

                attrs[name] = value;
                return this;
            },
            removeAttr: function (name) {
                delete attrs[name];
            }
        };

        const tplData = scoringModelForm.getTplData(interaction);

        assert.true(tplData.showScoringModel);
        assert.true(tplData.isDichotomous);
        assert.strictEqual(tplData.dichotomousThreshold, 5);
        assert.strictEqual(tplData.dichotomousScore, 1);
    });
});
