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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */
define(['jquery'], function($) {

    var formElementHelper = {
        initShufflePinToggle: function(widget) {

            var $container = widget.$container,
                choice = widget.element,
                interaction = choice.getInteraction(),
                $shuffleToggle = $container.find('[data-role="shuffle-pin"]');

            var toggleVisibility = function(show) {
                if (show === 'true') {
                    $shuffleToggle.show();
                } else {
                    $shuffleToggle.hide();
                }
                $('.qti-item').trigger('toolbarchange', {
                    callee: 'formElementHelper'
                });
            };

            $shuffleToggle.off('mousedown').on('mousedown', function(e) {
                var $icon = $(this).children();
                e.stopPropagation();

                if ($icon.length === 0) {
                    $icon = $(this);
                }
                if ($icon.hasClass('icon-shuffle')) {
                    $icon.removeClass('icon-shuffle').addClass('icon-pin');
                    choice.attr('fixed', true);
                } else {
                    $icon.removeClass('icon-pin').addClass('icon-shuffle');
                    choice.attr('fixed', false);
                }
            });

            toggleVisibility(interaction.attr('shuffle'));

            //listen to interaction property change
            widget.on('attributeChange', function(data) {
                if (data.element.serial === interaction.serial && data.key === 'shuffle') {
                    toggleVisibility(data.value);
                }
            });
        },
        initDelete: function(widget) {

            var $container = widget.$container;

            $container.find('[data-role="delete"]').on('mousedown', function(e) {
                e.stopPropagation();
                widget.changeState('deleting');
            });
        }
    };

    return formElementHelper;
});
