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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\integration;

use DOMDocument;
use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\helpers\Authoring;
use oat\taoQtiItem\model\qti\interaction\TextEntryInteraction;
use oat\taoQtiItem\model\qti\Parser;
use qtism\data\AssessmentItem;
use qtism\data\storage\xml\marshalling\MarshallerNotFoundException;
use qtism\data\storage\xml\marshalling\Qti21MarshallerFactory;

// phpcs:disable PSR1.Files.SideEffects
include_once dirname(__FILE__) . '/../../includes/raw_start.php';
// phpcs:enable PSR1.Files.SideEffects

class UmfiTextEntryItemXmlTest extends TaoPhpUnitTestRunner
{
    private const SAMPLE_FILE = __DIR__ . '/samples/xml/qtiv2p1/items/umfi_text_entry_item.xml';

    private const EXPECTED_ESCAPED_UMFI = 'data-umfi-values="[{&quot;group&quot;:&quot;GROUP_1_FOUND&quot;'
        . ',&quot;canonical&quot;:&quot;apple&quot;,&quot;variants&quot;'
        . ':[&quot;apple&quot;,&quot;apples&quot;]}]"';

    public function setUp(): void
    {
        TaoPhpUnitTestRunner::initTest();
    }

    public function testSampleXmlIsWellFormed(): void
    {
        $xml = file_get_contents(self::SAMPLE_FILE);

        $this->assertNotFalse($xml);

        $dom = new DOMDocument('1.0', 'UTF-8');
        $this->assertTrue($dom->loadXML($xml));
        $this->assertSame(0, $dom->getElementsByTagName('parsererror')->length);
    }

    public function testSampleXmlDoesNotLeakInternalAuthoringAttributes(): void
    {
        $xml = file_get_contents(self::SAMPLE_FILE);

        $this->assertNotFalse($xml);
        $this->assertStringNotContainsString('data-umfi-managed-outcomes', $xml);
        $this->assertStringNotContainsString('data-umfi-rp-managed', $xml);
    }

    /**
     * @throws MarshallerNotFoundException
     */
    public function testSampleXmlUnmarshalsAsValidQtiItem(): void
    {
        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->load(self::SAMPLE_FILE);

        $factory = new Qti21MarshallerFactory();
        $marshaller = $factory->createMarshaller($dom->documentElement);
        $item = $marshaller->unmarshall($dom->documentElement);

        $this->assertInstanceOf(AssessmentItem::class, $item);
        $this->assertSame('umfi-text-entry-sample', $item->getIdentifier());
        $this->assertStringContainsString('data-umfi-values=\'[{"group"', file_get_contents(self::SAMPLE_FILE));
        $this->assertStringContainsString('"canonical"', file_get_contents(self::SAMPLE_FILE));
        $this->assertStringContainsString('"apple"', file_get_contents(self::SAMPLE_FILE));
    }

    public function testTextEntryInteractionEscapesUmfiValuesOnExport(): void
    {
        $interaction = new TextEntryInteraction();
        $interaction->setAttribute('data-item-type', 'umfi-closed');
        $interaction->setAttribute('data-case-sensitive', 'false');
        $interaction->setAttribute(
            'data-umfi-values',
            '[{"group":"GROUP_1_FOUND","canonical":"apple","variants":["apple","apples"]}]'
        );

        $output = $interaction->toQTI();

        $this->assertStringContainsString(self::EXPECTED_ESCAPED_UMFI, $output);
    }

    public function testRoundTripEscapesUmfiValues(): void
    {
        $xml = file_get_contents(self::SAMPLE_FILE);
        $this->assertNotFalse($xml);

        $sanitizedXml = Authoring::sanitizeQtiXml($xml);
        $item = (new Parser($sanitizedXml))->load();

        $textEntryInteractions = $item->getBody()->getElements(TextEntryInteraction::class);
        $this->assertCount(1, $textEntryInteractions);

        $output = $item->toXML();

        $this->assertStringContainsString(self::EXPECTED_ESCAPED_UMFI, $output);
    }
}
