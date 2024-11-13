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

namespace oat\taoQtiItem\test\unit\model\qti\parser;

use DOMDocument;
use DOMXPath;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorInterface;
use oat\taoQtiItem\helpers\QtiXmlLoader;
use oat\taoQtiItem\model\qti\parser\UniqueNumericQtiIdentifierReplacer;
use PHPUnit\Framework\TestCase;

class UniqueNumericQtiIdentifierReplacerTest extends TestCase
{
    public function setUp(): void
    {
        $this->featureFlagCheckerMock = $this->createMock(FeatureFlagChecker::class);
        $this->qtiXmlLoaderMock = $this->createMock(QtiXmlLoader::class);
        $this->identifierGeneratorMock = $this->createMock(IdentifierGeneratorInterface::class);

        $this->subject = new UniqueNumericQtiIdentifierReplacer(
            $this->featureFlagCheckerMock,
            $this->qtiXmlLoaderMock,
            $this->identifierGeneratorMock
        );
    }

    public function testReplace(): void
    {
        $this->identifierGeneratorMock
            ->expects(self::once())
            ->method('generate')
            ->willReturn('123456789');

        $qti = file_get_contents(__DIR__ . '/qti.xml');
        $this->featureFlagCheckerMock->method('isEnabled')
            ->willReturn(true);

        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->loadXML($qti);

        $xpath = new DOMXpath($dom);
        $xpath->registerNamespace('qti', 'http://www.imsglobal.org/xsd/imsqti_v2p2');
        $identifierNodes = $xpath->query('//qti:assessmentItem/@identifier');
        $initialValue = $identifierNodes->item(0)->nodeValue;

        $this->qtiXmlLoaderMock->method('load')
            ->willReturn($dom);

        $this->subject->replace($qti);

        $xpath = new DOMXpath($dom);
        $xpath->registerNamespace('qti', 'http://www.imsglobal.org/xsd/imsqti_v2p2');
        $identifierNodes = $xpath->query('//qti:assessmentItem/@identifier');
        $this->assertRegExp('/\d{9}/', $identifierNodes->item(0)->nodeValue);
        $this->assertNotEquals($initialValue, $identifierNodes->item(0)->nodeValue);
    }

    public function testReplaceWhenFeatureFlagDisabled(): void
    {
        $this->identifierGeneratorMock
            ->expects($this->never())
            ->method('generate');

        $qti = file_get_contents(__DIR__ . '/qti.xml');
        $this->featureFlagCheckerMock->method('isEnabled')
            ->willReturn(false);

        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->loadXML($qti);

        $xpath = new DOMXpath($dom);
        $xpath->registerNamespace('qti', 'http://www.imsglobal.org/xsd/imsqti_v2p2');
        $identifierNodes = $xpath->query('//qti:assessmentItem/@identifier');
        $initialValue = $identifierNodes->item(0)->nodeValue;

        $this->qtiXmlLoaderMock->method('load')
            ->willReturn($dom);

        $this->subject->replace($qti);

        $xpath = new DOMXpath($dom);
        $xpath->registerNamespace('qti', 'http://www.imsglobal.org/xsd/imsqti_v2p2');
        $identifierNodes = $xpath->query('//qti:assessmentItem/@identifier');
        $this->assertEquals($initialValue, $identifierNodes->item(0)->nodeValue);
    }
}
