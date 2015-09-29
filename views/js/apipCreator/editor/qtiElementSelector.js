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
        inlinePlaceholder : function (data){
            return '<span class="element-placeholder">' + data.label + '</span>';
        }
    };

    var _selectables = [
        {qtiClass : 'itemBody', label : 'item body', inline : false},
        //xhtml
        {qtiClass : 'blockquote', label : 'blockquote', inline : false},
        {qtiClass : 'caption', label : 'span', inline : true},
        {qtiClass : 'ol', label : 'span', inline : false},
        {qtiClass : 'li', label : 'span', inline : false},
        {qtiClass : 'object', label : 'span', inline : false},
        {qtiClass : 'a', label : 'span', inline : true},
        {qtiClass : 'abbr', label : 'span', inline : true},
        {qtiClass : 'acronym', label : 'span', inline : true},
        {qtiClass : 'b', label : 'span', inline : true},
        {qtiClass : 'big', label : 'span', inline : true},
        {qtiClass : 'cite', label : 'span', inline : true},
        {qtiClass : 'code', label : 'span', inline : true},
        {qtiClass : 'dfn', label : 'span', inline : true},
        {qtiClass : 'div', label : 'div', inline : false},
        {qtiClass : 'em', label : 'span', inline : true},
        {qtiClass : 'i', label : 'span', inline : true},
        {qtiClass : 'img', label : 'img', inline : true, renderer : _renderers.img},
        {qtiClass : 'kbd', label : 'span', inline : true},
        {qtiClass : 'p', label : 'p', inline : false},
        {qtiClass : 'q', label : 'span', inline : true},
        {qtiClass : 'samp', label : 'span', inline : true},
        {qtiClass : 'small', label : 'span', inline : true},
        {qtiClass : 'span', label : 'span', inline : true},
        {qtiClass : 'strong', label : 'span', inline : true},
        {qtiClass : 'sub', label : 'span', inline : true},
        {qtiClass : 'sup', label : 'span', inline : true},
        {qtiClass : 'table', label : 'span', inline : false},
        {qtiClass : 'tt', label : 'span', inline : true},
        {qtiClass : 'var', label : 'span', inline : true},
        {qtiClass : 'blockquote', label : 'span', inline : false},
        {qtiClass : 'address', label : 'span', inline : false},
        {qtiClass : 'h1', label : 'span', inline : false},
        {qtiClass : 'h2', label : 'span', inline : false},
        {qtiClass : 'h3', label : 'span', inline : false},
        {qtiClass : 'h4', label : 'span', inline : false},
        {qtiClass : 'h5', label : 'span', inline : false},
        {qtiClass : 'h6', label : 'span', inline : false},
        {qtiClass : 'pre', label : 'span', inline : false},
        //interactions
        {qtiClass : 'choiceInteraction', label : 'choice interaction', inline : false},
        {qtiClass : 'associateInteraction', label : 'associate interaction', inline : false},
        {qtiClass : 'orderInteraction', label : 'order interaction', inline : false},
        {qtiClass : 'matchInteraction', label : 'match interaction', inline : false},
        {qtiClass : 'hottextInteraction', label : 'hottext interaction', inline : false},
        {qtiClass : 'gapMatchInteraction', label : 'gap match interaction', inline : false},
        {qtiClass : 'mediaInteraction', label : 'media interaction', inline : false},
        {qtiClass : 'sliderInteraction', label : 'slider interaction', inline : false},
        {qtiClass : 'uploadInteraction', label : 'upload interaction', inline : false},
        {qtiClass : 'drawingInteraction', label : 'drawing interaction', inline : false},
        {qtiClass : 'hotspotInteraction', label : 'hotspot interaction', inline : false},
        {qtiClass : 'graphicAssociateInteraction', label : 'graphic associate interaction', inline : false},
        {qtiClass : 'graphicOrderInteraction', label : 'graphic order interaction', inline : false},
        {qtiClass : 'graphicGapMatchInteraction', label : 'graphic gap match interaction', inline : false},
        {qtiClass : 'selectPointInteraction', label : 'select point interaction', inline : false},
        {qtiClass : 'extendedTextInteraction', label : 'extended text interaction', inline : false},
        {qtiClass : 'endAttemptInteraction', label : 'end attempt interaction', inline : false},
        {qtiClass : 'customInteraction', label : 'custom interaction', inline : false},
        {qtiClass : 'textEntryInteraction', label : 'text entry interaction', inline : true, renderer : _renderers.inlinePlaceholder},
        {qtiClass : 'inlineChoiceInteraction', label : 'inline choice interaction', inline : true, renderer : _renderers.inlinePlaceholder},
        {qtiClass : 'prompt', label : 'prompt', inline : false},
        //choices
        {qtiClass : 'gap', label : 'gap', inline : true},
        {qtiClass : 'gapImg', label : 'gap image', inline : true},
        {qtiClass : 'gapText', label : 'gap text', inline : true},
        {qtiClass : 'hottext', label : 'hottext', inline : true},
        {qtiClass : 'inlineChoice', label : 'choice', inline : false},
        {qtiClass : 'simpleAssociableChoice', label : 'choice', inline : false},
        {qtiClass : 'simpleChoice', label : 'choice', inline : false},
        {qtiClass : 'textEntry', label : 'text antry', inline : true},
        {qtiClass : 'hottext', label : 'hottext', inline : true},
        //others
        {qtiClass : '_container', label : 'text block', inline : false},
        {qtiClass : 'infoControl', label : 'info control', inline : false},
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
                tplData.content = model.renderer.call(elementNode, tplData);
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

        }).on('click' + _ns, function (){
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