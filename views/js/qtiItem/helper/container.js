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
define(['lodash', 'jquery'], function(_, $){
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
            return $('<div>').html(element.body()).find('.tao-wrapper');
        }
    }

    function _setBodyDomClass(element, newClass, oldClass){
        
        if(checkContainerType(element) && (oldClass || newClass) ){
            
            var $wrapper = $('<div>').html(element.body());
            var $fbBodyDom = $wrapper.find('.tao-wrapper');
            
            if(!$fbBodyDom.length){
                //create one
                $wrapper.wrapInner('<div class="tao-wrapper">');
                $fbBodyDom = $wrapper.find('.tao-wrapper');
            }
            if(oldClass){
                $fbBodyDom.removeClass(oldClass);
            }
            if(newClass){
                $fbBodyDom.addClass(newClass);
            }
            //set to the model
            element.body($wrapper.html());
        }

    }
    
    return {
        getBodyDom : _getBodyDom,
        setBodyDomClass : _setBodyDomClass,
    }
    
});