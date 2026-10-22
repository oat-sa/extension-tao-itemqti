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

/**
 * @author Ansul Sharma <ansultaotesting.com>
 */
import $ from 'jquery';
import 'core/mouseEvent';
import orderInteraction from 'taoQtiItem/qtiCommonRenderer/renderers/interactions/OrderInteraction';
import containerHelper from 'taoQtiItem/qtiCommonRenderer/helpers/container';

const _freezeSize = function($container) {
    const $orderArea = $container.find('.order-interaction-area');
    $orderArea.height($orderArea.height());
};

/**
 * Init rendering, called after template injected into the DOM
 * All options are listed in the QTI v2.1 information model:
 * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10283
 *
 * @param {Object} interaction - the interaction instance
 */
const render = function(interaction) {
    const $container = containerHelper.get(interaction);

    const orderState = interaction.attr('data-order') || interaction.attr('order');
    if (orderState === 'single') {
        const $choiceArea = $container.find('.choice-area');
        const $resultArea = $container.find('.result-area');
        $container.addClass('test-preview');
        $resultArea.append($choiceArea.children('.qti-choice'));
    }

    //bind event listener in case the attributes change dynamically on runtime
    $(document).on('attributeChange.qti-widget.commonRenderer', (e) => e.preventDefault());

    _freezeSize($container);
};

/**
 * Expose the common renderer for the order interaction
 * @exports qtiCommonRenderer/renderers/interactions/OrderInteraction
 */
export default Object.assign({}, orderInteraction, {render});
