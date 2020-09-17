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
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiXmlRenderer/renderers/RendererPerInteractionRP',
], function(loggerFactory, XmlRenderer, maxScore, Element, XmlRendererPerInteractionRP){
    'use strict';

    let perInteractionRPEnabled = false;

    const logger = loggerFactory('taoQtiItem/qtiCreator/helper/xmlRenderer');

    const _xmlRenderer = new XmlRenderer({
        shuffleChoices : false
    }).load();

    const _xmlRendererPerInteractionRP = new XmlRendererPerInteractionRP({
        shuffleChoices : false
    }).load();

    /**
     * Render elment to XML
     *
     * @param {Object} element
     * @param {Object} options
     * @param {string} options.notAllowTemplate - not allow to render as response processing template
     *
     * @returns {String} rendered XML
     */
    var _render = function(element, options){
        var xml = '';
        try{
            if(element instanceof Element) {
                if (element.is('assessmentItem')) {
                    maxScore.setNormalMaximum(element);
                    maxScore.setMaxScore(element);
                }

                xml = element.render(
                    perInteractionRPEnabled ? _xmlRendererPerInteractionRP : _xmlRenderer,
                    options
                );
            }
        }catch(e){
            logger.error(e);
        }
        return xml;
    };

    return {
        render : _render,
        get() {
            return perInteractionRPEnabled
                ? _xmlRendererPerInteractionRP
                : _xmlRenderer;
        },
        switchPerInteractionRP(enabled) {
            perInteractionRPEnabled = enabled;
        }
    };
});
