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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\metadata\importer;

use Exception;

class PropertyDoesNotExistException extends Exception
{
    public function __construct(array $message)
    {
        if (isset($message['checksum_result']) && $message['checksum_result'] === false) {
            parent::__construct(
                sprintf(
                    'The property %s selected list is not defined as expected by the imported package',
                    $message['label'] ?? 'unknown label',
                )
            );
            return;
        }

        if (isset($message['widget_result']) && $message['widget_result'] === false) {
            parent::__construct(
                sprintf(
                    'The property %s selected widget is not defined as expected by the imported package',
                    $message['label'] ?? 'unknown label',
                )
            );
            return;
        }

        parent::__construct(
            sprintf(
                'Property with label %s and alias %s does not exist.',
                $message['label'] ?? 'unknown label',
                $message['alias'] ?? 'unknown alias'
            )
        );
    }
}
