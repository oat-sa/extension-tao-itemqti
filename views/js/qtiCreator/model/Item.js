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
 * Copyright (c) 2015-2019 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'context',
    'i18n',
    'services/features',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableContainer',
    'taoQtiItem/qtiItem/core/Item',
    'taoQtiItem/qtiCreator/model/Stylesheet',
    'taoQtiItem/qtiCreator/model/ResponseProcessing',
    'taoQtiItem/qtiCreator/model/variables/OutcomeDeclaration',
    'taoQtiItem/qtiCreator/model/feedbacks/ModalFeedback'
], function(context, __, features, editable, editableContainer, Item, Stylesheet, ResponseProcessing, OutcomeDeclaration, ModalFeedback){
    "use strict";
    var methods = {};
    Object.assign(methods, editable);
    Object.assign(methods, editableContainer);
    Object.assign(methods, {
        getDefaultAttributes : function(){
            return {
                identifier : 'myItem_1',
                title : 'Item title',
                adaptive : false,
                timeDependent : false,
                'xml:lang' : context.base_authoring_lang || 'en-US'
            };
        },
        createResponseProcessing : function(){
            var rp = new ResponseProcessing();
            rp.processingType = 'templateDriven';
            this.setResponseProcessing(rp);
            return rp;
        },
        createStyleSheet : function(href){
            if (href && typeof href === 'string') {
                var stylesheet = new Stylesheet({href : href});
                stylesheet.setRenderer(this.getRenderer());
                this.addStylesheet(stylesheet);
                return stylesheet;
            }else{
                throw 'missing or invalid type for the required arg "href"';
                return null;
            }
        },
        createOutcomeDeclaration : function(attributes){

            var identifier = attributes.identifier || '';
            delete attributes.identifier;
            var outcome = new OutcomeDeclaration(attributes);

            this.addOutcomeDeclaration(outcome);
            outcome.buildIdentifier(identifier);

            return outcome;
        },
        getOutcomeDeclaration : function getOutcomeDeclaration(identifier){
            var found;
            for (let outcome of this.outcomes) {
                if (outcome.id() === identifier) {
                    found = outcome;
                    break;
                }
            }
            return found;
        },
        removeOutcome : function removeOutcome(identifier){
            var outcome = this.getOutcomeDeclaration(identifier);
            if(outcome){
                delete this.outcomes[outcome.getSerial()];
            }
        },
        createModalFeedback : function(attributes, response){

            var identifier = attributes.identifier || '';
            delete attributes.identifier;
            var modalFeedback = new ModalFeedback(attributes);

            this.addModalFeedback(modalFeedback);
            modalFeedback.buildIdentifier(identifier);
            modalFeedback.body(__('Some feedback text.'));
            if(response && response.qtiClass === 'responseDeclaration'){
                modalFeedback.data('relatedResponse', response);
            }

            return modalFeedback;
        },
        deleteResponseDeclaration : function(response){
            var self = this;
            var serial;
            if (typeof response === "string") {
                serial = response;
            }else if(response && response.qtiClass === 'responseDeclaration'){
                serial = response.getSerial();
            }
            if(this.responses[serial]){
                //remove feedback rules:
                this.responses[serial].feedbackRules.forEach(rule => {
                    var feedbacks = [];
                    if(rule.feedbackThen && rule.feedbackThen.is('modalFeedback')){
                        feedbacks.push(rule.feedbackThen.serial);
                    }
                    if(rule.feedbackElse && rule.feedbackElse.is('modalFeedback')){
                        feedbacks.push(rule.feedbackElse.serial);
                    }
                    self.modalFeedbacks = Object.keys(self.modalFeedbacks)
                        .reduce((acc, key) => {
                            if (!feedbacks.includes(key)) {
                                acc[key] = self.modalFeedbacks[key];
                            }
                            return acc;
                        }, {});

                    if (rule.feedbackOutcome && rule.feedbackOutcome.is('outcomeDeclaration')) {
                        self.outcomes = Object.keys(self.outcomes)
                            .reduce((acc, key) => {
                                if (key !== rule.feedbackOutcome.serial) {
                                    acc[key] = self.outcomes[key];
                                }
                                return acc;
                            }, {});
                    }
                });
                delete this.responses[serial];
            }
            return this;
        }
    });
    return Item.extend(methods);
});
