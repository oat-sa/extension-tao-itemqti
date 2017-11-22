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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCreator/model/Item',
    'taoQtiItem/qtiCreator/model/qtiClasses'
], function($, Loader, Item, qtiClasses){
    "use strict";
    var _generateIdentifier = function _generateIdentifier(uri){
        var pos = uri.lastIndexOf('#');
        return uri.substr(pos + 1);
    };

    var qtiNamespace = 'http://www.imsglobal.org/xsd/imsqti_v2p2';

    var qtiSchemaLocation = {
        'http://www.imsglobal.org/xsd/imsqti_v2p2' : 'http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd'
    };

    var creatorLoader = {
        loadItem : function loadItem(config, callback){

            if(config.uri){
                $.ajax({
                    url : config.itemDataUrl,
                    dataType : 'json',
                    data : {
                        uri : config.uri
                    }
                }).done(function(data){
                    var loader, itemData, newItem;

                    if(data.itemData && data.itemData.qtiClass === 'assessmentItem'){

                        loader = new Loader().setClassesLocation(qtiClasses);
                        itemData = data.itemData;

                        loader.loadItemData(itemData, function(loadedItem){
                            var namespaces;

                            //hack to fix #2652
                            if(loadedItem.isEmpty()){
                                loadedItem.body('');
                            }

                            // convert item to current QTI version
                            namespaces = loadedItem.getNamespaces();
                            namespaces[''] = qtiNamespace;
                            loadedItem.setNamespaces(namespaces);
                            loadedItem.setSchemaLocations(qtiSchemaLocation);

                            //add languages list to the item
                            if (data.languagesList) {
                                loadedItem.data('languagesList', data.languagesList);
                            }

                            callback(loadedItem, this.getLoadedClasses());
                        });
                    }else{

                        newItem = new Item().id(_generateIdentifier(config.uri)).attr('title', config.label);

                        newItem.createResponseProcessing();

                        //set default namespaces
                        newItem.setNamespaces({
                            '' : qtiNamespace,
                            'xsi' : 'http://www.w3.org/2001/XMLSchema-instance',
                            'm' :'http://www.w3.org/1998/Math/MathML'
                        });//note : always add math element : since it has become difficult to know when a math element has been added to the item

                        //set default schema location
                        newItem.setSchemaLocations(qtiSchemaLocation);

                        //tag the item as a new one
                        newItem.data('new', true);

                        //add languages list to the item
                        if (data.languagesList) {
                            newItem.data('languagesList', data.languagesList);
                        }

                        callback(newItem);
                    }

                });
            }
        }
    };

    return creatorLoader;
});
