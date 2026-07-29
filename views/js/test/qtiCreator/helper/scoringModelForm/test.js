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
    'jquery',
    'context',
    'taoQtiItem/qtiCreator/helper/scoringModelForm'
], function ($, context, scoringModelForm) {
    'use strict';

    QUnit.module('scoringModelForm', {
        beforeEach: function () {
            context.featureFlags = context.featureFlags || {};
            context.featureFlags.FEATURE_FLAG_MULTI_FIELD_SCORING = true;
        }
    });

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

    QUnit.test('remove-scoring-level drops the clicked DOM row after unsorted edits', assert => {
        assert.expect(2);

        const attrs = {
            responseIdentifier: 'RESPONSE',
            'data-scoring-model': '{"5":2,"3":1,"1":0}'
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
                    },
                    responseProcessing: {
                        processingType: 'templateDriven',
                        setProcessingType: function () {
                            return this;
                        },
                        setXml: function () {
                            return this;
                        }
                    },
                    getOutcomes: function () {
                        return [];
                    },
                    addOutcomeDeclaration: function () {
                        return this;
                    }
                };
            },
            getResponseDeclaration: function () {
                return {
                    template: 'http://www.imsglobal.org/question/qti_v2p1/rptemplates/map_response',
                    getTemplate: function () {
                        return this.template;
                    },
                    setTemplate: function () {
                        return this;
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
        const $form = $(
            `<div class="scoring-model-panel">
                <input type="radio" name="scoringModel" value="polytomous" checked="checked" />
                <div class="scoring-model-polytomous">
                    <div class="scoring-model-level-list">
                        <div class="scoring-model-level" data-level-index="0">
                            <input class="scoring-level-threshold" value="0" />
                            <input class="scoring-level-score" value="0" />
                            <span data-action="remove-scoring-level"></span>
                        </div>
                        <div class="scoring-model-level" data-level-index="1">
                            <input class="scoring-level-threshold" value="3" />
                            <input class="scoring-level-score" value="1" />
                            <span data-action="remove-scoring-level"></span>
                        </div>
                        <div class="scoring-model-level" data-level-index="2">
                            <input class="scoring-level-threshold" value="1" />
                            <input class="scoring-level-score" value="0" />
                            <span data-action="remove-scoring-level"></span>
                        </div>
                    </div>
                </div>
            </div>`
        );
        const widget = {
            element: interaction,
            $responseForm: $form,
            // Sorted config (3,1,0) while DOM still shows edited order (0,3,1) with stale indices —
            // removing index 0 via config would drop threshold 3; DOM-first remove must drop 0.
            _scoringModelConfig: {
                model: 'polytomous',
                thresholds: [
                    { threshold: 3, score: 1 },
                    { threshold: 1, score: 0 },
                    { threshold: 0, score: 0 }
                ]
            }
        };

        scoringModelForm.bindEvents($form, widget);
        $form.find('[data-action="remove-scoring-level"]').first().trigger('click');

        assert.deepEqual(
            widget._scoringModelConfig.thresholds,
            [
                { threshold: 3, score: 1 },
                { threshold: 1, score: 0 }
            ],
            'clicked edited row (threshold 0) was removed, not sorted index 0'
        );
        assert.deepEqual(
            scoringModelForm.readPolytomousLevelsFromForm($form),
            [
                { threshold: 3, score: 1 },
                { threshold: 1, score: 0 }
            ],
            'rerendered form matches the remaining thresholds'
        );
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

        assert.ok(tplData.showScoringModel);
        assert.ok(tplData.isDichotomous);
        assert.strictEqual(tplData.dichotomousThreshold, 5);
        assert.strictEqual(tplData.dichotomousScore, 1);
    });
});
