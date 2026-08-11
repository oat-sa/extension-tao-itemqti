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
 * Copyright (c) 2014-2024 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Custom',
    'tpl!taoQtiItem/qtiCreator/tpl/notifications/widgetOverlay',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
], function(stateFactory, Custom, overlayTpl, __, answerState){

    var InteractionStateCustom = stateFactory.create(Custom, function(){
        //use default [data-edit="custom"].show();
        this.widget.$container.append(overlayTpl({
            message : __('Custom Response Processing Mode')
        }));
        this.widget.$container.find('[data-edit=map], [data-edit=correct]').hide();
    }, function(){
        answerState.createOutcomeScore(this.widget);

        //use default [data-edit="custom"].hide();
        this.widget.$container.children('.overlay').remove();
    });

    return InteractionStateCustom;
});
