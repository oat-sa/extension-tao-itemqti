
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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * This plugin triggers the resize event on the qti creator context.
 * It allows other creator components to listen to this event rather than binding their events directly on window
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'core/plugin'
], function($, _, pluginFactory){
    'use strict';

    var $window = $(window),
        pluginName = 'windowResizer',
        ns = '.itemcreatorwindowresizer',
        throttleDelayMs = 200;

    /**
     * Returns the configured plugin
     * @returns {Function} the plugin
     */
    return pluginFactory({

        name : pluginName,

        init : function init(){
            var qtiCreatorContext = this.getHost();

            $window.on('resize' + ns, _.throttle(function() {
                qtiCreatorContext.trigger('resize');
            }, throttleDelayMs));
        },

        destroy : function destroy() {
            $window.off('resize' + ns);
        }
    });
});
