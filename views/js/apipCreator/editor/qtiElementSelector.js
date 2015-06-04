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
    'tpl!taoQtiItem/apipCreator/tpl/qtiElementSelector/elementInline'
], function(_, $, selectorTpl, elementBlockTpl, elementInlineTpl){

    'use strict';

    var _ns = '.qti-element-selector';

    var _renderers = {
        img : function(){
            return '<img src="' + this.src + '"/>';
        },
        math : function(){
            return '<math>' + this.innerHTML + '</math>';
        }
    };

    var _selectables = [
        {id : 'itembody', qtiClass : 'itemBody', label : 'item body', inline : false},
        {id : 'caption', qtiClass : 'caption', label : 'caption', inline : true},
        {id : 'div', qtiClass : 'div', label : 'div', inline : false},
        {id : 'img', qtiClass : 'img', label : 'img', inline : true, renderer : _renderers.img},
        {id : 'span', qtiClass : 'span', label : 'span', inline : true},
        {id : 'choiceinteraction', qtiClass : 'choiceInteraction', label : 'choice interaction', inline : false},
        {id : 'prompt', qtiClass : 'prompt', label : 'prompt', inline : false},
        {id : 'simplechoice', qtiClass : 'simpleChoice', label : 'choice', inline : false},
        {id : 'p', qtiClass : 'p', label : 'p', inline : false},
        {id : 'math', qtiClass : 'math', label : 'math', inline : true, renderer : _renderers.math}
    ];

    function renderSelectorElement(elementNode){

        var rendering, tplData;
        var nodeName = elementNode.nodeName.toLowerCase();
        var serial;
//        var serial = elementNode.getAttribute('serial');
        var model = _.find(_selectables, {id : nodeName});

        if(model){
            tplData = {
                qtiClass : model.qtiClass,
                label : model.label,
                content : '',
                serial : serial
            };

            //render inner content:
            if(model.renderer){
                tplData.content = model.renderer.call(elementNode);
            }else{
                _.each(elementNode.childNodes, function(node){
                    if(node.nodeType === 3 && node.data.trim()){
                        //text node:
                        tplData.content += node.data;
                    }else{
                        //node type:
                        var content = renderSelectorElement(node);
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

    function render($container, itemBodyDOM){

        var selectorBody = renderSelectorElement(itemBodyDOM);
        $container.append(selectorTpl({selectorBody : selectorBody}));

        //make it also selectable:
        selectable($container);
    }

    /**
     * Init selectable behaviour and bind events to the given container
     * 
     * @param {JQuery} $container
     * @fires "activated.qti-element-selector" when an element is "on focus" so selected
     * @fires "deactivated.qti-element-selector" when an element is "blurred" so unselected
     * @returns {undefined}
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

        $container.off(_ns).on('mouseenter' + _ns, '.element', function(e){

            e.stopPropagation();
            $(this).addClass('hover');
            $(this).parent().trigger('mouseleave' + _ns);

        }).on('mouseleave' + _ns, '.element', function(e){

            $(this).removeClass('hover');
            $(this).parent().trigger('mouseenter' + _ns);

        }).on('click' + _ns, '.element', function(e){

            e.stopPropagation();
            var $element = $(this);
            if($element.hasClass('active')){
                //toggle off:
                deactivateElement($element, $container);
            }else{
                activateElement($element, $container);
            }

        });
    }

    function resetQtiAccessElements($container){
        $container.find('.apipfied').removeClass(function(index, css){
            var classes = css.match(/(^|\s)apip-feature-\S+/g) || [];
            classes.push('apipfied');
            return classes.join(' ');
        }).removeData('apip-features');
    }

    function setQtiAccessElements($container, qtiElementSerial, inclusionOrder, accessElementSerials){
        if(_.isArray(accessElementSerials) && accessElementSerials.lenght){
            var $qtiElement = $container.find('.element[serial=' + qtiElementSerial + ']');
            $qtiElement.addClass('apipfied').addClass('apip-feature-' + inclusionOrder);
            var features = $qtiElement.data('apip-features') || {};
            if(!features[inclusionOrder]){
                features[inclusionOrder] = [];
            }
            features[inclusionOrder].push(accessElementSerials);
            $qtiElement.data('apip-features', features);
        }
    }

    return {
        render : render,
        selectable : selectable,
        setQtiAccessElements : setQtiAccessElements,
        resetQtiAccessElements : resetQtiAccessElements
    };
});