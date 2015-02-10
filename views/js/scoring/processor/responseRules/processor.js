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
 * Copyright (c) 2015 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash'
], function(_){
    'use strict';


    //keeps the references of processors (this is something we may load dynamically)
    var processors = {};

    var responseRuleProcessor = function responseRuleProcessor(rule, context){

        var name      = rule.qtiClass;
        var processor = processors[name];


        if(!processor){
            throw new Error('No processor found for ' + name);
        }

        processor = _.defaults(context || {}, processor);

        return {
            process : function process(){
                //forward the call to the related expression processor
                return processor.process.apply(processor, [].slice.call(arguments, 1));
            }
        };
    };

    /**
     * Register a processor
     * @param {String} name - the processor name
     * @param {ResponseRuleProcessor} processor - the processor to register
     * @throws {TypeError} when a parameter isn't valid
     */
    responseRuleProcessor.register = function register(name, processor){

        if(_.isEmpty(name)){
            throw new TypeError('Please give a valid name to your processor');
        }
        if(!_.isPlainObject(processor) || !_.isFunction(processor.process)){
            throw new TypeError('The processor must be an object that contains a process method.');
        }

        processors[name] = processor;
    };

    /**
     * @exports taoQtiItem/scoring/processor/responseRule/processor
     */
    return responseRuleProcessor;
});
