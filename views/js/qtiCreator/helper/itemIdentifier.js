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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA ;
 */

define([], function() {
    const itemIdentifier = {
      uniqueNumericIdentifier() {
        const dateString = Math.floor(Date.now() / 100000)
          .toString()
          .slice(0, 7);
        const randString = (Math.floor(Math.random() * 90) + 10)
          .toString()
          .slice(0, 2);
        return dateString + randString;
      },
      defaultIdentifier(uri, qtiIdentifier) {
        if (!uri || !qtiIdentifier) {
          throw new Error("Missing uri or qtiIdentifier");
        }
        const pos = uri.lastIndexOf("#");
        // identifier by default should be no more then 32
        return uri.substring(pos + 1, pos + 1 + qtiIdentifier.maxQtiIdLength);
      },
    };

    return itemIdentifier;
});
