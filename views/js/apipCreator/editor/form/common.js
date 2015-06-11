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
define([
    'ui/feedback',
    'taoQtiItem/apipCreator/editor/form/common',
    'taoQtiItem/apipCreator/editor/inclusionOrderSelector'
], function(feedback, inclusionOrderSelector) {
    'use strict';
    
    function Form() {
        
    }
    
    Form.prototype.getAttributeValue = function getAttributeValue(attributeName) {
        var that = this,
            aeInfo = this.accessElementInfo,
            ae = aeInfo.getAssociatedAccessElement(),
            qtiElements,
            result = this.accessElementInfo.getAttribute(attributeName);
        
        if (!result) {
            qtiElements = ae.getQtiElements();
            if (qtiElements.length) {
                result = $(qtiElements[0].data).text();
            }
        }
        
        return result;
    };
    
    Form.prototype.initEvents = function initEvents($container) {
        var that = this,
            aeInfo = this.accessElementInfo;
        
        $container.on('change', 'input', function(){
            var $input = $(this),
                name = $input.attr('name'),
                value = $input.val();
                
            aeInfo.setAttribute(name, value);
        });
        
        $container.on('click', '.delete', function() {
            var ae = aeInfo.getAssociatedAccessElement();
            aeInfo.remove();
            ae.removeInclusionOrder(inclusionOrderSelector.getValue());
            
            if (ae.getAccessElementInfo() === null) {
                ae.remove();
            }
            feedback().info('Access element removed.');
            $container.trigger('destroy');
        });
    };
    
    return Form;
});