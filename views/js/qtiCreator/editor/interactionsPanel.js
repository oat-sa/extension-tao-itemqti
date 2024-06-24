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
], function (interactionsToolbar, panel, qtiElements, ciRegistry, features) {
    'use strict';

    /**
     * Set up the interaction selection panel
     * @param {jQueryElement} $container - the panel container
     */
    return function setUpInteractionPanel($container) {
        const interactions = qtiElements.getAvailableAuthoringElements();
        const liquidsInteractionAvailable = features.isVisible('taoQtiItem/creator/interaction/pci/liquidsInteraction');
        const liquidsInteractionId = 'liquidsInteraction';
        for (const typeId in ciRegistry.getAllVersions()) {
            if(typeId === liquidsInteractionId && !liquidsInteractionAvailable) continue;
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
