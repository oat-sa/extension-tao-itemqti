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
use oat\taoQtiItem\model\Export\Qti3Package\TransformationService;
use DOMDocument;
use oat\taoQtiItem\model\ValidationService;
use PHPUnit\Framework\TestCase;

class TransformationServiceTest extends TestCase
{
    private TransformationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $validationService = new ValidationService();
        $validator = new Qti3XsdValidator($validationService);
        $this->service = new TransformationService($validator);
    }

    public function testGetElementName(): void
    {
        // getElementName should always return qti-prefixed name
        $result = $this->service->createQtiElementName('assessmentItem');
        $this->assertEquals('qti-assessment-item', $result);
    }

    /**
     * @dataProvider attributeTransformationProvider
     */
    public function testTransformAttributes(string $input, array $expectedAttributes): void
    {
        $oldDoc = new DOMDocument();
        $oldDoc->loadXML($input);

        $newDoc = new DOMDocument();
        $newElement = $newDoc->createElement('new-element');
        $newDoc->appendChild($newElement);

        $this->service->transformAttributes($oldDoc->documentElement, $newElement);

        foreach ($expectedAttributes as $name => $value) {
            $this->assertEquals($value, $newElement->getAttribute($name));
        }
    }

    public function attributeTransformationProvider(): array
    {
        return [
            'basic attributes' => [
                '<element responseIdentifier="RESPONSE" baseType="string"/>',
                [
                    'response-identifier' => 'RESPONSE',
                    'base-type' => 'string'
                ]
            ],
            'camelCase attributes' => [
                '<element maxChoices="1" showHide="show"/>',
                [
                    'max-choices' => '1',
                    'show-hide' => 'show'
                ]
            ],
            'ignore namespace attributes' => [
                '<element xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" baseType="string"/>',
                [
                    'base-type' => 'string'
                ]
            ]
        ];
    }

    public function testTransformChildren(): void
    {
        $oldDoc = new DOMDocument();
        $oldDoc->loadXML(
            '
            <assessmentItem>
                <responseDeclaration identifier="RESPONSE"/>
                <itemBody>
                    <div class="wrapper">
                        <choiceInteraction responseIdentifier="RESPONSE">
                            <simpleChoice identifier="A">Choice A</simpleChoice>
                        </choiceInteraction>
                    </div>
                </itemBody>
            </assessmentItem>
        '
        );

        $newDoc = new DOMDocument();
        $newRoot = $newDoc->createElement('qti-assessment-item');
        $newDoc->appendChild($newRoot);

        $this->service->transformChildren($oldDoc->documentElement, $newRoot, $newDoc);

        // Assert the structure is preserved with correct element names
        $this->assertXmlStringEqualsXmlString(
            '<?xml version="1.0"?>
            <qti-assessment-item>
                <qti-response-declaration identifier="RESPONSE"/>
                <qti-item-body>
                    <div class="wrapper">
                        <qti-choice-interaction response-identifier="RESPONSE">
                            <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
                        </qti-choice-interaction>
                    </div>
                </qti-item-body>
            </qti-assessment-item>',
            $newDoc->saveXML()
        );
    }

    /**
     * @dataProvider elementNameProvider
     */
    public function testElementNameConversion(string $input, string $expected): void
    {
        $result = $this->service->createQtiElementName($input);
        $this->assertEquals($expected, $result);
    }

    public function elementNameProvider(): array
    {
        return [
            'assessment item' => ['assessmentItem', 'qti-assessment-item'],
            'choice interaction' => ['choiceInteraction', 'qti-choice-interaction'],
            'simple choice' => ['simpleChoice', 'qti-simple-choice'],
            'response declaration' => ['responseDeclaration', 'qti-response-declaration'],
        ];
    }
}
