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
 * Copyright (c) 2014-2017 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/states',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Sleep',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Active',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Choice',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Correct',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Map',
    'taoQtiItem/qtiCreator/widgets/interactions/states/NoRp',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Custom'
], function(factory, states){
    'use strict';
    return factory.createBundle(states, arguments);
});