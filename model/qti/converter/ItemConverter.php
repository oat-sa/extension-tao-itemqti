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

class ItemConverter extends AbstractQtiConverter
{
    private const CUSTOM_ELEMENT_MAPPING = [
        [
            'tag' => 'img',
            'parent' => 'graphicOrderInteraction',
            'replace' => 'object',
        ],
        [
            'tag' => 'img',
            'parent' => 'graphicAssociateInteraction',
            'replace' => 'object',
        ],
        [
            'tag' => 'img',
            'parent' => 'graphicGapMatchInteraction',
            'replace' => 'object',
        ],
        [
            'tag' => 'img',
            'parent' => 'gapMatchInteraction',
            'replace' => 'object',
        ],
    ];
    private const ROOT_ELEMENT = 'qti-assessment-item';
    protected function getRootElement(): string
    {
        return self::ROOT_ELEMENT;
    }


    protected function customElementMapping(string $convertedTag, string $parentTag): ?string
    {
        $match = array_filter(self::CUSTOM_ELEMENT_MAPPING, function ($element) use ($convertedTag, $parentTag) {
            return $element['tag'] === $convertedTag && $element['parent'] === $parentTag;
        });

        $result = reset($match);

        return !empty($result) ? $result['replace'] : null;
    }
}
