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
    'taoQtiItem/qtiCreator/widgets/static/tooltip/components/tooltipEditor'
], function(_, $, __, ckEditor, stateFactory, Active, htmlEditor, contentHelper, tooltipEditorFactory){
    'use strict';

    var tooltipEditor;

    var TooltipStateActive = stateFactory.extend(Active, function create(){
        this.buildEditor();

    }, function exit(){
        this.destroyEditor();
    });

    TooltipStateActive.prototype.buildEditor = function buildEditor(){
        var _widget = this.widget,
            $itemPanel = _widget.getAreaBroker().getItemPanelArea(),
            $tooltipContainer = _widget.$container,
            tooltip = _widget.element;

        tooltipEditor = tooltipEditorFactory({
            target: tooltip.body(),
            content: tooltip.content()
        })
            // .setSize(300, 'auto')
            .render($itemPanel)
            .show()
            .alignWith($tooltipContainer, {
                hPos: 'center',
                vPos: 'center',
                vOrigin: 'top'
            });

    };

    TooltipStateActive.prototype.destroyEditor = function destroyEditor(){
        if (tooltipEditor) {
            tooltipEditor.destroy();
            tooltipEditor = null;
        }
    };

    return TooltipStateActive;
});