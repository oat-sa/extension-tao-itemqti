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
 * Copyright (c) 2014-2017 (original work) Open Assessment Technologies SA;
 */
define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'taoQtiItem/qtiCreator/widgets/static/modalFeedback/states/states',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/okButton'
], function($, Widget, states, okButtonTpl){
    'use strict';

    var ModalFeedbackWidget = Widget.clone();

    ModalFeedbackWidget.initCreator = function(){

        Widget.initCreator.call(this);

        this.registerStates(states);

        this.createOkButton();
    };

    ModalFeedbackWidget.buildContainer = function(){

        this.$container = this.$original.addClass('widget-box');
    };

    ModalFeedbackWidget.createToolbar = function(){
        //no toolbar required for now
        //createToolbar() is a required method so we leave it empty for now
        return this;
    };

    ModalFeedbackWidget.createOkButton = function(){

        var _this = this;

        this.$container
            .append($(okButtonTpl())
            .on('click.qti-widget', function(e){
                e.stopPropagation();
                _this.changeState('sleep');
            }));
    };

    return ModalFeedbackWidget;
});
