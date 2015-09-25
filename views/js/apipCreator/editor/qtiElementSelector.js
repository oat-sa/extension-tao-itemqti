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
    'lodash',
    'jquery',
    'tpl!taoQtiItem/apipCreator/tpl/qtiElementSelector/selector',
    'tpl!taoQtiItem/apipCreator/tpl/qtiElementSelector/elementBlock',
    'tpl!taoQtiItem/apipCreator/tpl/qtiElementSelector/elementInline',
    'taoQtiItem/apipCreator/editor/inclusionOrderSelector'
], function (_, $, selectorTpl, elementBlockTpl, elementInlineTpl, inclusionOrderSelector){

    'use strict';

    var _ns = '.qti-element-selector';

    var _renderers = {
        img : function (){
            return '<img src="' + this.getAttribute('src') + '"/>';
        },
        math : function (){
            return '<math>' + this.innerHTML + '</math>';
        },
        inlinePlaceholder : function (){
            return '<span class="element-placeholder">' + this.tagName + '</span>';
        }
    };

    var _selectables = [
        {qtiClass : 'itemBody', label : 'item body', inline : false},
        {qtiClass : 'caption', label : 'caption', inline : true},
        {qtiClass : 'div', label : 'div', inline : false},
        {qtiClass : 'img', label : 'img', inline : true, renderer : _renderers.img},
        {qtiClass : 'span', label : 'span', inline : true},
        {qtiClass : 'choiceInteraction', label : 'choice interaction', inline : false},
        {qtiClass : 'textEntryInteraction', label : 'text entry interaction', inline : true, renderer : _renderers.inlinePlaceholder},
        {qtiClass : 'inlineChoiceInteraction', label : 'inline choice interaction', inline : true, renderer : _renderers.inlinePlaceholder},
        {qtiClass : 'prompt', label : 'prompt', inline : false},
        {qtiClass : 'simpleChoice', label : 'choice', inline : false},
        {qtiClass : 'p', label : 'p', inline : false},
        {qtiClass : 'blockquote', label : 'blockquote', inline : false},
        {qtiClass : 'math', label : 'math', inline : true, renderer : _renderers.math}
    ];
    
    /**
     * Wrap each element listed in _selectables with a specific decorated wrapper
     * and return the rendered html
     * 
     * @param {object} elementNode
     * @returns {unresolved}
     */
    function _renderSelectorElement(elementNode){

        var rendering, tplData;
        var nodeName = elementNode.tagName;
        var model = _.find(_selectables, {qtiClass : nodeName});
        if(elementNode.nodeType === 1 && model){

            tplData = {
                qtiClass : model.qtiClass,
                label : model.label,
                content : '',
                serial : elementNode.getAttribute('serial')
            };

            //render inner content:
            if(model.renderer){
                tplData.content = model.renderer.call(elementNode);
            }else{
                _.each(elementNode.childNodes, function (node){
                    if(node.nodeType === 3 && node.data.trim()){
                        //text node:
                        tplData.content += node.data;
                    }else{
                        //node type:
                        var content = _renderSelectorElement(node);
                        tplData.content += content ? content : '';
                    }
                });
            }

            //call rendering tpl
            if(model.inline){
                rendering = elementInlineTpl(tplData);
            }else{
                rendering = elementBlockTpl(tplData);
            }
        }

        return rendering;
    }
    
    /**
     * Initialize the selector of an itemBody XML dom object adn bind events to interact with it
     * 
     * @param {JQuery} $container
     * @param {object} itemBodyDOM
     * @returns {string}
     */
    function render($container, itemBodyDOM){

        var selectorBody = _renderSelectorElement(itemBodyDOM);
        $container.append(selectorTpl({selectorBody : selectorBody}));
        
        //@todo listen to ordering elements
        
        //make it also selectable:
        return selectable($container);
    }

    /**
     * Init selectable behaviour and bind events to the given container
     * 
     * @param {JQuery} $container
     * @fires activated.qti-element-selector - when an element is "on focus" so selected
     * @fires deactivated.qti-element-selector - when an element is "blurred" so unselected
     * @returns {object} - return the selectable api to enable programmatically activate and deactive elements
     */
    function selectable($container){

        var $currentActive;

        function activateElement($element){

            //only one element active at once
            if($currentActive){
                deactivateElement($currentActive, $container);
            }

            $element.addClass('active');
            $currentActive = $element;
            $container.trigger('activated' + _ns, [$element.data('serial'), $element]);
        }

        function deactivateElement($element){
            $element.removeClass('active');
            $container.trigger('deactivated' + _ns, [$element.data('serial'), $element]);
        }

        $container.off(_ns).on('mouseenter' + _ns, '.element:not(.qti-itemBody)', function (e){

            e.stopPropagation();
            $(this).addClass('hover');
            $(this).parent().trigger('mouseleave' + _ns);

        }).on('mouseleave' + _ns, '.element:not(.qti-itemBody)', function (e){

            $(this).removeClass('hover');
            $(this).parent().trigger('mouseenter' + _ns);

        }).on('click' + _ns, '.element:not(.qti-itemBody)', function (e){

            e.stopPropagation();
            var $element = $(this);
            if(!$element.hasClass('active')){
                activateElement($element, $container);
            }

        }).on('click'+_ns, function(){
            deactivateElement($currentActive, $container);
        });

        return {
            activate : function (serial){
                var $element = $container.find('.element[data-serial="' + serial + '"]');
                activateElement($element);
            },
            deactivate : function (){
                if($currentActive){
                    deactivateElement($currentActive);
                    $currentActive.removeClass('hover');
                }
            }
        };
    }
    
    /**
     * Add css classes to elements that has a defined apip feature 
     * that is being used in the given inclusionOrder
     * 
     * @param {JQuery} $container
     * @param {Object} apipItem
     * @param {type} inclusionOrderName
     * @returns {undefined}
     */
    function setApipFeatures($container, apipItem, inclusionOrderName){

        //check inclusionOrder and 
        //set inclusionOrder css class
        if(true){
            $container.addClass('apip-feature-order-' + inclusionOrderName);
        }

        //get ae
        var accessElements = apipItem.getAccessElementsByInclusionOrder(inclusionOrderName);

        //check feature presence
        var inclOrder = inclusionOrderSelector.getInclusionOrder(inclusionOrderName);
        var aeInfoType = inclOrder.accessElementInfo.type;
        _.each(accessElements, function (ae){
            var aeInfo = ae.getAccessElementInfo(aeInfoType);
            if(aeInfo){
                //feature detected
                var qtiElements = ae.getQtiElements();
                _.each(qtiElements, function (qtiElement){
                    //set feature css class to qti element
                    $container.find('.element[data-serial="' + qtiElement.serial + '"]').addClass('apip-feature-info-' + aeInfoType);
                });
            }
        });
    }
    
    /**
     * Remove all added classes set by 
     * @param {type} $container
     * @returns {undefined}
     */
    function resetApipFeatures($container){
        $container.find('.element').addBack().removeClass(function (index, css){
            var classes = css.match(/(^|\s)apip-feature-\S+/g) || [];
            return classes.join(' ');
        });
    }

    return {
        render : render,
        selectable : selectable,
        setApipFeatures : setApipFeatures,
        resetApipFeatures : resetApipFeatures
    };
});