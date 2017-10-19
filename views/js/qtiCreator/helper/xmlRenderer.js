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
 * Copyright (c) 2015-2017 (original work) Open Assessment Technologies SA ;
 */
define([
    'core/logger',
    'taoQtiItem/qtiXmlRenderer/renderers/Renderer',
    'taoQtiItem/qtiItem/helper/maxScore',
    'taoQtiItem/qtiItem/core/Element'
], function(loggerFactory, XmlRenderer, maxScore, Element){
    'use strict';

    var logger = loggerFactory('taoQtiItem/qtiCreator/helper/xmlRenderer');

    var _xmlRenderer = new XmlRenderer({
        shuffleChoices : false
    }).load();

    var _render = function(element){
        var xml = '';
        try{
            if(element instanceof Element) {
                if (element.is('assessmentItem')) {
                    maxScore.setNormalMaximum(element);
                    maxScore.setMaxScore(element);
                }
                xml = element.render(_xmlRenderer);
            }
        }catch(e){
            logger.error(e);
        }
        return xml;
    };

    return {
        render : _render,
        get : function(){
            return _xmlRenderer;
        }
    };
});
