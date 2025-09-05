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
use DOMElement;
use oat\taoQtiItem\model\Export\Qti3Package\Exporter;
use oat\taoQtiItem\model\Export\Qti3Package\TransformationService;
use PHPUnit\Framework\TestCase;
use ZipArchive;

class ExporterTest extends TestCase
{
    private Exporter|MockObject $exporter;
    private core_kernel_classes_Resource|MockObject $itemMock;
    private ZipArchive|MockObject $zipMock;
    private TransformationService|MockObject $transformationServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->itemMock = $this->createMock(core_kernel_classes_Resource::class);
        $this->zipMock = $this->createMock(ZipArchive::class);
        $this->transformationServiceMock = $this->createMock(TransformationService::class);

        // Create partial mock of Exporter to only mock getTransformationService
        $this->exporter = $this->getMockBuilder(Exporter::class)
            ->setConstructorArgs([$this->itemMock, $this->zipMock])
            ->onlyMethods(['getTransformationService'])
            ->getMock();

        // Set up transformation service mock
        $this->exporter->method('getTransformationService')
            ->willReturn($this->transformationServiceMock);
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

        // Set up TransformationService mock expectations
        $this->transformationServiceMock->method('createQtiElementName')
            ->willReturnMap(
                [
                ['assessmentItem', 'qti-assessment-item'],
                ['responseDeclaration', 'qti-response-declaration'],
                ['itemBody', 'qti-item-body'],
                ['choiceInteraction', 'qti-choice-interaction'],
                ['simpleChoice', 'qti-simple-choice']
                ]
            );

        $this->transformationServiceMock->expects($this->any())
            ->method('transformAttributes')
            ->willReturnCallback(
                function (DOMElement $source, DOMElement $target) {
                    // Copy attributes for testing
                    foreach ($source->attributes as $attr) {
                        if (!str_starts_with($attr->nodeName, 'xmlns')) {
                            $target->setAttribute($attr->nodeName, $attr->value);
                        }
                    }
                }
            );

        $this->transformationServiceMock->expects($this->any())
            ->method('transformChildren')
            ->willReturnCallback(
                function (DOMElement $oldElement, DOMElement $newParent, DOMDocument $newDom) {
                    foreach ($oldElement->childNodes as $child) {
                        if ($child instanceof DOMElement) {
                            // Use the same transformation logic as the real service
                            $newName = 'qti-' . strtolower(preg_replace('/([a-z])([A-Z])/', '$1-$2', $child->nodeName));
                            $newElement = $newDom->createElement($newName);

                            // Copy attributes
                            foreach ($child->attributes as $attr) {
                                if (!str_starts_with($attr->nodeName, 'xmlns')) {
                                    $newElement->setAttribute($attr->nodeName, $attr->value);
                                }
                            }

                            // Handle nested elements recursively
                            if ($child->childNodes->length === 1 && $child->firstChild->nodeType === XML_TEXT_NODE) {
                                $newElement->textContent = $child->textContent;
                            } else {
                                // Recursive call to handle nested elements
                                $this->transformationServiceMock->transformChildren($child, $newElement, $newDom);
                            }

                            $newParent->appendChild($newElement);
                        } elseif ($child->nodeType === XML_TEXT_NODE && trim($child->nodeValue) !== '') {
                            $newParent->appendChild($newDom->createTextNode($child->nodeValue));
                        }
                    }
                }
            );

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
        $this->assertEquals(
            'http://www.imsglobal.org/xsd/imsqtiasi_v3p0',
            $rootElement->getAttribute('xmlns')
        );

        // Verify transformed elements exist
        $this->assertNotEmpty($rootElement->getElementsByTagName('qti-response-declaration'));
        $this->assertNotEmpty($rootElement->getElementsByTagName('qti-item-body'));
        $this->assertNotEmpty($rootElement->getElementsByTagName('qti-choice-interaction'));
        $this->assertNotEmpty($rootElement->getElementsByTagName('qti-simple-choice'));
    }
}
