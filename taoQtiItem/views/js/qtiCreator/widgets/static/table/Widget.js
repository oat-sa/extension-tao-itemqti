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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'taoQtiItem/qtiCreator/widgets/static/table/states/states',
    'taoQtiItem/qtiCreator/widgets/static/helpers/widget',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/table'
], function($, Widget, states, helper, toolbarTpl) {
    'use strict';

    var TableWidget = Widget.clone();

    TableWidget.initCreator = function() {

        this.registerStates(states);

        Widget.initCreator.call(this);
    };

    TableWidget.buildContainer = function(){
        var table = this.element;

        helper.buildBlockContainer(this);

        if (table.attr('class')) {
            this.$container.addClass(table.attr('class'));
        }

        return this;
    };

    TableWidget.createToolbar = function(){

        var self = this,
            $tlb = $(toolbarTpl({
                serial : this.serial,
                state : 'active'
            }));

        this.$container.append($tlb);

        $tlb.find('[data-role="delete"]').on('click.widget-box', function(e){
            e.stopPropagation();//to prevent direct deleting;
            self.changeState('deleting');
        });

        return this;
    };

    return TableWidget;
});
