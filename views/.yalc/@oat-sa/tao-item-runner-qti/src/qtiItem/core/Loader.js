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
 * Copyright (c) 2015-2020 (original work) Open Assessment Technologies SA ;
 *
 */
//@todo : move this to the ../helper directory
import _ from 'lodash';
import 'class';
import qtiClasses from 'taoQtiItem/qtiItem/core/qtiClasses';
import Element from 'taoQtiItem/qtiItem/core/Element';
import xmlNsHandler from 'taoQtiItem/qtiItem/helper/xmlNsHandler';
import moduleLoader from 'core/moduleLoader';
import responseHelper from 'taoQtiItem/qtiItem/helper/response';
import itemScoreHelper from 'taoQtiItem/qtiItem/helper/itemScore';

/**
 * If a property is given as a serialized JSON object, parse it directly to a JS object
 */
const loadPortableCustomElementProperties = (portableElement, rawProperties) => {
    var properties = {};

    _.forOwn(rawProperties, (value, key) => {
        try {
            properties[key] = JSON.parse(value);
        } catch (e) {
            properties[key] = value;
        }
    });
    portableElement.properties = properties;
};

const loadPortableCustomElementData = (portableElement, data) => {
    portableElement.typeIdentifier = data.typeIdentifier;
    portableElement.markup = data.markup;
    portableElement.entryPoint = data.entryPoint;
    portableElement.libraries = data.libraries;
    portableElement.setNamespace('', data.xmlns);

    loadPortableCustomElementProperties(portableElement, data.properties);
};

