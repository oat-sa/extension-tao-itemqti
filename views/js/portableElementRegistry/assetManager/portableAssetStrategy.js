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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */

define([
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/portableElementRegistry/icRegistry'
], function (ciRegistry, icRegistry) {
    'use strict';

    function getBaseUrlByIdentifier(typeIdentifier) {
        if (ciRegistry.get(typeIdentifier)) {
            return ciRegistry.getBaseUrl(typeIdentifier);
        }
        if (icRegistry.get(typeIdentifier)) {
            return icRegistry.getBaseUrl(typeIdentifier);
        }
        return typeIdentifier;
    }

    //strategy to resolve portable info control and portable interactions paths.
    //It should never be reached in the stack the usual way and should be called only using resolveBy.
    return {
        name: 'portableElementLocation',
        handle: function handlePortableElementLocation(url) {

            if (url.file === url.path) {
                return getBaseUrlByIdentifier(url.file);
            } else if (url.source === url.relative) {
                return url.relative.replace(/^(\.\/)?([a-z_0-9]+)\/(.*)/i, function (fullmatch, $1, typeIdentifier, relPath) {
                    var runtimeLocation = getBaseUrlByIdentifier(typeIdentifier);
                    if (runtimeLocation) {
                        return runtimeLocation + '/' + relPath;
                    }
                    return fullmatch;
                });
            }
        }
    };
});