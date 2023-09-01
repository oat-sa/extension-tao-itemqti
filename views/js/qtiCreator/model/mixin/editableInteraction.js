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
 * Copyright (c) 2014-2018 (original work) Open Assessment Technologies SA;
 *
 */

/**
 * Mixins methods for editable interactions
 */
define([
    'lodash',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/model/variables/ResponseDeclaration',
    'taoQtiItem/qtiCreator/model/helper/event',
    'taoQtiItem/qtiCreator/model/helper/response'
], function (_, Element, ResponseDeclaration, event, responseHelper) {
    'use strict';

    const methods = {
        /**
         * Remove a choice from the interaction
         *
         * @param {string|choice} choice
         * @returns {object} this
         */
        removeChoice: function removeChoice(choice) {
            let serial = '';
            if (typeof choice === 'string') {
                serial = choice;
            } else if (Element.isA(choice, 'choice')) {
                serial = choice.getSerial();
            }
            if (this.choices[serial]) {
                //remove choice
                const c = this.choices[serial];
                delete this.choices[serial];

                //update the response
                responseHelper.removeChoice(this.getResponseDeclaration(), c);

                //trigger event
                event.choiceDeleted(c, this);
            }
            return this;
        },

        createOutcomeDeclarationIfNotExists(outcomeIdentifier, buildIdentifier) {
            const item = this.getRootElement();
            let outcome = item.getOutcomeDeclaration(outcomeIdentifier);

            if (!outcome) {
                outcome = item.createOutcomeDeclaration({
                    cardinality: 'single',
                    baseType: 'float'
                });

                buildIdentifier
                    ? outcome.buildIdentifier(outcomeIdentifier, false)
                    : outcome.attr('identifier', outcomeIdentifier);
            }
        },

        createResponse: function createResponse(attrs, template) {
            const response = new ResponseDeclaration();
            const responseProcessing = this.rootElement.responseProcessing;
            const processingType = responseProcessing && responseProcessing.processingType;
            let item, renderer;

            if (attrs) {
                response.attr(attrs);
            }

            //we assume in the context of edition, every element is created from the api so alwayd bound to an item:
            item = this.getRootElement();
            item.addResponseDeclaration(response);
            const perInteractionRp = item.metaData.widget.options.perInteractionRp;

            //assign responseIdentifier only after attaching it to the item to generate a unique id
            response.buildIdentifier('RESPONSE', false);
            response.setTemplate(processingType === 'custom' ? 'CUSTOM' : template || 'MATCH_CORRECT');
            this.attr('responseIdentifier', response.id());

            //adding a response processing template require the outcome SCORE:
            this.createOutcomeDeclarationIfNotExists('SCORE', true);

            // create interaction response declaration in case of per interaction response processing
            if (perInteractionRp) {
                const outcomeIdentifier = `SCORE_${response.attributes.identifier}`;

                this.createOutcomeDeclarationIfNotExists(outcomeIdentifier);
            }

            //se the default value for the score default value
            response.mappingAttributes.defaultValue = 0;

            //set renderer
            renderer = this.getRenderer();
            if (renderer) {
                response.setRenderer(renderer);
            }

            return response;
        },

        /**
         * To be called before deleting the interaction
         * @returns {Object} this - interaction
         */
        deleteResponse: function deleteResponse() {
            const response = this.getResponseDeclaration();
            if (response) {
                this.getRootElement().deleteResponseDeclaration(response);
            }
            this.removeAttr('responseIdentifier');
            return this;
        },

        beforeRemove: function beforeRemove() {
            const item = this.getRootElement();
            const perInteractionRp = item.metaData.widget.options.perInteractionRp;

            // remove interaction outcome
            if (perInteractionRp && this.attributes.responseIdentifier) {
                item.removeOutcome(`SCORE_${this.attributes.responseIdentifier}`);
            }

            //delete its response
            this.deleteResponse();
        }
    };

    return methods;
});
