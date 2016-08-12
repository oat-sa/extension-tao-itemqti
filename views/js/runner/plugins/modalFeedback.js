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
 * Copyright (c) 2016  (original work) Open Assessment Technologies SA;
 *
 * @author Alexander Zagovorichev <zagovorichev@1pt.com>
 */

define([
    'jquery',
    'i18n',
    'taoTests/runner/plugin',
    'module',
    'taoQtiItem/runner/plugins/modalFeedback/modalInlineFeedback',
    'taoQtiItem/runner/plugins/modalFeedback/modalDialogFeedback'
], function($, __, pluginFactory, module, inlineFeedback, dialogFeedback) {
    'use strict';

    // Form of the feedback
    var modalFeedback = dialogFeedback;

    /**
     * Returns the configured plugin
     */
    return pluginFactory({
        name: 'modalFeedback',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var inline = !!module.config().inlineModalFeedback;
            modalFeedback = inline ? inlineFeedback : dialogFeedback;
        },

        /**
         * Called during the runner's render phase
         */
        render : function render(){

            // todo render feedback form to container
            var $container = this.getAreaBroker().getNavigationArea();
            $container.append(this.$element);
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy : function destroy (){
            modalFeedback.destroy();
        },

        /**
         * Show the button
         */
        show: function show(){
            modalFeedback.show();
        },

        /**
         * Hide the button
         */
        hide: function hide(){
            modalFeedback.hide();
        }
    });

});
