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

    /**
     * Checks if element is broken into lines
     * @param {JQuery} element 
     * @returns {boolean}
     */
    function isTextBroken($element) {
        const rects = $element[0].getClientRects();
        return rects.length > 1;
    }

    /**
     * Calculates positioning for tooltip
     * @param {JQuery} $element 
     * @returns {object}
     */
    function calculatePosition($element) {
      const isRtl = getComputedStyle($element[0]).direction === 'rtl';
      if(isTextBroken($element)) {
        const target = $('<span></span>').css('width', '0');
        $element.after(target);
        return {
          target,
          my: 'top center',
          at: `bottom ${isRtl ? 'left' : 'right'}`,          
        }
      }else{
        return {
          target: $element,
          my: 'top center',
          at: 'bottom center',
        }
      }
    }
  
    return {
        render: function render($container) {
            $container.find('[data-role="tooltip-target"]').each(function(){
                var $target = $(this),
                    $content,
                    contentHtml,
                    contentId = $target.attr('aria-describedBy');

                if (contentId) {
                    $content = $container.find('#' + contentId);
                    if ($content.length) {
                        contentHtml = $content.html();

                        $target.attr('tabindex', 0);
                        $target.on('keydown', (event) => {
                            if (event.key === 'Escape' || event.keyCode === 27) {
                                $target.qtip('hide');
                            }
                        });

                        $target.qtip({
                            overwrite: true,
                            theme: 'default',
                            content: {
                                text: contentHtml
                            },
                            position: calculatePosition($target),
                            show: 'mouseover focus click',
                            hide: 'mouseout blur',
                        });
                    }
                }
            });
        }
    };
});
