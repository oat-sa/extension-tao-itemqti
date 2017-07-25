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
 * Portable Info Control Creator Renderer
 */
define([
    'lodash',
    'taoQtiItem/qtiCommonRenderer/renderers/PortableInfoControl',
    'taoQtiItem/portableElementRegistry/icRegistry',
    'taoQtiItem/qtiCreator/helper/commonRenderer'
], function(_, Renderer, icRegistry, commonRenderer){
    'use strict';

    //clone the common renderer
    var CreatorPortableInfoControl = _.clone(Renderer);

    /**
     * override the render method
     */
    CreatorPortableInfoControl.render = function render(infoControl, options){

        var self = this;

        //initial rendering:
        return new Promise(function(resolve, reject) {
            Renderer.render.call(commonRenderer.get(), infoControl).then(function () {

                var picCreator = icRegistry.getCreator(infoControl.typeIdentifier).module;
                if (picCreator) {

                    //add extra options required to setup the resource manager
                    options = options || {};
                    options.baseUrl = self.getOption('baseUrl');
                    options.uri = self.getOption('uri');
                    options.lang = self.getOption('lang');
                    options.mediaManager = self.getOption('mediaManager');
                    options.assetManager = self.getAssetManager();

                    picCreator.getWidget().build(
                        infoControl,
                        Renderer.getContainer(infoControl),
                        self.getOption('bodyElementOptionForm'),
                        options
                    );
                } else {
                    //in case the pic has been imported with a runtime only (no creator)
                    //@todo allow deleting it
                }
                resolve();
            }).catch(function (error) {
                reject('Error initializing the creator : ' + error);
            });
        });
    };

    return CreatorPortableInfoControl;
});
