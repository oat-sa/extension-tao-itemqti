/**
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
 * Copyright (c) 2015-2022 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCreator/model/Item',
    'taoQtiItem/qtiCreator/model/qtiClasses',
    'taoQtiItem/qtiItem/helper/itemScore',
    'core/dataProvider/request',
    'taoQtiItem/qtiCreator/widgets/helpers/qtiIdentifier',
    'taoQtiItem/qtiCreator/helper/languages',
    'taoQtiItem/qtiCreator/helper/itemIdentifier'
], function ($, _, Loader, Item, qtiClasses, itemScoreHelper, request, qtiIdentifier, languages, itemIdentifier) {
    'use strict';
    const decodeHtml = function (str) {
        const map = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#039;': "'"
        };
        return str.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function (m) {
            return map[m];
        });
    };

    const qtiNamespace = 'http://www.imsglobal.org/xsd/imsqti_v2p2';

    const qtiSchemaLocation = {
        'http://www.imsglobal.org/xsd/imsqti_v2p2': 'http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd'
    };

    const creatorLoader = {
        loadItem: function loadItem(config, callback) {
            if (config.uri) {
                const langList = languages.getList();

                // request doesn't handle empty response with 200 code. See: core/request.js:240
                const itemRdf = request(config.itemDataUrl, { uri: config.uri }).catch(d => d);

                const containsOnlyIdentifier = data => {
                    const keys = Object.keys(data);
                    return keys && keys.length === 1 && keys[0] === 'identifier';
                };

                Promise.all([langList, itemRdf]).then(([languagesList, data]) => {
                    if (!containsOnlyIdentifier(data.itemData)) {
                        for (const response in data.itemData.responses) {
                            const newObject = {};
                            for (const mapKey in data.itemData.responses[response].mapping) {
                                newObject[decodeHtml(mapKey)] = data.itemData.responses[response].mapping[mapKey];
                            }
                            data.itemData.responses[response].mapping = newObject;
                        }
                    }

                    if (!containsOnlyIdentifier(data.itemData) && data.itemData.qtiClass === 'assessmentItem') {
                        const loader = new Loader().setClassesLocation(qtiClasses);
                        const itemData = data.itemData;

                        loader.loadItemData(itemData, function (loadedItem) {
                            //hack to fix #2652
                            if (loadedItem.isEmpty()) {
                                loadedItem.body('');
                            }

                            // convert item to current QTI version
                            const namespaces = loadedItem.getNamespaces();
                            namespaces[''] = qtiNamespace;
                            loadedItem.setNamespaces(namespaces);
                            loadedItem.setSchemaLocations(qtiSchemaLocation);

                            //add languages list to the item
                            if (languagesList) {
                                loadedItem.data('languagesList', languagesList);
                            }

                            const { responseProcessing: { processingType } = {} } = loadedItem;
                            if (!config.perInteractionRp && processingType === 'templateDriven') {
                                const { responses = {}, responseProcessing: { data, responseRules = [] } = {} } =
                                    itemData;
                                const responseIdentifiers = [];

                                _.forOwn(responses, ({ identifier }) => {
                                    responseIdentifiers.push(identifier);
                                });

                                const itemScoreRP = itemScoreHelper(responseIdentifiers);
                                if (responseRules.some(responseRule => _.isEqual(responseRule, itemScoreRP))) {
                                    loadedItem.responseProcessing.setProcessingType('custom', data);
                                }
                            }

                            callback(loadedItem, this.getLoadedClasses());
                        });
                    } else {
                        const newItem = new Item().id(data.itemData.identifier).attr('title', config.label);

                        newItem.createResponseProcessing();

                        //set default namespaces
                        newItem.setNamespaces({
                            '': qtiNamespace,
                            xsi: 'http://www.w3.org/2001/XMLSchema-instance',
                            m: 'http://www.w3.org/1998/Math/MathML'
                        }); //note : always add math element : since it has become difficult to know when a math element has been added to the item

                        //set default schema location
                        newItem.setSchemaLocations(qtiSchemaLocation);

                        //tag the item as a new one
                        newItem.data('new', true);

                        //add languages list to the item
                        if (languagesList) {
                            newItem.data('languagesList', languagesList);
                        }

                        callback(newItem);
                    }
                });
            }
        }
    };

    return creatorLoader;
});
