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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'lodash'
], function($, _) {
    'use strict';

    return function(options) {
        // var $container = options.$container;
        //
        // function isWrappable() {
        //
        // }
        var selection = window.getSelection();

        //fixme: I don't work over multiple lines
        function containQtiElement(range){
            var selectedChildNodes,
                i;
            if(range.commonAncestorContainer.nodeType === 1){
                selectedChildNodes = range.cloneContents().childNodes;
                for (i = 0; i < selectedChildNodes.length; i++){
                    if(selectedChildNodes[i].className &&
                        selectedChildNodes[i].className.indexOf("qti-choice") > -1){
                        return true;
                    }
                }
            }
            return false;
        }

        return {
            canWrap: function canWrap() {
                var range = selection.getRangeAt(0);
                return !selection.isCollapsed
                    && range.toString().trim() !== ''
                    && !containQtiElement(range);
            },

            /**
             * warning: will lose any event handlers attached to the wrapped nodes !
             * @returns {boolean}
             */
            wrapWith: function wrapWith($wrapper) {
                var sel = getSelection(),
                    range = sel.getRangeAt(0);

                if (this.canWrap()) {
                    try {
                        range.surroundContents($wrapper[0]);
                        return $wrapper;
                    } catch (err) {
                        // this happens when partial wrapping is attempted, which would result in an invalid markup
                        // we silently fail and simply return false
                    }
                }
                return false;

            }
        };
    };
});
