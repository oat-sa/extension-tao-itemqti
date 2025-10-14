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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2024-2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\converter;

use oat\taoQtiItem\model\ValidationService;

class ItemConverter extends AbstractQtiConverter
{
    private const ROOT_ELEMENT = 'qti-assessment-item';

    /**
     * Default attribute preservation rules for QTI3 to QTI2 conversion
     * These attributes will NOT be converted from kebab-case to camelCase
     */
    public const DEFAULT_ATTRIBUTE_PRESERVATION_RULES = [
        'qti-text-entry-interaction' => [
            'data-patternmask-message',
        ],
    ];

    public function __construct(
        CaseConversionService $caseConversionService,
        ValidationService $validationService,
        array $attributePreservationRules = self::DEFAULT_ATTRIBUTE_PRESERVATION_RULES
    ) {
        parent::__construct($caseConversionService, $validationService, $attributePreservationRules);
    }

    protected function getRootElement(): string
    {
        return self::ROOT_ELEMENT;
    }
}
