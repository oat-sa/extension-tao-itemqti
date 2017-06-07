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
 * Copyright (c) 2016 (original work) Open Assessment Technlogies SA
 *
 */
define(['lodash', 'jquery', 'tpl!taoQtiItem/qtiCreator/tpl/notifications/deletingInfoBox'], function(_, $, deletingInfoTpl){
    'use strict';

    var _timeout = 10000;

    var _destroy = function _destroy($messageBox){
        $('body').off('.deleting');
        $messageBox.remove();
    };

    var undo = function undo($messageBox){
        $messageBox.trigger('undo.deleting');
        _destroy($messageBox);
    };

    var _bindEvents = function _bindEvents($messageBox){

        $('body').on('mousedown.deleting keydown.deleting', function(e){

            if(e.ctrlKey || e.metaKey){
                //trigger undo callback if the standard keyboard shortcut ctrl+z is triggered
                if(e.keyCode == 90){//z-key
                    undo($messageBox);
                }
                e.preventDefault();
                return;
            }

            //confirm deleting whenever user interact with another object
            if(e.target !== $messageBox[0] && !$.contains($messageBox[0], e.target)){
                _confirmDeletion($messageBox, 400);
            }
        });
        
        $messageBox.find('a.undo').on('click', function(e){
            e.preventDefault();
            undo($messageBox);
        });

        $messageBox.find('.close-trigger').on('click', function(e){
            e.preventDefault();
            _confirmDeletion($messageBox, 0);
        });

        setTimeout(function(){
            _confirmDeletion($messageBox, 1000);
        }, _timeout);
    };

    var _confirmDeletion = function($messageBox, fadeDelay){
        //only allow deletion if the message has not already been deleted yet
        if($messageBox.length && $.contains(document, $messageBox[0])){
            $messageBox.trigger('confirm.deleting');
            $messageBox.fadeOut(fadeDelay, function(){
                _destroy($messageBox);
            });
        }
    };
    
    var deletingHelper = {
        createInfoBox : function(widgets){

            var $messageBox = $(deletingInfoTpl({
                serial : 'widgets',
                count : widgets.length
            }));

            $('body').append($messageBox);

            $messageBox.css({
                'display' : 'block',
                'position' : 'fixed',
                'top' : '50px',
                'left' : '50%',
                'margin-left' : '-200px',
                'width' : '400px',
                zIndex : 999999
            });
            
            _bindEvents($messageBox);
            
            _.each(widgets, function(w){
                w.on('beforeStateInit', function(){
                    _confirmDeletion($messageBox, 400);
                });
            });
        
            return $messageBox;
        }
    };

    return deletingHelper;
});