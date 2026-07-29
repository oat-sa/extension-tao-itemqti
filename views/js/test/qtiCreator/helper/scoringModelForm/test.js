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

    QUnit.test('getCorrectResponsesMaxExceededMessage explains the field-count limit', assert => {
        const message = scoringModelForm.getCorrectResponsesMaxExceededMessage(3);

        assert.ok(message.indexOf('3') > -1);
        assert.ok(message.toLowerCase().indexOf('text entry') > -1);
    });

    QUnit.test('buildThresholdValidateAttr includes correctResponsesMax rule', assert => {
        assert.strictEqual(
            scoringModelForm.buildThresholdValidateAttr(4),
            '$notEmpty; $numeric; $correctResponsesMax(max=4);'
        );
    });

    QUnit.test('enforceCorrectResponsesMax clamps over-max values and keeps max', assert => {
        const $input = $('<input type="text" value="9" />');

        assert.ok(scoringModelForm.enforceCorrectResponsesMax($input, 3));
        assert.strictEqual($input.val(), '3');

        assert.notOk(scoringModelForm.enforceCorrectResponsesMax($input, 3));
        assert.strictEqual($input.val(), '3');
    });

    QUnit.test('enforceCorrectResponsesMax rejects duplicate polytomous thresholds', assert => {
        const $form = $(
            `<div class="scoring-model-panel">
                <div class="scoring-model-level">
                    <input class="scoring-level-threshold" value="3" />
                    <input class="scoring-level-score" value="7" />
                </div>
                <div class="scoring-model-level">
                    <input class="scoring-level-threshold" value="3" />
                    <input class="scoring-level-score" value="1" />
                </div>
            </div>`
        );
        const $duplicate = $form.find('input.scoring-level-threshold').eq(1);

        $duplicate.data('scoringModelPreviousThreshold', 1);

        assert.ok(scoringModelForm.enforceCorrectResponsesMax($duplicate, 5));
        assert.strictEqual($duplicate.val(), '1');
    });

    QUnit.test('findAvailableThreshold skips used values', assert => {
        assert.strictEqual(scoringModelForm.findAvailableThreshold(3, 5, [3, 1]), 2);
        assert.strictEqual(scoringModelForm.findAvailableThreshold(0, 2, [0, 1, 2]), null);
    });

    QUnit.test('remove-scoring-level drops the clicked DOM row after unsorted edits', assert => {
        assert.expect(2);

        const createMockTextEntry = function createMockTextEntry(responseIdentifier, scoringModel) {
            const attrs = {
                responseIdentifier: responseIdentifier
            };

            if (scoringModel) {
                attrs['data-scoring-model'] = scoringModel;
            }

            const textEntry = {
                qtiClass: 'textEntryInteraction',
                is: function (qtiClass) {
                    return qtiClass === 'textEntryInteraction';
                },
                getRootElement: function () {
                    return item;
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

            return textEntry;
        };

        const textEntries = [
            createMockTextEntry('RESPONSE', '{"5":2,"3":1,"1":0}'),
            createMockTextEntry('RESPONSE_2'),
            createMockTextEntry('RESPONSE_3'),
            createMockTextEntry('RESPONSE_4'),
            createMockTextEntry('RESPONSE_5')
        ];
        const item = {
            getComposingElements: function () {
                return textEntries.reduce(function (acc, entry, index) {
                    acc[String(index + 1)] = entry;
                    return acc;
                }, {});
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
            getOutcomeDeclaration: function () {
                return null;
            },
            createOutcomeDeclaration: function () {
                return {
                    attr: function () {
                        return this;
                    },
                    setDefaultValue: function () {
                        return this;
                    },
                    buildIdentifier: function () {
                        return this;
                    }
                };
            },
            addOutcomeDeclaration: function () {
                return this;
            }
        };
        const interaction = textEntries[0];
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
        const createMockTextEntry = function createMockTextEntry(responseIdentifier, scoringModel) {
            const attrs = {
                responseIdentifier: responseIdentifier
            };

            if (scoringModel) {
                attrs['data-scoring-model'] = scoringModel;
            }

            return {
                qtiClass: 'textEntryInteraction',
                is: function (qtiClass) {
                    return qtiClass === 'textEntryInteraction';
                },
                getRootElement: function () {
                    return item;
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
        };
        const textEntries = [
            createMockTextEntry('RESPONSE', '{"5":1}'),
            createMockTextEntry('RESPONSE_2'),
            createMockTextEntry('RESPONSE_3'),
            createMockTextEntry('RESPONSE_4'),
            createMockTextEntry('RESPONSE_5')
        ];
        const item = {
            getComposingElements: function () {
                return textEntries.reduce(function (acc, entry, index) {
                    acc[String(index + 1)] = entry;
                    return acc;
                }, {});
            }
        };
        const interaction = textEntries[0];
        const tplData = scoringModelForm.getTplData(interaction);

        assert.ok(tplData.showScoringModel);
        assert.ok(tplData.isDichotomous);
        assert.strictEqual(tplData.maxCorrectResponses, 5);
        assert.strictEqual(tplData.dichotomousThreshold, 5);
        assert.strictEqual(tplData.dichotomousScore, 1);
    });

    QUnit.test('getTplData clamps dichotomous Correct responses to field count', assert => {
        const attrs = {
            responseIdentifier: 'RESPONSE',
            'data-scoring-model': '{"9":1}'
        };
        const secondaryAttrs = {
            responseIdentifier: 'RESPONSE_2'
        };
        const primary = {
            qtiClass: 'textEntryInteraction',
            is: function (qtiClass) {
                return qtiClass === 'textEntryInteraction';
            },
            getRootElement: function () {
                return item;
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
        const secondary = {
            qtiClass: 'textEntryInteraction',
            is: function (qtiClass) {
                return qtiClass === 'textEntryInteraction';
            },
            getRootElement: function () {
                return item;
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
                    return secondaryAttrs[name];
                }

                secondaryAttrs[name] = value;
                return this;
            },
            removeAttr: function (name) {
                delete secondaryAttrs[name];
            }
        };
        const item = {
            getComposingElements: function () {
                return { 1: primary, 2: secondary };
            }
        };

        const tplData = scoringModelForm.getTplData(primary);

        assert.strictEqual(tplData.maxCorrectResponses, 2);
        assert.strictEqual(tplData.dichotomousThreshold, 2);
    });
});
