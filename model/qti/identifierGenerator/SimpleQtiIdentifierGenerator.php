<?php

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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\identifierGenerator;

use InvalidArgumentException;

class SimpleQtiIdentifierGenerator implements IdentifierGenerator
{
    public function generate(array $options = []): string
    {
        $resourceId = $options[self::OPTION_RESOURCE_ID] ?? null;

        if (!is_string($resourceId)) {
            throw new InvalidArgumentException(
                'QTI Identifier generation failure: resource ID is required and must be a string'
            );
        }

        $prefix = LOCAL_NAMESPACE . '#';
        $resourceId = $options['resourceId'];

        // If we have an item from the current environment
        if (strncmp($resourceId, $prefix, strlen($prefix)) === 0) {
            return str_replace($prefix, '', $resourceId);
        }

        // If we have an item from the another environment with ids in the expected format: {namespace}#{id}
        // Else - return not changed identifier
        return explode('#', $resourceId)[1] ?? $resourceId;
    }
}
