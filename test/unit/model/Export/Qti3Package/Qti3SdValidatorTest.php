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

namespace oat\taoQtiItem\test\unit\model\Export\Qti3Package;

use oat\taoQtiItem\model\Export\Qti3Package\Qti3XsdValidator;
use oat\taoQtiItem\model\ValidationService;
use PHPUnit\Framework\TestCase;

class Qti3SdValidatorTest extends TestCase
{
    private Qti3XsdValidator $validator;
    private ValidationService $validationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->validationService = new ValidationService();
        $this->validator = new Qti3XsdValidator($this->validationService);
    }

    /**
     * @dataProvider validQtiElementsProvider
     */
    public function testValidQtiElements(string $elementName): void
    {
        $this->assertTrue(
            $this->validator->isQtiElementName($elementName),
            sprintf("Element '%s' should be recognized as valid QTI element", $elementName)
        );
    }

    public function validQtiElementsProvider(): array
    {
        return [
            'assessment item' => ['qti-assessment-item'],
            'response declaration' => ['qti-response-declaration'],
            'outcome declaration' => ['qti-outcome-declaration'],
            'choice interaction' => ['qti-choice-interaction'],
            'simple choice' => ['qti-simple-choice'],
            'item body' => ['qti-item-body']
        ];
    }

    /**
     * @dataProvider invalidQtiElementsProvider
     */
    public function testInvalidQtiElements(string $elementName): void
    {
        $this->assertFalse(
            $this->validator->isQtiElementName($elementName),
            sprintf("Element '%s' should not be recognized as valid QTI element", $elementName)
        );
    }

    public function invalidQtiElementsProvider(): array
    {
        return [
            'non-qti element' => ['qti-something-invalid'],
            'element without prefix' => ['assessment-item'],
            'random string' => ['random-string']
        ];
    }

    public function testMalformedElementName(): void
    {
        $this->assertFalse($this->validator->isQtiElementName(''));
        $this->assertFalse($this->validator->isQtiElementName('qti-'));
        $this->assertFalse($this->validator->isQtiElementName('-'));
    }
}
