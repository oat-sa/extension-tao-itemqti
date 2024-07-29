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
     * Checks if the text in the element is broken into multiple lines using lineHeight measurement element.
     *
     * @param {JQuery} $element - The jQuery-wrapped element to check.
     * @returns {boolean} - True if the text is broken into multiple lines, otherwise false.
     */
    function isTextBroken($element) {
        const $lineMeasureSpan = $('<span></span>').css('width', '0');
        $element.before($lineMeasureSpan);
        const lineHeight = $lineMeasureSpan[0].getBoundingClientRect().height;
        const lineBroken = $element[0].getBoundingClientRect().height > lineHeight;
        $lineMeasureSpan.remove();
        return lineBroken;

    }

    /**
     * Calculates positioning for tooltip
     * @param {JQuery} $element 
     * @returns {object}
     */
    function calculatePosition($element) {
      const isRtl = getComputedStyle($element[0]).direction === 'rtl';
      const shiftDownPx = 4;
      let position;
      
      if(isTextBroken($element)) {
        const target = $('<span></span>').css('width', '0');
        $element.after(target);
        position = {
          target,
          my: `top ${isRtl ? 'left' : 'right'}`,
          at: `bottom ${isRtl ? 'left' : 'right'}`,
        }
      }else{
        position = {
          target: $element,
          my: 'top center',
          at: 'bottom center',
        }
      }

      position.adjust = {
        y: shiftDownPx
      }

      return position;
    }
  
    return {
        render: function render($container) {
            $container.find('[data-role="tooltip-target"]').each(function(){

                const $target = $(this);
                const tooltipScaleFactor = 0.75;
                const contentId = $target.attr('aria-describedBy');
                
                
                let $content;
                let contentHtml;

                if (contentId) {
                    $content = $container.find('#' + contentId);
                    $content.attr('role', 'tooltip');
                    if ($content.length) {
                        contentHtml = $content.html();

                        $target.attr('tabindex', 0);
                        $target.on('keydown', (event) => {
                            if (event.key === 'Escape' || event.keyCode === 27) {
                                $target.qtip('hide');
                            }
                        });

                        $target.on('click', (event) => {
                            $target.qtip('toggle');
                        });

                        $target.qtip({
                            overwrite: true,
                            theme: 'default',
                            content: {
                                text: contentHtml
                            },
                            position: calculatePosition($target),
                            show: 'mouseover focus',
                            hide: 'mouseout blur',
                            events: {
                                render: function(event, api) {
                                    const $tooltip = api.elements.tooltip;
                                    $tooltip.bind('tooltipshow', function(event, api) {
                                        const targetFontSizePx = parseInt(api.elements.target.css('font-size'), 10);
                                        $tooltip.css('font-size', targetFontSizePx * tooltipScaleFactor);
                                    })
                                }
                            }
                        });
                    }
                }
            });
        }
    };
});
