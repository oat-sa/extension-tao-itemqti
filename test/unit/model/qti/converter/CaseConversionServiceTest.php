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

namespace oat\taoQtiItem\test\unit\model\qti\converter;

use oat\taoQtiItem\model\qti\converter\CaseConversionService;
use PHPUnit\Framework\TestCase;

class CaseConversionServiceTest extends TestCase
{
    public static function kebabToCamelCaseProvider()
    {
        return [
            'qti prefix present' => [
                'kebab' => 'qti-assessment-item',
                'camel' => 'assessmentItem'
            ],
            'qti prefix not present' => [
                'kebab' => 'assessment-item',
                'camel' => 'assessmentItem'
            ],
            'not kebab case' => [
                'kebab' => 'assessmentItem',
                'camel' => 'assessmentItem',
            ],
        ];
    }

    public function setUp(): void
    {
        $this->subject = new CaseConversionService();
    }

    /**
     * @dataProvider kebabToCamelCaseProvider
     */
    public function testKebabToCamelCase(string $kebab, string $camel)
    {
        $this->assertEquals($camel, $this->subject->kebabToCamelCase($kebab));
    }
}
