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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */

/**
 * The NoRp state stands for "no response processing" state.
 * It is a sub-state of the state answer.
 * It defines the state of an interaction when it is in the response editing mode with response processing disabled
 */
define(['taoQtiItem/qtiCreator/widgets/states/factory'], function(stateFactory){
    'use strict';
    return stateFactory.create('norp', ['answer', 'active'], function(){
        throw new Error('state "norp" prototype init method must be implemented');
    },function(){
        throw new Error('state "norp" prototype exit method must be implemented');
    });
});