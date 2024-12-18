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

use oat\taoQtiItem\model\Export\Qti3Package\TransformationService;
use DOMDocument;
use PHPUnit\Framework\TestCase;

class TransformationServiceTest  extends TestCase
{
    private TransformationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new TransformationService();
    }

    public function testCleanNamespaces(): void
    {
        $input = '<?xml version="1.0" encoding="UTF-8"?>
            <qti:assessmentItem xmlns:qti="http://www.imsglobal.org/xsd/imsqti_v2p1">
                <qti:responseDeclaration identifier="RESPONSE"/>
            </qti:assessmentItem>';

        $expected = '<?xml version="1.0" encoding="UTF-8"?>
            <assessmentItem>
                <responseDeclaration identifier="RESPONSE"/>
            </assessmentItem>';

        $result = $this->service->cleanNamespaces($input);

        // Normalize whitespace for comparison
        $expected = preg_replace('/\s+/', ' ', trim($expected));
        $result = preg_replace('/\s+/', ' ', trim($result));

        $this->assertEquals($expected, $result);
    }

    public function testGetElementName(): void
    {
        $element = new DOMDocument();
        $element->loadXML('<assessmentItem/>');

        $result = $this->service->getElementName($element->documentElement);
        $this->assertEquals('qti-assessment-item', $result);
    }

    public function testTransformAttributes(): void
    {
        $oldDoc = new DOMDocument();
        $oldDoc->loadXML('<element responseIdentifier="RESPONSE" baseType="string"/>');

        $newDoc = new DOMDocument();
        $newElement = $newDoc->createElement('new-element');
        $newDoc->appendChild($newElement);

        $this->service->transformAttributes($oldDoc->documentElement, $newElement);

        $this->assertEquals('RESPONSE', $newElement->getAttribute('response-identifier'));
        $this->assertEquals('string', $newElement->getAttribute('base-type'));
    }
}
