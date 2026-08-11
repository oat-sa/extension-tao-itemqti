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
 * Copyright (c) 2014-2017 Open Assessment Technologies SA;
 */
define([
    'lodash',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/interactions/portableCustomInteraction/main',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/interactions/portableCustomInteraction/oat',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/interactions/portableCustomInteraction/ims'
], function(_, tpl, oatTpl, imsTpl){
    'use strict';

    var templates = {
        'http://www.imsglobal.org/xsd/portableCustomInteraction' : oatTpl,
        'http://www.imsglobal.org/xsd/portableCustomInteraction_v1' : imsTpl
    };

    return {
        qtiClass : 'customInteraction',
        template : tpl,
        getData : function getData(interaction, data){
            var ns = interaction.getNamespace();
            data.markup = interaction.markup;
            data.portableCustomInteraction = _.isFunction(templates[ns.uri]) ? templates[ns.uri].call(null, data) : '';
            return data;
        }
    };
});