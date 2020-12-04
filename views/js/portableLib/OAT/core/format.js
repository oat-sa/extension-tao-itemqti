define(['taoQtiItem/portableLib/lodash'], function (_) { 'use strict';

    _ = _ && _.hasOwnProperty('default') ? _['default'] : _;

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
     * Copyright (c) 2013-2019 (original work) Open Assessment Technologies SA ;
     */
    var pattern = /(%[sdj])/g;
    /**
     * Enables you to format strings/message, using the pattern:
     *  - %s : string
     *  - %d : number
     *  - %j : json
     *
     * @example format('Resize %s to %d%', 'width', 100); //returns Resize width to 100%
     * @exports core/format
     * @param {String} message - the message to format
     * @param {...String|Number|Object} [replacements] -  the replacements arguments in the order defined in the message
     * @returns {String} the formatted message
     */

    function format (message) {
      var replacements = Array.prototype.slice.call(arguments, 1);
      return _.reduce(message.match(pattern), function (acc, match, index) {
        var replacement = '';

        if (undefined !== replacements[index]) {
          switch (match) {
            case '%d':
              replacement = Number(replacements[index]);
              break;

            case '%j':
              try {
                replacement = JSON.stringify(replacements[index]).replace(/"/g, '');
              } catch (e) {}

              break;

            default:
              replacement = replacements[index];
              break;
          }

          message = message.replace(match, replacement);
        }

        return message;
      }, message);
    }

    return format;

});
