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
 * Copyright (c) 2014-2018 (original work) Open Assessment Technologies SA
 *
 */
define(['jquery', 'lodash', 'taoQtiItem/qtiCreator/model/qtiClasses'], function($, _, qtiClasses){
    "use strict";
    var methods = {
        createElements : function(container, body, callback){

            var regex = /{{([a-z_]+)\.?([a-z_]*):new}}/ig;

            //first pass to get required qti classes, but do not replace
            var required = {};
            body.replace(regex,
                function(original, qtiClass){
                    if(qtiClasses[qtiClass]){
                        required[qtiClass] = qtiClasses[qtiClass];
                    }else{
                        throw new Error('missing required class : ' + qtiClass);
                    }
                });

            //second pass after requiring classes:
            require(_.values(required), function(){

                //register and name all loaded classes:
                var Qti = _.reduce([].slice.call(arguments), function (acc, qtiClassElt) {
                    acc[qtiClassElt.prototype.qtiClass] = qtiClassElt;

                    return acc;
                }, {});
                var promises = [];
                var $doc = $(document);

                //create new elements
                var newElts = {};
                var newBody = body.replace(regex,
                    function(original, qtiClass, subClass){
                        var elt = new Qti[qtiClass]();
                        if(Qti[qtiClass]){
                            //create new element
                            if(container.getRenderer()){
                                elt.setRenderer(container.getRenderer());
                            }
                            newElts[elt.getSerial()] = elt;

                            //manage sub-classed qtiClass
                            if(subClass){
                                //@todo generalize it from customInteraction
                                elt.typeIdentifier = subClass;
                            }

                            return elt.placeholder();
                        }else{
                            return original;
                        }
                    });

                //insert them:
                container.setElements(newElts, newBody);

                //operations after insertions:
                _.forEach(newElts, function(elt){
                    if(_.isFunction(elt.buildIdentifier)){
                        elt.buildIdentifier();
                    }
                    if(_.isFunction(elt.afterCreate)){
                        promises.push(elt.afterCreate());
                    }
                });

                if(typeof(callback) === 'function'){
                    Promise.all(promises).then(function(){
                        _.forEach(newElts, function(elt){
                            $doc.trigger('elementCreated.qti-widget', {parent : container.parent(), element : elt});
                        });
                        callback.call(container, newElts);
                    }).catch(function(err){
                        container.getRenderer().getCreatorContext().trigger('error', err);
                    });
                }
            });

        }
    };

    return methods;
});
