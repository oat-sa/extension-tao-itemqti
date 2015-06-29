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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */
define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'taoQtiItem/qtiCreator/model/helper/event'
], function(_, $, xmlRenderer, event) {
    "use strict";
    var tools = {};

    tools.listenStateChange = function() {

        $(document).on('afterStateInit.qti-widget', function(e, element, state) {
            console.log('->state : ' + state.name + ' : ' + element.serial);
        }).on('afterStateExit.qti-widget', function(e, element, state) {
            console.log('<-state : ' + state.name + ' : ' + element.serial);
        });
    };

    tools.getStates = function(item){

        var states = {},
            elements = item.getComposingElements();

        _.each(elements, function(element){
           var widget = element.data('widget');
           if(widget){
               states[element.getSerial()] = widget.getCurrentState().name;
           }
        });

        return states;
    };
    
    var xmlPreviewWindow;
    
    function getXmlPreviewWindow(){
        xmlPreviewWindow = xmlPreviewWindow || window.open('http://tao.localdomain/taoQtiItem/views/js/qtiXmlRenderer/test/renderer/popup.html', "QTI XML Preview");
        return xmlPreviewWindow;
    }
    
    function closeXmlPreviewWindow(){
        if(xmlPreviewWindow){
            xmlPreviewWindow.close();
        }
    }
    
    tools.liveXmlPreview = function(item) {
        
        getXmlPreviewWindow();
        var rawXml = xmlRenderer.render(item);
        _.delay(function(){
            getXmlPreviewWindow().updateXml(rawXml);
        }, 1000);
            
        //render qti xml:
        $(document).on(event.getList().join(' '), _.throttle(function(){

            var rawXml = xmlRenderer.render(item);
            getXmlPreviewWindow().updateXml(rawXml);

        }, 600));

    };

    return tools;
});
