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

namespace oat\taoQtiItem\test\unit\metadata;

use DOMDocument;
use InvalidArgumentException;
use oat\taoQtiItem\model\qti\metadata\imsManifest\MetaMetadataExtractor;
use PHPUnit\Framework\TestCase;

final class MetaMetadataExtractorTest extends TestCase
{
    public function testExtractInvalidArgumentException(): void
    {
        $extractor = new MetaMetadataExtractor();
        $this->expectException(InvalidArgumentException::class);
        $extractor->extract('test');
    }

    public function testExtractSuccess(): void
    {
        $extractor = new MetaMetadataExtractor();
        $dom = new DOMDocument();
        $dom->loadXML('<?xml version="1.0" encoding="UTF-8"?>
            <imsmd:metaMetadata xmlns:imsmd="http://ltsc.ieee.org/xsd/LOM">
                <def:extension xmlns:def="http://www.imsglobal.org/xsd/imscp_v1p1">
                    <def:customProperties>
                        <def:property>
                            <def:uri>http://example.com</def:uri>
                            <def:alias>example</def:alias>
                            <def:label>Example</def:label>
                            <def:multiple>1</def:multiple>
                            <def:checksum>123</def:checksum>
                            <def:widget>Password</def:widget>
                        </def:property>
                    </def:customProperties>
                </def:extension>
            </imsmd:metaMetadata>');
        $result = $extractor->extract($dom);
        $this->assertEquals([
            [
                'uri' => 'http://example.com',
                'alias' => 'example',
                'label' => 'Example',
                'multiple' => '1',
                'checksum' => '123',
                'widget' => 'Password'
            ]
        ], $result);
    }

    public function testExtractFailure(): void
    {
        $extractor = new MetaMetadataExtractor();
        $dom = new DOMDocument();
        $dom->loadXML('<?xml version="1.0" encoding="UTF-8"?>
            <imsmd:metaMetadata xmlns:imsmd="http://ltsc.ieee.org/xsd/LOM">
                <def:extension xmlns:def="http://www.imsglobal.org/xsd/imscp_v1p1">
                    <def:customProperties>
                        <def:property>
                            <def:uri></def:uri>
                            <def:alias></def:alias>
                            <def:label></def:label>
                            <def:multiple></def:multiple>
                            <def:checksum></def:checksum>
                        </def:property>
                    </def:customProperties>
                </def:extension>
            </imsmd:metaMetadata>');
        $result = $extractor->extract($dom);
        $this->assertEquals([], $result);
    }
}
