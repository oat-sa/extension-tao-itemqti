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
    'tpl!taoQtiItem/apipCreator/tpl/selector/elementBlock',
    'tpl!taoQtiItem/apipCreator/tpl/selector/elementInline'
], function (_, $, elementBlockTpl, elementInlineTpl){

    'use strict';

    var _ns = '.apip-selector';

    var _renderers = {
        img : function (){
            return '<img src="' + this.src + '"/>';
        },
        math : function (){
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
        var model = _.find(_selectables, {id : nodeName});
        if(model){
            tplData = {
                qtiClass : model.qtiClass,
                label : model.label,
                content : ''
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

    function renderSelectorView(itemBodyDOM){
        return renderSelectorElement(itemBodyDOM);
    }



    function selectable($container){

        var $currentActive;

        function activateElement($element){
            $element.addClass('active');
            $container.trigger('activated' + _ns, [$element.data('serial')]);
            $currentActive = $element;
        }
        function deactivateElement($element){
            $element.removeClass('active');
            $container.trigger('deactivated' + _ns, [$element.data('serial')]);
        }

        $container.off(_ns).on('mouseenter' + _ns, '.element', function (e){

            e.stopPropagation();
            $(this).addClass('hover');
            $(this).parent().trigger('mouseleave' + _ns);

        }).on('mouseleave' + _ns, '.element', function (e){

//            e.stopPropagation();
            $(this).removeClass('hover');
            $(this).parent().trigger('mouseenter' + _ns);

        }).on('click' + _ns, '.element', function (e){

            e.stopPropagation();
            var $element = $(this);
            if($element.hasClass('active')){
                //toggle off:
                deactivateElement($element, $container);
            }else{
                activateElement($element, $container);
            }

        }).on('activated' + _ns, function (){
            if($currentActive){
                deactivateElement($currentActive, $container);
            }
        });
    }

    return {
        renderSelectorView : renderSelectorView,
        selectable : selectable
    };
});