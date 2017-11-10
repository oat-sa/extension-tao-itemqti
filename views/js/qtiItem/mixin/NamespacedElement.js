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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */
define(['taoQtiItem/qtiItem/mixin/Mixin', 'lodash'], function(Mixin, _){
    'use strict';

    var methods = {
        getNamespace : function(){
            var relatedItem;
            var namespaces;
            var ns;

            if(this.ns && (this.ns.name || this.ns.uri)){
                return _.clone(this.ns);
            }else{
                relatedItem = this.getRootElement();
                if(relatedItem){
                    namespaces = relatedItem.getNamespaces();
                    for(ns in namespaces){
                        if(namespaces[ns].indexOf(this.nsUriFragment) > 0){
                            return {
                                name : ns,
                                uri : namespaces[ns]
                            };
                        }
                    }
                    //if no ns found in the item, set the default one!
                    relatedItem.namespaces[this.defaultNsName] = this.defaultNsUri;
                    return {
                        name : this.defaultNsName,
                        uri : this.defaultNsUri
                    };
                }
            }

            return {};
        },
        setNamespace : function(name, uri){
            this.ns = {
                name : name,
                uri : uri
            };
        }
    };

    return {
        augment : function(targetClass){
            Mixin.augment(targetClass, methods);
        },
        methods : methods
    };
});