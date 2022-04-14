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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 *
 */

/**
 * This module let's you set up the interaction panel
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'taoQtiItem/qtiCreator/editor/interactionsToolbar',
    'taoQtiItem/qtiCreator/helper/panel',
    'taoQtiItem/qtiCreator/helper/qtiElements',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'services/features'
], function (interactionsToolbar, panel, qtiElements, ciRegistry, featuresService) {
    'use strict';

    /**
     * Set up the interaction selection panel
     * @param {jQueryElement} $container - the panel container
     */
    return function setUpInteractionPanel($container) {
        const availableInteractions = qtiElements.getAvailableAuthoringElements();

        //filter out interaction not visible
        const interactions = Object.keys(availableInteractions).reduce((acc, interactionId) => {
            //we assume the key looks like `item/interaction/associate`
            if (featuresService.isVisible(`item/interaction/${interactionId.replace(/Interaction$/, '')}`)) {
                acc[interactionId] = availableInteractions[interactionId];
            }
            return acc;
        }, {});

        for (const typeId in ciRegistry.getAllVersions()) {
            const data = ciRegistry.getAuthoringData(typeId, { enabledOnly: true });
            if (data && data.tags && data.tags[0] === interactionsToolbar.getCustomInteractionTag()) {
                interactions[data.qtiClass] = data;
            }
        }

        //create toolbar:
        interactionsToolbar.create($container, interactions);

        //init accordions:
        panel.initSidebarAccordion($container);
        panel.closeSections($container.find('section'));
        panel.openSections($container.find('#sidebar-left-section-common-interactions'), false);

        //init special subgroup
        panel.toggleInlineInteractionGroup();
    };
});
