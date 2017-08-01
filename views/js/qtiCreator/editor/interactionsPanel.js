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
    'lodash',
    'taoQtiItem/qtiCreator/editor/interactionsToolbar',
    'taoQtiItem/qtiCreator/helper/panel',
    'taoQtiItem/qtiCreator/helper/qtiElements',
    'taoQtiItem/portableElementRegistry/ciRegistry'
], function(_, interactionsToolbar, panel, qtiElements, ciRegistry){
    'use strict';

    /**
     * Set up the interaction selection panel
     * @param {jQueryElement} $container - the panel container
     */
    return function setUpInteractionPanel($container){

        var interactions = qtiElements.getAvailableAuthoringElements();

        _.forIn(ciRegistry.getAllVersions(), function(versions, typeId){
            var data = ciRegistry.getAuthoringData(typeId, {enabledOnly : true});
            if(data && data.tags && data.tags[0] === interactionsToolbar.getCustomInteractionTag()){
                interactions[data.qtiClass] = data;
            }
        });

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
