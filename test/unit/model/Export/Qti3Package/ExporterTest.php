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

use core_kernel_classes_Resource;
use DOMDocument;
use PHPUnit\Framework\TestCase;
use oat\taoQtiItem\model\Export\Qti3Package\Exporter;
use ZipArchive;

class ExporterTest extends TestCase
{
    private Exporter $exporter;
    private core_kernel_classes_Resource $itemMock;
    private ZipArchive $zipMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->itemMock = $this->createMock(core_kernel_classes_Resource::class);
        $this->zipMock = $this->createMock(ZipArchive::class);

        $this->exporter = new Exporter($this->itemMock, $this->zipMock);
    }

    public function testGetQTIVersion(): void
    {
        $this->assertEquals('3p0', $this->exporter->getQTIVersion());
    }

    public function testItemContentPostProcessing(): void
    {
        $input = '<?xml version="1.0" encoding="UTF-8"?>
            <assessmentItem identifier="Q01">
                <responseDeclaration identifier="RESPONSE" baseType="string"/>
                <itemBody>
                    <choiceInteraction responseIdentifier="RESPONSE" maxChoices="1">
                        <simpleChoice identifier="A">Choice A</simpleChoice>
                    </choiceInteraction>
                </itemBody>
            </assessmentItem>';

        $expectedNamespace = 'http://www.imsglobal.org/xsd/imsqtiasi_v3p0';

        // Use reflection to access protected method
        $method = new \ReflectionMethod(Exporter::class, 'itemContentPostProcessing');
        $method->setAccessible(true);

        $result = $method->invoke($this->exporter, $input);

        // Create a new DOMDocument to parse and verify the result
        $resultDoc = new DOMDocument();
        $resultDoc->loadXML($result);

        // Verify the root element and its attributes
        $rootElement = $resultDoc->documentElement;
        $this->assertEquals('qti-assessment-item', $rootElement->nodeName);
        $this->assertEquals($expectedNamespace, $rootElement->getAttribute('xmlns'));

        // Verify transformed elements
        $this->assertNotEmpty($rootElement->getElementsByTagName('qti-response-declaration'));
        $this->assertNotEmpty($rootElement->getElementsByTagName('qti-item-body'));
        $this->assertNotEmpty($rootElement->getElementsByTagName('qti-choice-interaction'));
        $this->assertNotEmpty($rootElement->getElementsByTagName('qti-simple-choice'));
    }
}
