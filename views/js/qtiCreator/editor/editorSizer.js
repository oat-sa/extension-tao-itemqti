
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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */

/**
 * This module contains the legacy pieces of code that resize the editor.
 * We all agree they're not useful anymore and need to be migrated to a pure CSS solution.
 */
define([
    'jquery',
    'lodash'
], function($, _){
    'use strict';


    /**
     * Update the height of the authoring tool
     */
    var updateHeight = function updateHeight(){
        var $itemEditorPanel = $('#item-editor-panel');
        var $itemSidebars = $('.item-editor-sidebar');
        var $contentPanel = $('#panel-authoring');
        var
            footerTop,
            contentWrapperTop,
            remainingHeight;

        if (!$contentPanel.length || !$itemEditorPanel.length) {
            return;
        }

        footerTop = (function() {
            var $footer = $('body > footer'),
                footerTop;
            $itemSidebars.hide();
            footerTop = $footer.offset().top;
            $itemSidebars.show();
            return footerTop;
        }());
        contentWrapperTop = $contentPanel.offset().top;
        remainingHeight = footerTop - contentWrapperTop - $('.item-editor-action-bar').outerHeight();

        // in the item editor the action bars are constructed slightly differently
        $itemEditorPanel.find('#item-editor-scroll-outer').css({ minHeight: remainingHeight, maxHeight: remainingHeight, height: remainingHeight });
        $itemSidebars.css({ minHeight: remainingHeight, maxHeight: remainingHeight, height: remainingHeight });
    };

    /**
     * Limit the size of the editor panel. This addresses an issue in which a
     * too large image would expand the editor panel to accommodate for the size
     * of the image.
     */
    function limitItemPanelWidth () {
        var itemEditorPanel = document.getElementById('item-editor-panel'),
            width = (function() {
                var _width = $('#panel-authoring').outerWidth();
                $('.item-editor-sidebar').each(function() {
                    _width -= $(this).outerWidth();
                });
                return _width.toString();
            }()),
            prefixes = ['webkit', 'ms', ''];

        _.forEach(prefixes, function(prefix) {
            itemEditorPanel.style[prefix + (prefix ? 'Flex' : 'flex')] = '0 0 ' + width + 'px';
        });
        itemEditorPanel.style.maxWidth = width + 'px';
    }

    /**
     * Set up the editor resizing
     */
    return function editorSizer(){
        $(window)
            .off('resize.qti-editor')
            .on('resize.qti-editor', _.throttle(function() {
                updateHeight();
                limitItemPanelWidth();
            }, 50));
    };
});
