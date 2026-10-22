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
 * Copyright (c) 2014-2019 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */
import _ from 'lodash';
import tpl from 'taoQtiItem/qtiCommonRenderer/tpl/modalFeedback';
import containerHelper from 'taoQtiItem/qtiCommonRenderer/helpers/container';
import coreContainerHelper from 'taoQtiItem/qtiItem/helper/container';
import 'ui/waitForMedia';
import 'ui/modal';

var modalFeedbackRenderer = {
    qtiClass: 'modalFeedback',
    template: tpl,
    getContainer: containerHelper.get,
    width: 600,
    getData: function(fb, data) {
        data.feedbackStyle = coreContainerHelper.getEncodedData(fb, 'modalFeedback');
        return data;
    },
    render: function(modalFeedback, data) {
        var $modal = containerHelper.get(modalFeedback);

        $modal.waitForMedia(function() {
            //when we are sure that media is loaded:
            $modal
                .on('opened.modal', function() {
                    //set item body height
                    var $itemBody = containerHelper.get(modalFeedback.getRootElement()).children('.qti-itemBody');
                    var requiredHeight = $modal.outerHeight() + parseInt($modal.css('top'));
                    if (requiredHeight > $itemBody.height()) {
                        $itemBody.height(requiredHeight);
                    }
                })
                .on('closed.modal', function() {
                    data = data || {};

                    if (_.isFunction(data.callback)) {
                        data.callback.call(this);
                    }
                })
                .modal({
                    startClosed: false,
                    minHeight: modalFeedbackRenderer.minHeight,
                    width: modalFeedbackRenderer.width
                });
        });
    }
};

export default modalFeedbackRenderer;
