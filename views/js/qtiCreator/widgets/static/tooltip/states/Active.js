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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 *
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'jquery',
    'i18n',
    'ckeditor',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/static/helpers/inline',
    'taoQtiItem/qtiCreator/widgets/static/tooltip/components/tooltipEditor'
], function(_, $, __, ckEditor, stateFactory, Active, htmlEditor, contentHelper, inlineHelper, tooltipEditorFactory){
    'use strict';

    var tooltipEditor;

    var TooltipStateActive = stateFactory.extend(Active, function create(){
        this.buildEditor();

    }, function exit(){
        this.destroyEditor();
    });

    TooltipStateActive.prototype.buildEditor = function buildEditor(){
        var self = this,
            _widget = this.widget,
            itemCreator = _widget.getItemCreator(),
            $itemPanel = _widget.getAreaBroker().getItemPanelArea(),
            $tooltipContainer = _widget.$container,
            tooltip = _widget.element;

        tooltipEditor = tooltipEditorFactory({
            tooltip: tooltip,
            windowTitle: __('Tooltip editor'),
            hasCloser: false
        })
            .render($itemPanel)
            .show();

        this.alignEditorOn($tooltipContainer);

        itemCreator.on('resize.tooltipEditor', function() {
            self.alignEditorOn($tooltipContainer);
        });
    };

    TooltipStateActive.prototype.alignEditorOn = function alignEditorOn($tooltipContainer) {
        if (tooltipEditor) {
            tooltipEditor.alignWith($tooltipContainer, {
                hPos: 'center',
                vPos: 'top',
                vOrigin: 'top',

                // the following are arbitrary values
                // that gives visually nice results
                hOffset: -5,
                vOffset: -50
            });
        }
    };

    TooltipStateActive.prototype.destroyEditor = function destroyEditor(){
        var _widget = this.widget,
            itemCreator = _widget.getItemCreator(),
            tooltip = _widget.element,
            $tooltip = _widget.$original;

        $tooltip.html(tooltip.body());

        if (tooltipEditor) {
            tooltipEditor.hide();
            tooltipEditor.destroy();
            tooltipEditor = null;
        }

        itemCreator.off('.tooltipeditor');
    };

    return TooltipStateActive;
});