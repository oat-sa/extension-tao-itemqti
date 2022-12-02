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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA ;
 */
define([], function () {
    'use strict';

    /**
     * Tells if a module name refers to a PCI runtime.
     * @param moduleName
     * @returns {boolean}
     */
    const isPciRuntime = moduleName => moduleName.indexOf('/runtime/') > 0;

    /**
     * Generates the module declaration for a Handlebars template.
     * @param {string} moduleName - The name of the template's module.
     * @param {string} compiled - The compiled template.
     * @returns {string} - Returns the module declaration for a Handlebars template.
     */
    return function moduleWriter(moduleName, compiled) {
        let handlebars = 'handlebars';
        if (isPciRuntime(moduleName)) {
            handlebars = 'taoQtiItem/portableLib/handlebars';
        }
        return `define('tpl!${moduleName}', ['${handlebars}'], function(hb){ return hb.template(${compiled}); });`;
    };
});