var Loader = Class.extend({
    init(item, classesLocation) {
        this.qti = {}; //loaded qti classes are store here
        this.classesLocation = {};
        this.item = item || null; //starts either from scratch or with an existing item object

        this.setClassesLocation(classesLocation || qtiClasses); //load default location for qti classes model
    },
    setClassesLocation(qtiClassesList) {
        _.extend(this.classesLocation, qtiClassesList);

        return this;
    },
    getRequiredClasses(data) {
        let ret = [];

        for (let i in data) {
            if (i === 'qtiClass' && data[i] !== '_container' && i !== 'rootElement') {
                //although a _container is a concrete class in TAO, it is not defined in QTI standard
                ret.push(data[i]);
            } else if (typeof data[i] === 'object' && i !== 'responseRules') {
                //responseRules should'nt be part of the parsing
                ret = _.union(ret, this.getRequiredClasses(data[i]));
            }
        }

        return ret;
    },
    loadRequiredClasses(data, callback, reload) {
        let requiredClass;
        const requiredClasses = this.getRequiredClasses(data, reload);
        const required = [];

        for (let i in requiredClasses) {
            requiredClass = requiredClasses[i];
            if (this.classesLocation[requiredClass]) {
                required.push({
                    module: this.classesLocation[requiredClass],
                    category: 'qti'
                });
            } else {
                throw new Error(`missing qti class location declaration : ${requiredClass}`);
            }
        }

        moduleLoader([], () => true).addList(required).load().then(loadeded => {
            loadeded.forEach(QtiClass => {
                this.qti[QtiClass.prototype.qtiClass] = QtiClass;
            });
            callback.call(this, this.qti);
        });
    },
    getLoadedClasses() {
        return _.keys(this.qti);
    },
    loadItemData(data, callback) {
        this.loadRequiredClasses(data, Qti => {
            if (typeof data === 'object' && data.qtiClass === 'assessmentItem') {
                //unload an item from it's serial (in case of a reload)
                if (data.serial) {
                    Element.unsetElement(data.serial);
                }

                this.item = new Qti.assessmentItem(data.serial, data.attributes || {});
                this.loadContainer(this.item.getBody(), data.body);

                for (let i in data.outcomes) {
                    const outcome = this.buildOutcome(data.outcomes[i]);

                    if (outcome) {
                        this.item.addOutcomeDeclaration(outcome);
                    }
                }

                for (let i in data.feedbacks) {
                    const feedback = this.buildElement(data.feedbacks[i]);

                    if (feedback) {
                        this.item.addModalFeedback(feedback);
                    }
                }

                for (let i in data.stylesheets) {
                    const stylesheet = this.buildElement(data.stylesheets[i]);

                    if (stylesheet) {
                        this.item.addStylesheet(stylesheet);
                    }
                }

                //important : build responses after all modal feedbacks and outcomes has been loaded, because the simple feedback rules need to reference them
                let responseRules = data.responseProcessing && data.responseProcessing.responseRules
                    ? [...data.responseProcessing.responseRules]
                    : [];
                for (let i in data.responses) {
                    const responseIdentifier = data.responses[i].identifier;
                    const responseRuleItemIndex = responseRules.findIndex(({ responseIf: {
                        expression: {
                            expressions: [expression = {}] = [],
                        } = {}
                    } = {} }) => expression.attributes
                    && expression.attributes.identifier === responseIdentifier
                        || (
                            expression.expressions
                            && expression.expressions[0]
                            && expression.expressions[0].attributes
                            && expression.expressions[0].attributes.identifier === responseIdentifier
                        )
                    );
                    const [responseRule] = responseRuleItemIndex !== -1
                        ? responseRules.splice(responseRuleItemIndex, 1)
                        : [];

                    const response = this.buildResponse(
                        data.responses[i],
                        responseRule
                    );

                    if (response) {
                        this.item.addResponseDeclaration(response);

                        const feedbackRules = data.responses[i].feedbackRules;

                        if (feedbackRules) {
                            _.forIn(feedbackRules, (fbData, serial) => {
                                const {
                                    attributes: {
                                        identifier: feedbackOutcomeIdentifier,
                                    } = {}
                                } = data.outcomes[fbData.feedbackOutcome] || {};
                                response.feedbackRules[serial] = this.buildSimpleFeedbackRule(fbData, response);

                                // remove feedback response rule from response rules array
                                const feedbackResponseRuleIndex = responseRules.findIndex(({
                                    responseIf: {
                                        responseRules: [setOutcomeResponseRule = {}] = [],
                                    } = {}
                                }) => {
                                    const { attributes = {}, qtiClass } = setOutcomeResponseRule;
                                    const outcomeIdentifier = attributes.identifier;

                                    return feedbackOutcomeIdentifier === outcomeIdentifier
                                        && qtiClass === 'setOutcomeValue';
                                });

                                if (feedbackResponseRuleIndex !== -1) {
                                    responseRules.splice(feedbackResponseRuleIndex, 1);
                                }
                            });
                        }
                    }
                }

                const responseIdentifiers = Object.keys(this.item.responses || {})
                    .map((responseKey) => this.item.responses[responseKey].attributes.identifier);

                if (data.responseProcessing) {
                    const customResponseProcessing =
                        (
                            responseRules.length > 0
                            && !(
                                responseRules.length === 1
                                && _.isEqual(
                                    responseRules[0],
                                    itemScoreHelper(
                                        responseIdentifiers
                                    )
                                )
                            )
                        )
                        || (
                            this.item.responses
                            && Object.keys(this.item.responses)
                                .some((responseKey) => !this.item.responses[responseKey].template)
                        );

                    this.item.setResponseProcessing(this.buildResponseProcessing(data.responseProcessing, customResponseProcessing));
                }
                this.item.setNamespaces(data.namespaces);
                this.item.setSchemaLocations(data.schemaLocations);
                this.item.setApipAccessibility(data.apipAccessibility);
            }

            if (typeof callback === 'function') {
                callback.call(this, this.item);
            }
        });
    },
    loadAndBuildElement(data, callback) {
        this.loadRequiredClasses(data, () => {
            const element = this.buildElement(data);

            if (typeof callback === 'function') {
                callback.call(this, element);
            }
        });
    },
    loadElement(element, data, callback) {
        this.loadRequiredClasses(data, () => {
            this.loadElementData(element, data);

            if (typeof callback === 'function') {
                callback.call(this, element);
            }
        });
    },
    /**
     * Load ALL given elements into existing loaded item
     *
     * @todo to be renamed to loadItemElements
     * @param {object} data
     * @param {function} callback
     * @returns {undefined}
     */
    loadElements(data, callback) {
        if (!this.item) {
            throw new Error('QtiLoader : cannot load elements in empty item');
        }

        this.loadRequiredClasses(data, () => {
            const allElements = this.item.getComposingElements();

            for (let i in data) {
                const elementData = data[i];

                if (elementData && elementData.qtiClass && elementData.serial) {
                    //find and update element
                    if (allElements[elementData.serial]) {
                        this.loadElementData(allElements[elementData.serial], elementData);
                    }
                }
            }

            if (typeof callback === 'function') {
                callback.call(this, this.item);
            }
        });
    },
    buildResponse(data, responseRule) {
        const response = this.buildElement(data);

        response.template = responseHelper.getTemplateUriFromName(
            responseHelper.getTemplateNameFromResponseRules(data.identifier, responseRule)
        )
            || data.howMatch
            || null;

        response.defaultValue = data.defaultValue || null;
        response.correctResponse = data.correctResponses || null;

        if (_.size(data.mapping)) {
            response.mapEntries = data.mapping;
        } else if (_.size(data.areaMapping)) {
            response.mapEntries = data.areaMapping;
        } else {
            response.mapEntries = {};
        }

        response.mappingAttributes = data.mappingAttributes || {};

        return response;
    },
    buildSimpleFeedbackRule(data, response) {
        const feedbackRule = this.buildElement(data);

        feedbackRule.setCondition(response, data.condition, data.comparedValue || null);

        //            feedbackRule.comparedOutcome = this.item.responses[data.comparedOutcome] || null;
        feedbackRule.feedbackOutcome = this.item.outcomes[data.feedbackOutcome] || null;
        feedbackRule.feedbackThen = this.item.modalFeedbacks[data.feedbackThen] || null;
        feedbackRule.feedbackElse = this.item.modalFeedbacks[data.feedbackElse] || null;

        //associate the compared outcome to the feedbacks if applicable
        const comparedOutcome = feedbackRule.comparedOutcome;

        if (feedbackRule.feedbackThen) {
            feedbackRule.feedbackThen.data('relatedResponse', comparedOutcome);
        }

        if (feedbackRule.feedbackElse) {
            feedbackRule.feedbackElse.data('relatedResponse', comparedOutcome);
        }

        return feedbackRule;
    },
    buildOutcome(data) {
        const outcome = this.buildElement(data);
        outcome.defaultValue = data.defaultValue || null;

        return outcome;
    },
    buildResponseProcessing(data, customResponseProcessing) {
        const rp = this.buildElement(data);

        if (customResponseProcessing) {
            rp.xml = data.data;
            rp.processingType = 'custom';
        } else {
            rp.processingType = 'templateDriven';
        }

        return rp;
    },
    loadContainer(bodyObject, bodyData) {
        if (!Element.isA(bodyObject, '_container')) {
            throw new Error('bodyObject must be a QTI Container');
        }

        if (!(bodyData && typeof bodyData.body === 'string' && typeof bodyData.elements === 'object')) {
            throw new Error('wrong bodydata format');
        }
        //merge attributes when loading element data
        const attributes = _.defaults(bodyData.attributes || {}, bodyObject.attributes || {});
        bodyObject.setAttributes(attributes);

        for (let serial in bodyData.elements) {
            const eltData = bodyData.elements[serial];
            const element = this.buildElement(eltData);

            //check if class is loaded:
            if (element) {
                bodyObject.setElement(element, bodyData.body);
            }
        }

        bodyObject.body(xmlNsHandler.stripNs(bodyData.body));
    },
    buildElement(elementData) {
        if (!(elementData && elementData.qtiClass && elementData.serial)) {
            throw new Error('wrong elementData format');
        }

        const className = elementData.qtiClass;

        if (!this.qti[className]) {
            throw new Error(`the qti element class does not exist: ${className}`);
        }

        const elt = new this.qti[className](elementData.serial);
        this.loadElementData(elt, elementData);

        return elt;
    },
    loadElementData(element, data) {
        //merge attributes when loading element data
        const attributes = _.defaults(data.attributes || {}, element.attributes || {});
        element.setAttributes(attributes);

        let body = data.body;
        if (!body && data.text && data.qtiClass === 'inlineChoice') {
            body = { body: data.text, elements: {} };
        }
        if (element.body && body) {
            if (element.bdy) {
                this.loadContainer(element.getBody(), body);
            }
        }

        if (element.object && data.object) {
            if (element.object) {
                this.loadObjectData(element.object, data.object);
            }
        }

        if (Element.isA(element, 'interaction')) {
            this.loadInteractionData(element, data);
        } else if (Element.isA(element, 'choice')) {
            this.loadChoiceData(element, data);
        } else if (Element.isA(element, 'math')) {
            this.loadMathData(element, data);
        } else if (Element.isA(element, 'infoControl')) {
            this.loadPicData(element, data);
        } else if (Element.isA(element, '_tooltip')) {
            this.loadTooltipData(element, data);
        }

        return element;
    },
    loadInteractionData(interaction, data) {
        if (Element.isA(interaction, 'blockInteraction')) {
            if (data.prompt) {
                this.loadContainer(interaction.prompt.getBody(), data.prompt);
            }
        }

        this.buildInteractionChoices(interaction, data);

        if (Element.isA(interaction, 'customInteraction')) {
            this.loadPciData(interaction, data);
        }
    },
    buildInteractionChoices(interaction, data) {
        // note: Qti.ContainerInteraction (Qti.GapMatchInteraction and Qti.HottextInteraction) has already been parsed by builtElement(interacionData);
        if (data.choices) {
            if (Element.isA(interaction, 'matchInteraction')) {
                for (let set = 0; set < 2; set++) {
                    if (!data.choices[set]) {
                        throw new Error(`missing match set #${set}`);
                    }

                    const matchSet = data.choices[set];

                    for (let serial in matchSet) {
                        const choice = this.buildElement(matchSet[serial]);

                        if (choice) {
                            interaction.addChoice(choice, set);
                        }
                    }
                }
            } else {
                for (let serial in data.choices) {
                    const choice = this.buildElement(data.choices[serial]);

                    if (choice) {
                        interaction.addChoice(choice);
                    }
                }
            }

            if (Element.isA(interaction, 'graphicGapMatchInteraction')) {
                if (data.gapImgs) {
                    for (let serial in data.gapImgs) {
                        const gapImg = this.buildElement(data.gapImgs[serial]);

                        if (gapImg) {
                            interaction.addGapImg(gapImg);
                        }
                    }
                }
            }
        }
    },
    loadChoiceData(choice, data) {
        if (Element.isA(choice, 'textVariableChoice')) {
            choice.val(data.text);
        } else if (Element.isA(choice, 'gapImg')) {
            //has already been taken care of in buildElement()
        } else if (Element.isA(choice, 'gapText')) {
            // this ensure compatibility of Qti 2.1 items
            if (!choice.body()) {
                choice.body(data.text);
            }
        } else if (Element.isA(choice, 'containerChoice')) {
            //has already been taken care of in buildElement()
        }
    },
    loadObjectData(object, data) {
        object.setAttributes(data.attributes);

        //@todo: manage object like a container
        if (data._alt) {
            if (data._alt.qtiClass === 'object') {
                object._alt = Loader.buildElement(data._alt);
            } else {
                object._alt = data._alt;
            }
        }
    },
    loadMathData(math, data) {
        math.ns = data.ns || {};
        math.setMathML(data.mathML || '');
        _.forIn(data.annotations || {}, (value, encoding) => {
            math.setAnnotation(encoding, value);
        });
    },
    loadTooltipData(tooltip, data) {
        tooltip.content(data.content);
    },
    loadPciData(pci, data) {
        loadPortableCustomElementData(pci, data);
    },
    loadPicData(pic, data) {
        loadPortableCustomElementData(pic, data);
    }
});

export default Loader;

