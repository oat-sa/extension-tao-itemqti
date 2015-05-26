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
define(['taoQtiItem/apipCreator/editor/accessElementInfo/registry'], function(accessElementInfoRegistry){

    function creatorApi(apipItem){
        
        function getAccessElement(qtiElement){
            
        }
        
        /**
         * Create an apip accessElement for a qti item body element
         * @returns {Object} the newly create apip access element
         */
        function createAccessElement(qtiElement){
            return {};
        }

        function removeAccessElement(accessElement){
            //access elements may require some serial to make it easier to find
        }
        
        /**
         * Create an access element info from one of the available types
         * Available types are : spoken, brailleText, signing
         * 
         * @param {type} accessElement
         * @param {type} accessElementInfoType
         * @returns {undefined}
         */
        function createAccessElementInfo(accessElement, accessElementInfoType){
            
        }
        
        function removeAccessElementInfo(accessElementInfo){
            //access elementInfos may require some serial to make it easier to find
        }

        return {
        };

    }
    
    return creatorApi;
});