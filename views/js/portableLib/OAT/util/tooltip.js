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
 * Copyright (c) 2017-2019 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'taoQtiItem/portableLib/jquery_2_1_1',
    'taoQtiItem/portableLib/jquery.qtip'
], function($) {
    'use strict';

    return {
        render: function render($container) {
            $container.find('[data-role="tooltip-target"]').each(function(){
                var $target = $(this),
                    $content,
                    contentHtml,
                    contentId = $target.attr('aria-describedBy'),
                    qtipPositionTarget = 'event';

                if (contentId) {
                    $content = $container.find('#' + contentId);
                    if ($content.length) {
                        var targetHeight = parseInt($target.css('height'), 10),
                            targetFontSize = parseInt($target.css('fontSize'), 10);

                        /**
                         * Tooltip may be attached to a phrase which is spread into 2 or more lines. For this case we apply
                         * position target as a `mouse`. It gives the behavior of following tooltip by the cursor pointer.
                         * It prevents appearing the tooltip somewhere in the middle of the text between 2 parts of a phrase to
                         * which it was attached.
                         */
                        if ((targetHeight / targetFontSize) >= 2) {
                            qtipPositionTarget = 'mouse';
                        }

                        contentHtml = $content.html();

                        $target.qtip({
                            overwrite: true,
                            theme: 'default',
                            content: {
                                text: contentHtml
                            },
                            position: {
                                target: qtipPositionTarget,
                                my: 'bottom center',
                                at: 'top center'
                            }
                        });
                    }
                }
            });
        }
    };
});
