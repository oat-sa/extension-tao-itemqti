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
    'handlebars',
    'tpl!taoQtiItem/qtiXmlRenderer/tpl/interactions/portableCustomInteraction/properties'
], function(Handlebars, propertiesTpl){
    'use strict';

    function renderPortableElementProperties(properties, ns, name){
        var entries = [];

        for (let key in properties) {
            if (properties.hasOwnProperty(key)) {
                if (typeof properties[key] === 'object' && properties[key] !== null) {
                    entries.push({
                        value: renderPortableElementProperties(properties[key], ns, key)
                    });
                } else {
                    entries.push({
                        key: key,
                        value: properties[key]
                    });
                }
            }
        }

        return propertiesTpl({
            entries : entries,
            ns : ns,
            key : name
        });
    }

    function renderImsPortableElementProperties(properties, ns, name){
        var entries = [];

        for (let key in properties) {
            if (properties.hasOwnProperty(key)) {
                let value = properties[key];
                entries.push({
                    key: key,
                    value: (typeof value === 'object' && value !== null) ? JSON.stringify(value) : value
                });
            }
        }

        return propertiesTpl({
            entries : entries,
            ns : ns,
            key : name
        });
    }

    //register the pci properties helper:
    Handlebars.registerHelper('portableElementProperties', function(properties, ns){
        return renderPortableElementProperties(properties, ns, '');
    });
    Handlebars.registerHelper('imsPortableElementProperties', function(properties, ns){
        return renderImsPortableElementProperties(properties, ns, '');
    });

});

