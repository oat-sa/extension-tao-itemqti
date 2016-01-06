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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA
 **/
define(['lodash', 'jquery'], function (_, $){
    'use strict';

    function checkContainerType(element){
        if(_.isFunction(element.initContainer) && _.isFunction(element.body)){
            return true;
        }else{
            throw 'the element is not of a container type';
        }
    }

    function _getBodyDom(element){
        if(checkContainerType(element)){
            return $('<div>').html(element.body()).find('.x-tao-wrapper');
        }
    }

    function _setBodyDomClass(element, newClass, oldClass){

        if(checkContainerType(element) && (oldClass || newClass)){
            var $wrapper = $('<div>').html(element.body());
            var $bodyDom = $wrapper.find('.x-tao-wrapper');

            if(!$bodyDom.length){
                //create one
                $wrapper.wrapInner('<div class="x-tao-wrapper">');
                $bodyDom = $wrapper.find('.x-tao-wrapper');
            }
            if(oldClass){
                $bodyDom.removeClass(oldClass);
            }
            if(newClass){
                $bodyDom.addClass(newClass);
            }
            //set to the model
            element.body($wrapper.html());
        }

    }

    var _prefix = 'x-tao-';
    
    function getEncodedDataString(dataName, value){
        if(dataName && value){
            return _prefix + dataName + '-' + value;
        }
        return '';
    }
    
    function setEncodedData(element, dataName, newValue){
        var oldValue = getEncodedData(element, dataName);
        return _setBodyDomClass(element, getEncodedDataString(dataName, newValue), getEncodedDataString(dataName, oldValue));
    }
    
    function removeEncodedData(element, dataName){
        var $body = _getBodyDom(element);
        var oldValue = getEncodedData(element, dataName);
        if($body && $body.length && dataName && oldValue){
            return $body.hasClass(getEncodedDataString(dataName, oldValue));
        }
    }

    function hasEncodedData(element, dataName, value){
        var $body = _getBodyDom(element);
        if($body && $body.length && dataName && value){
            return $body.hasClass(getEncodedDataString(dataName, value));
        }
        return false;
    }

    function getEncodedData(element, dataName){
        var regex, matches;
        var $body = _getBodyDom(element);
        if(dataName && $body && $body.length && $body.attr('class')){
            regex = new RegExp(_prefix + dataName + '-([a-zA-Z0-9\-._]*)');
            matches = $body.attr('class').match(regex);
            if(matches){
                return matches[1];
            }
        }
    }

    return {
        setEncodedData : setEncodedData,
        hasEncodedData : hasEncodedData,
        getEncodedData : getEncodedData,
        removeEncodedData : removeEncodedData
    };
});