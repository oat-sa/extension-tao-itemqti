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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA;
 */

define([
    'taoItems/assets/manager',
    'taoItems/assets/strategies',
], function(assetManagerFactory, assetStrategies){
    'use strict';

    //asset manager using base url
    var assetManager = assetManagerFactory([
        assetStrategies.taomedia,
        assetStrategies.external,
        assetStrategies.base64,
        assetStrategies.baseUrl
    ], {baseUrl : ''});

    var locations = {
        'assessmentItem' : 'taoQtiItem/qtiCommonRenderer/renderers/Item',
        '_container' : 'taoQtiItem/qtiCommonRenderer/renderers/Container',
        '_simpleFeedbackRule' : false,
        'stylesheet' : 'taoQtiItem/qtiCommonRenderer/renderers/Stylesheet',
        'outcomeDeclaration' : false,
        'responseDeclaration' : false,
        'responseProcessing' : false,
        'img' : 'taoQtiItem/qtiCommonRenderer/renderers/Img',
        'math' : 'taoQtiItem/qtiCommonRenderer/renderers/Math',
        'object' : 'taoQtiItem/qtiCommonRenderer/renderers/Object',
        'rubricBlock' : 'taoQtiItem/qtiCommonRenderer/renderers/RubricBlock',
        'modalFeedback' : 'taoQtiItem/qtiCommonRenderer/renderers/ModalFeedback',
        'prompt' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/Prompt',
        'choiceInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/ChoiceInteraction',
        'extendedTextInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/ExtendedTextInteraction',
        'orderInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/OrderInteraction',
        'associateInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/AssociateInteraction',
        'matchInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/MatchInteraction',
        'textEntryInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/TextEntryInteraction',
        'sliderInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/SliderInteraction',
        'inlineChoiceInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/InlineChoiceInteraction',
        'simpleChoice.choiceInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleChoice.ChoiceInteraction',
        'simpleChoice.orderInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleChoice.OrderInteraction',
        'hottext' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/Hottext',
        'gap' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/Gap',
        'gapText' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/GapText',
        'simpleAssociableChoice.matchInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleAssociableChoice.MatchInteraction',
        'simpleAssociableChoice.associateInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleAssociableChoice.AssociateInteraction',
        'inlineChoice' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/InlineChoice',
        'hottextInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/HottextInteraction',
        'hotspotInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/HotspotInteraction',
        'hotspotChoice' : false,
        'gapMatchInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/GapMatchInteraction',
        'selectPointInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/SelectPointInteraction',
        'graphicOrderInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/GraphicOrderInteraction',
        'mediaInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/MediaInteraction',
        'uploadInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/UploadInteraction',
        'graphicGapMatchInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/GraphicGapMatchInteraction',
        'gapImg' : 'taoQtiItem/qtiCommonRenderer/renderers/choices/GapImg',
        'graphicAssociateInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/GraphicAssociateInteraction',
        'associableHotspot' : false,
        'customInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/PortableCustomInteraction',
        'infoControl' : 'taoQtiItem/qtiCommonRenderer/renderers/PortableInfoControl',
        'include' : 'taoQtiItem/qtiCommonRenderer/renderers/Include',
        'endAttemptInteraction' : 'taoQtiItem/qtiCommonRenderer/renderers/interactions/EndAttemptInteraction'
    };
    return {
        name:'commonRenderer',
        locations: locations,
        options:   {
            assetManager: assetManager
        }
    };
});




