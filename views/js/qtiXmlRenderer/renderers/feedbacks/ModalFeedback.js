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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA
 */
define(['tpl!taoQtiItem/qtiXmlRenderer/tpl/element', 'taoQtiItem/qtiItem/helper/container'], function(tpl, containerHelper){
    'use strict';
    
    var classPrefix = 'x-tao-relatedOutcome-';
    
    function encodeOutcomeInfo(fb){
        
        var relatedResponse = fb.data('relatedResponse');
        var oldRelatedOutcomeInfo = '', $fbBody, matches;

        //encode the related outcome into a css class
        if(relatedResponse && relatedResponse.attr('identifier')){

            //find the old one (if applicable)
            $fbBody = containerHelper.getBodyDom(fb);
            if($fbBody && $fbBody.length && $fbBody.attr('class')){
                var regex = new RegExp(classPrefix+'([a-zA-Z0-9\-._]*)');
                matches = $fbBody.attr('class').match(regex);
                if(matches){
                    oldRelatedOutcomeInfo = matches[0];
                }
            }
            //set the new one
            containerHelper.setBodyDomClass(fb, classPrefix+relatedResponse.attr('identifier'), oldRelatedOutcomeInfo);
        }
    }
    
    return {
        qtiClass : 'modalFeedback',
        template : tpl,
        getData : function getData(fb, data){
            
            encodeOutcomeInfo(fb);
            data.body = fb.body();
            
            return data;
        }
    };
});