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
define([
    'jquery',
    'lodash'
], function($, _){
    'use strict';

    var itemStylesheetHandler = (function(){

        var informLoaded = _.throttle(function(){
            $(document).trigger('customcssloaded.styleeditor');
        }, 10, {leading : false});

        var attach = function(stylesheets) {
            var $head = $('head'), link;

             $('body').addClass('tao-scope');

             // relative links with cache buster
            _(stylesheets).forEach(function(stylesheet){

                var $link = $(stylesheet.render());
                var href = $link.attr('href');
                var sep  = href.indexOf('?') > -1 ? '&' : '?';



                if(href.indexOf('/') === 0) {
                    href = href.slice(1);
                }

                href +=  sep + (new Date().getTime()).toString();

                //we need to set the href after the link is appended to the head (for our dear IE)
                $link.removeAttr('href')
                     .appendTo($head)
                     .attr('href', href);

                //wait for the styles to applies
                _.delay(informLoaded, 10);
            });
        };

        return {
            attach: attach
        };

    }());

    return itemStylesheetHandler;
});
