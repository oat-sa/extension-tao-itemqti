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
], function(_, Element, ResponseDeclaration, event, responseHelper){
    'use strict';

    var methods = {

        /**
         * Remove a choice from the interaction
         *
         * @param {string|choice} choice
         * @returns {object} this
         */
        removeChoice : function removeChoice(choice){

            var serial = '', c;
            if(typeof(choice) === 'string'){
                serial = choice;
            }else if(Element.isA(choice, 'choice')){
                serial = choice.getSerial();
            }
            if(this.choices[serial]){

                //remove choice
                c = this.choices[serial];
                delete this.choices[serial];

                //update the response
                responseHelper.removeChoice(this.getResponseDeclaration(), c);

                //trigger event
                event.choiceDeleted(c, this);
            }
            return this;
        },

        createResponse : function createResponse(attrs, template){
            var item,
                renderer,
                outcomeScore;
            var response = new ResponseDeclaration();
            const responseProcessing = this.rootElement.responseProcessing;
            const processingType = responseProcessing && responseProcessing.processingType;

            if(attrs){
                response.attr(attrs);
            }

            //we assume in the context of edition, every element is created from the api so alwayd bound to an item:
            item = this.getRootElement();
            item.addResponseDeclaration(response);
            const perInteractionRp = item.metaData.widget.options.perInteractionRp;

            //assign responseIdentifier only after attaching it to the item to generate a unique id
            response.buildIdentifier('RESPONSE', false);
            response.setTemplate(
                processingType === 'custom'
                    ? 'CUSTOM'
                    : template || 'MATCH_CORRECT'
            );
            this.attr('responseIdentifier', response.id());

            // create interaction response declaration in case of per interaction response processing
            if (perInteractionRp) {
                const outcomeIdentifier = `SCORE_${response.attributes.identifier}`;

                let interactionOutcome = item.getOutcomeDeclaration(outcomeIdentifier);
                if(!interactionOutcome){
                    interactionOutcome = item.createOutcomeDeclaration({
                        cardinality : 'single',
                        baseType : 'float'
                    });

                    interactionOutcome.attr('identifier', outcomeIdentifier);
                }
            }

            //adding a response processing template require the outcome SCORE:
            outcomeScore = item.getOutcomeDeclaration('SCORE');
            if(!outcomeScore){
                outcomeScore = item.createOutcomeDeclaration({
                    cardinality : 'single',
                    baseType : 'float'
                });
                outcomeScore.buildIdentifier('SCORE', false);
            }

            //se the default value for the score default value
            response.mappingAttributes.defaultValue = 0;

            //set renderer
            renderer = this.getRenderer();
            if(renderer){
                response.setRenderer(renderer);
            }

            return response;
        },

        /**
         * To be called before deleting the interaction
         */
        deleteResponse : function deleteResponse(){

            var response = this.getResponseDeclaration();
            if(response){
                this.getRootElement().deleteResponseDeclaration(response);
            }
            this.removeAttr('responseIdentifier');
            return this;
        },

        beforeRemove : function beforeRemove(){
            const item = this.getRootElement();
            const serial = this.serial,
                interactions = item.getInteractions();
            const perInteractionRp = item.metaData.widget.options.perInteractionRp;

            // remove interaction outcome
            if (perInteractionRp && this.attributes.responseIdentifier) {
                item.removeOutcome(`SCORE_${this.attributes.responseIdentifier}`);
            }

            //delete its response
            this.deleteResponse();

            //when there is only one interaction remaining, its reponseIdentifier must be RESPONSE to be able to use one of the standard rp
            if(_.size(interactions) === 2){
                _.forEach(interactions, function(interaction){

                    var response = interaction.getResponseDeclaration();

                    //find the other interaction, which will be the last remaining one
                    if(response && interaction.serial !== serial && interaction.qtiClass !== 'endAttemptInteraction'){
                        // rename interaction outcome
                        if (perInteractionRp) {
                            item.removeOutcome(`SCORE_${interaction.attributes.responseIdentifier}`);

                            let outcome = item.getOutcomeDeclaration('SCORE_RESPONSE');
                            if(!outcome){
                                outcome = item.createOutcomeDeclaration({
                                    cardinality : 'single',
                                    baseType : 'float'
                                });

                                outcome.attr('identifier', 'SCORE_RESPONSE');
                            }
                        }


                        interaction.attr('responseIdentifier', 'RESPONSE');
                        response.id('RESPONSE');
                    }
                });
            }
        }
    };

    return methods;
});
