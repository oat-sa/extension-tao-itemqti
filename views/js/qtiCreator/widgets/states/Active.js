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
 * Copyright (c) 2014-2017 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/helpers/content'
], function($, stateFactory, contentHelper){
    'use strict';

    return stateFactory.create('active', function(){

        var _widget     = this.widget,
            container   = _widget.$container[0],
            item        = _widget.element.getRootElement(),
            areaBroker  = _widget.getAreaBroker(),
            $modalFeedbacksArea = $('#modalFeedbacks');

        //move to sleep state by clicking anywhere outside the interaction
        areaBroker.getContentCreatorPanelArea().on('mousedown.active.' + _widget.serial, function(e){
            if (
                container !== e.target
                && !$.contains(container, e.target)
                && (!areaBroker || !areaBroker.getEditorBarArea || !$.contains(areaBroker.getEditorBarArea().get(0), e.target))
                && (!$modalFeedbacksArea.length || !$.contains($modalFeedbacksArea[0], e.target)) //if click triggered inside the #modalFeedback then state must not be changed.
                && ($(e.target).data('role') !== 'restore')
                && !($(e.target).closest('.widget-popup').length)
            ){
                _widget.changeState('sleep');
            }
        }).on('beforesave.qti-creator.active', function(){
            _widget.changeState('sleep');
        }).on('styleedit.active', function(){
            _widget.changeState('sleep');
        });

        $(document).on('open-preview.qti-item', function(){
            _widget.changeState('sleep');
        });

        if(item && item.data('widget')){
            //in item editing context:
            item.data('widget').$container.on('resizestart.gridEdit.active beforedragoverstart.gridEdit.active', function(){
                _widget.changeState('sleep');
            });
        }

    }, function(){
        var item,
            areaBroker = this.widget.getAreaBroker();

        contentHelper.changeInnerWidgetState(this.widget, 'sleep');

        this.widget.$container.off('.active');
        areaBroker.getContentCreatorPanelArea().off('.active.'+ this.widget.serial);

        var item = this.widget.element.getRootElement();
        if(item && item.data('widget')){
            item.data('widget').$container.off('.active');
        }

    });
});
