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
 * Copyright (c) 2016-2023 (original work) Open Assessment Technologies SA
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiCreator/widgets/interactions/mediaInteraction/states/states',
    'taoQtiItem/qtiCommonRenderer/renderers/interactions/MediaInteraction'
], function($, _, Widget, states, commonRenderer){

    var MediaInteractionWidget = _.extend(Widget.clone(), {

        initCreator : function(){
            var self        = this;
            var $container  = this.$original;
            var $item       = $container.parents('.qti-item');

            this.registerStates(states);
            Widget.initCreator.call(this);

            $item
              .off('.' + this.element.serial)
              .on('resize.'+ this.element.serial, _.throttle(function(e){
                    var width = $container.innerWidth();
                    if(width > 0){
                        self.element.object.attr('width', $container.innerWidth());
                        self.destroyInteraction();
                        self.renderInteraction();
                    }
            }, 100));
        },

        destroy : function(){

            var $container = this.$original;
            var $item      = $container.parents('.qti-item');

            //stop listening the resize
            $item.off('resize.' + this.element.serial);

            //call parent destroy
            Widget.destroy.call(this);
        },

        renderInteraction : function(){
            var $container  = this.$original;
            var interaction = this.element;
            //disabled autoplay in authoring
            var autostart = interaction.attributes.autostart;
            interaction.attributes.autostart = false;
            commonRenderer.render.call(interaction.getRenderer(), interaction, {
                features : 'full',
                controlPlaying : false
            });
            //returns the previous autostart value
            interaction.attributes.autostart = autostart;

            //reflect hidePlayer attr visually
            if (interaction.hasClass('hide-player')) {
                $container.toggleClass('dimmed', true);
            } else {
                $container.toggleClass('dimmed', false);
            }
        },

        destroyInteraction : function(){
            var interaction = this.element;
            commonRenderer.resetResponse.call(interaction.getRenderer(), interaction);
            commonRenderer.destroy.call(interaction.getRenderer(), interaction);
        }
    });

    return MediaInteractionWidget;
});
