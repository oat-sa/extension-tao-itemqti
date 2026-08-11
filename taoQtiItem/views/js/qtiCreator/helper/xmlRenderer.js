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
    'taoQtiItem/qtiXmlRenderer/helper/umfiTextEntryXmlAttributes',
    'taoQtiItem/qtiCreator/helper/textEntryEvaluationHelper'
], function (
    loggerFactory,
    XmlRenderer,
    maxScore,
    Element,
    XmlRendererPerInteractionRP,
    umfiTextEntryXmlAttributes,
    textEntryEvaluationHelper
) {
    'use strict';

    const logger = loggerFactory('taoQtiItem/qtiCreator/helper/xmlRenderer');

    const xmlRendererProviders = {
        default: new XmlRenderer({
            shuffleChoices: false
        }).load(),
        perInteractionRP: new XmlRendererPerInteractionRP({
            shuffleChoices: false
        }).load()
    };

    // set default xml renderer provider
    let xmlRenderer = xmlRendererProviders.default;

    /**
     * Render elment to XML
     *
     * @param {Object} element
     * @param {Object} options
     * @param {string} options.notAllowTemplate - not allow to render as response processing template
     *
     * @returns {String} rendered XML
     */
    var _render = function (element, options) {
        var xml = '';
        try {
            // Prefer duck-typing over instanceof: creator Item and Element can come from
            // different AMD resolutions (source vs @oat-sa/tao-item-runner-qti dist).
            const isAssessmentItem =
                element &&
                typeof element.is === 'function' &&
                element.is('assessmentItem') &&
                typeof element.render === 'function';

            if (isAssessmentItem || element instanceof Element) {
                if (isAssessmentItem || (element.is && element.is('assessmentItem'))) {
                    textEntryEvaluationHelper.syncTextContainersFromDom(element);
                    textEntryEvaluationHelper.migrateFeatureDataAttributesToPrimary({
                        getRootElement: function getRootElement() {
                            return element;
                        }
                    });
                    maxScore.setNormalMaximum(element);
                    maxScore.setMaxScore(element);
                }

                xml = element.render(xmlRenderer, options);

                if (isAssessmentItem || (element.is && element.is('assessmentItem'))) {
                    xml = umfiTextEntryXmlAttributes.relocateFeatureDataAttrsToFirstTextEntry(xml);
                    xml = umfiTextEntryXmlAttributes.stripInternalAuthoringAttrsFromItemXml(xml);
                }
            }
        } catch (e) {
            logger.error(e);
        }
        return xml;
    };

    return {
        render: _render,
        get() {
            return xmlRenderer;
        },
        setProvider(providerName) {
            if (!xmlRendererProviders[providerName]) {
                throw new Error('Unknown xml renderer provider');
            }

            xmlRenderer = xmlRendererProviders[providerName];
        }
    };
});
