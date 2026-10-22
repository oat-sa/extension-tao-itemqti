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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

import _ from 'lodash';
import context from 'context';
import themes from 'ui/themes';
import assetManagerFactory from 'taoItems/assets/manager';
import assetStrategies from 'taoItems/assets/strategies';
import module from 'module';
import portableAssetStrategy from 'taoQtiItem/portableElementRegistry/assetManager/portableAssetStrategy';

const itemThemes = themes.get('items');
const moduleConfig = module.config();

//Create asset manager stack
const assetManager = assetManagerFactory(
    [
        {
            name: 'theme',
            handle: url => {
                if (
                    itemThemes &&
                    url.path &&
                    (url.path === itemThemes.base ||
                        (itemThemes.available && itemThemes.available.map(val => val.path).includes(url.path)))
                ) {
                    return context.root_url + url.toString();
                }
            }
        },
        assetStrategies.taomedia,
        assetStrategies.external,
        assetStrategies.base64,
        assetStrategies.itemCssNoCache,
        assetStrategies.baseUrl,
        portableAssetStrategy
    ],
    { baseUrl: '' }
); //baseUrl is not predefined in the config, but should be set upon renderer instantiating

//renderers locations
const locations = {
    assessmentItem: 'taoQtiItem/qtiCommonRenderer/renderers/Item',
    _container: 'taoQtiItem/qtiCommonRenderer/renderers/Container',
    _simpleFeedbackRule: false,
    _tooltip: 'taoQtiItem/qtiCommonRenderer/renderers/Tooltip',
    stylesheet: 'taoQtiItem/qtiCommonRenderer/renderers/Stylesheet',
    outcomeDeclaration: false,
    responseDeclaration: false,
    responseProcessing: false,
    figure: 'taoQtiItem/qtiCommonRenderer/renderers/Figure',
    img: 'taoQtiItem/qtiCommonRenderer/renderers/Img',
    figcaption: 'taoQtiItem/qtiCommonRenderer/renderers/Figcaption',
    math: 'taoQtiItem/qtiCommonRenderer/renderers/Math',
    object: 'taoQtiItem/qtiCommonRenderer/renderers/Object',
    table: 'taoQtiItem/qtiCommonRenderer/renderers/Table',
    printedVariable: 'taoQtiItem/qtiCommonRenderer/renderers/PrintedVariable',
    rubricBlock: 'taoQtiItem/qtiCommonRenderer/renderers/RubricBlock',
    modalFeedback: 'taoQtiItem/qtiCommonRenderer/renderers/ModalFeedback',
    prompt: 'taoQtiItem/qtiCommonRenderer/renderers/interactions/Prompt',
    infoControl: 'taoQtiItem/qtiCommonRenderer/renderers/PortableInfoControl',
    include: 'taoQtiItem/qtiCommonRenderer/renderers/Include',

    // Interactions/Choices customised for reviewRenderer

    choiceInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/ChoiceInteraction',
    extendedTextInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/ExtendedTextInteraction',
    orderInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/OrderInteraction',
    associateInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/AssociateInteraction',
    matchInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/MatchInteraction',
    textEntryInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/TextEntryInteraction',
    sliderInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/SliderInteraction',
    inlineChoiceInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/InlineChoiceInteraction',
    'simpleChoice.choiceInteraction': 'taoQtiItem/reviewRenderer/renderers/choices/SimpleChoice.ChoiceInteraction',
    hottext: 'taoQtiItem/reviewRenderer/renderers/choices/Hottext',
    inlineChoice: 'taoQtiItem/qtiCommonRenderer/renderers/choices/InlineChoice',
    hottextInteraction: 'taoQtiItem/qtiCommonRenderer/renderers/interactions/HottextInteraction',
    hotspotInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/HotspotInteraction',
    hotspotChoice: false,
    associableHotspot: false,
    gapMatchInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/GapMatchInteraction',
    selectPointInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/SelectPointInteraction',
    graphicOrderInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/GraphicOrderInteraction',
    graphicAssociateInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/GraphicAssociateInteraction',
    graphicGapMatchInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/GraphicGapMatchInteraction',
    uploadInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/UploadInteraction',
    customInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/PortableCustomInteraction',
    mediaInteraction: 'taoQtiItem/reviewRenderer/renderers/interactions/MediaInteraction',

    // Interactions/Choices inherited from qtiCommonRenderer

    gap: 'taoQtiItem/qtiCommonRenderer/renderers/choices/Gap',
    gapText: 'taoQtiItem/qtiCommonRenderer/renderers/choices/GapText',
    'simpleChoice.orderInteraction': 'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleChoice.OrderInteraction',
    'simpleAssociableChoice.matchInteraction':
        'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleAssociableChoice.MatchInteraction',
    'simpleAssociableChoice.associateInteraction':
        'taoQtiItem/qtiCommonRenderer/renderers/choices/SimpleAssociableChoice.AssociateInteraction',
    gapImg: 'taoQtiItem/qtiCommonRenderer/renderers/choices/GapImg',
    endAttemptInteraction: 'taoQtiItem/qtiCommonRenderer/renderers/interactions/EndAttemptInteraction'
};

export default {
    name: 'reviewRenderer',
    locations,
    options: {
        assetManager,
        themes: itemThemes,
        enableDragAndDrop: {
            associate: !!moduleConfig.associateDragAndDrop,
            gapMatch: !!moduleConfig.gapMatchDragAndDrop,
            graphicGapMatch: !!moduleConfig.graphicGapMatchDragAndDrop,
            order: !!moduleConfig.orderDragAndDrop
        },
        messages: moduleConfig.messages
    }
};
