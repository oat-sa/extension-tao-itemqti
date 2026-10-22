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
 * Copyright (c) 2020-2021 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * @author Ansul Sharma <ansultaotesting.com>
 */
import template from 'taoQtiItem/reviewRenderer/tpl/interactions/customInteraction';
import portableCustomInteraction from 'taoQtiItem/qtiCommonRenderer/renderers/interactions/PortableCustomInteraction';
import util from 'taoQtiItem/qtiItem/helper/util';
import PortableElement from 'taoQtiItem/qtiCommonRenderer/helpers/PortableElement';
import { isInteractionDisabledForPci } from 'taoQtiItem/reviewRenderer/helpers/pci';

const getData = function (customInteraction, data) {
    let markup = data.markup;
    const isInteractionDisabled = isInteractionDisabledForPci(data.typeIdentifier);

    // Set review mode on for PCI
    customInteraction.properties.isReviewMode = true;

    //remove ns + fix media file path
    markup = util.removeMarkupNamespaces(markup);
    markup = PortableElement.fixMarkupMediaSources(markup, this);

    return Object.assign({}, data, { markup, isInteractionDisabled });
};

/**
 * Set back response for review mode
 * @param {Object} interaction
 * @param {Object} serializedState
 */
const setState = (interaction, serializedState) => {
    const pciRenderer = interaction.data('pci-renderer');

    // IMS renderer has a special function to restore response
    if (typeof pciRenderer.setReviewState === 'function') {
        pciRenderer.setReviewState(interaction, serializedState);
    } else {
        pciRenderer.setState(interaction, serializedState);
    }
};

export default Object.assign({}, portableCustomInteraction, { template, getData, setState });
