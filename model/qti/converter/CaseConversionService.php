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

namespace oat\taoQtiItem\model\qti\converter;

class CaseConversionService
{
    public function kebabToCamelCase(string $kebab): string
    {
        // Remove qti prefix if it exists
        if (strpos($kebab, 'qti-') === 0) {
            $kebab = substr($kebab, 4);
        }

        return preg_replace_callback('/-(.?)/', function ($matches) {
            return strtoupper($matches[1]);
        }, $kebab);
    }
}
