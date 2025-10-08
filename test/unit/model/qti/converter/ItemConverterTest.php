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

use DOMDocument;
use oat\taoQtiItem\model\qti\converter\CaseConversionService;
use oat\taoQtiItem\model\qti\converter\ItemConverter;
use oat\taoQtiItem\model\ValidationService;
use PHPUnit\Framework\TestCase;

class ItemConverterTest extends TestCase
{
    public function setUp(): void
    {
        $this->caseConversionMock = $this->createMock(CaseConversionService::class);
        $this->validationMock = $this->createMock(ValidationService::class);
        $this->subject = new ItemConverter($this->caseConversionMock, $this->validationMock);
    }

    public function testConvert()
    {
        //Copy file
        $modifiedFile = dirname(__FILE__) . '/../../../samples/model/qti/item/qti3_copy.xml';
        copy(dirname(__FILE__) . '/../../../samples/model/qti/item/qti3.xml', $modifiedFile);
        $this->caseConversionMock
            ->method('kebabToCamelCase')
            ->willReturn('camelCase');

        $this->validationMock
            ->method('getContentValidationSchema')
            ->willReturn([
                '/qti/data/qtiv3p0/imsqti_asiv3p0_v1p0.xsd'
            ]);

        $this->subject->convertToQti2($modifiedFile);

        $this->assertFileExists($modifiedFile);

        //Delete file
        unlink($modifiedFile);
    }

    public function testConvertHandlesPortableCustomInteraction()
    {
        $this->caseConversionMock->method('kebabToCamelCase')
            ->will($this->returnCallback(function ($str) {
                $map = [
                    'qti-assessment-item' => 'assessmentItem',
                    'qti-response-declaration' => 'responseDeclaration',
                    'qti-item-body' => 'itemBody',
                    'portable-custom-interaction' => 'portableCustomInteraction',
                    'response-identifier' => 'responseIdentifier',
                    'time-dependent' => 'timeDependent',
                    'base-type' => 'baseType',
                ];
                return $map[$str] ?? $str;
            }));
        //Copy file
        $modifiedFile = dirname(__FILE__) . '/../../../samples/model/qti/item/qti3_pci_copy.xml';
        copy(dirname(__FILE__) . '/../../../samples/model/qti/item/qti3_pci.xml', $modifiedFile);

        $this->subject->convertToQti2($modifiedFile);
        $this->assertXmlFileEqualsXmlFile(
            dirname(__FILE__) . '/../../../samples/model/qti/item/qti2_pci_expected.xml',
            $modifiedFile
        );

        //Delete file
        unlink($modifiedFile);
    }
}