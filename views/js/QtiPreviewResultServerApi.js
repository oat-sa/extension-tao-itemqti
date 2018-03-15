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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA
 *
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCommonRenderer/helpers/PciResponse',
    'util/strPad'],
    function($, _, pciResponse, strPad){
    'use strict';

    function QtiPreviewResultServerApi(endpoint, itemUri){
        this.endpoint = endpoint;
        this.itemUri = itemUri;

        //private variable
        var qtiRunner = null;
        this.setQtiRunner = function(runner){
            qtiRunner = runner;
        };
        this.getQtiRunner = function(){
            return qtiRunner;
        };
    }

    QtiPreviewResultServerApi.prototype.submitItemVariables = function(itemId, serviceCallId, responses, scores, events, params, callback){
        var _this = this;
        // Log in preview console
        var previewConsole = $('#preview-console');
        var variableIdentifier;

        for (variableIdentifier in responses) {
            previewConsole.trigger('updateConsole', [
                'Submitted data', strPad(variableIdentifier + ': ', 15, ' ') + _.escape(pciResponse.prettyPrint(responses[variableIdentifier]))
            ]);
        }

        $.ajax({
            url : this.endpoint + 'submitResponses'
                + '?itemId=' + encodeURIComponent(itemId)
                + '&itemUri=' + encodeURIComponent(this.itemUri)
                + '&serviceCallId=' + encodeURIComponent(serviceCallId),
            data : JSON.stringify(responses),
            contentType: 'application/json',
            type : 'post',
            dataType : 'json',
            success : function(r){
                if(r.success){
                    var fbCount = 0;
                    var runner = _this.getQtiRunner();
                    if(r.itemSession){

                        fbCount = runner.showFeedbacks(r.itemSession, callback);

                        for (var variableIdentifier in r.itemSession) {
                            previewConsole.trigger('updateConsole', [
                                'Output data', strPad(variableIdentifier + ': ', 15, ' ') + pciResponse.prettyPrint(r.itemSession[variableIdentifier])
                            ]);
                        }
                    }
                    if(!fbCount){
                        callback();
                    }
                }
            }
        });
    };

    return QtiPreviewResultServerApi;
});
