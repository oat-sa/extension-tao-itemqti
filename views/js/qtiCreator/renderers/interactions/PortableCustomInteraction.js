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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA
 *
 */

/**
 * PCI Creator Renderer
 */
define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/PortableCustomInteraction',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/qtiCreator/helper/commonRenderer'
], function(_, Renderer, ciRegistry, commonRenderer){
    'use strict';

    //clone the common renderer
    var CreatorCustomInteraction = _.clone(Renderer);

    /**
     * Override the render method
     */
    CreatorCustomInteraction.render = function render(interaction, options){

        var pciCreator = ciRegistry.getCreator(interaction.typeIdentifier).module;

        options = options || {};
        options.baseUrl = this.getOption('baseUrl');
        options.mediaManager = this.getOption('mediaManager');
        options.uri = this.getOption('uri');
        options.lang = this.getOption('lang');

        //initial rendering:
        Renderer.render.call(commonRenderer.get(), interaction);

        if(pciCreator){
            pciCreator.getWidget().build(
                interaction,
                Renderer.getContainer(interaction),
                this.getOption('interactionOptionForm'),
                this.getOption('responseOptionForm'),
                options
            );
        }else{
            //in case the pci has been imported with a runtime only (no creator)
            //@todo allow deleting it
        }

    };

    return CreatorCustomInteraction;
});
