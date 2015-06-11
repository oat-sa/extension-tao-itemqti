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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */


/**
 * Portable element helper
 */
define(['jquery'], function($){
    'use strict';

    /**
     * Replace all identified relative media urls by the absolute one
     *
     * @param {String} markupStr
     * @param {Object} the renderer
     * @returns {String}
     */
    function fixMarkupMediaSources(markupStr, renderer){

        //load markup string into a div container
        var $markup = $('<div>', {'class' : 'wrapper'}).html(markupStr);

        //for each media source
        $markup.find('img').each(function(){

            var $img = $(this),
                src = $img.attr('src'),
                fullPath = renderer.resolveUrl(src);

            $img.attr('src', fullPath);
        });

        return $markup.html();

    }

    return {
        fixMarkupMediaSources : fixMarkupMediaSources,
    };
});
