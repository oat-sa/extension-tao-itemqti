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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\metadata;

use DOMDocument;
use PHPUnit\Framework\TestCase;
use oat\taoQtiItem\model\qti\metadata\imsManifest\ImsManifestMapping;
use oat\taoQtiItem\model\qti\metadata\imsManifest\ImsManifestMetadataInjector;
use oat\taoQtiItem\model\qti\metadata\imsManifest\classificationMetadata\ClassificationSourceMetadataValue;

final class ImsManifestMetadataInjectorTest extends TestCase
{
    protected ImsManifestMetadataInjector $imsManifestInjector;

    public function setUp(): void
    {
        $mappings = [
            new ImsManifestMapping(
                'http://ltsc.ieee.org/xsd/LOM',
                'imsmd',
                'http://www.imsglobal.org/xsd/imsmd_loose_v1p3p2.xsd'
            )
        ];

        $this->imsManifestInjector = new ImsManifestMetadataInjector($mappings);
    }

    private function createXmlTemplate(string $resourceId): string
    {
        return sprintf(
            '<manifest xmlns="http://www.imsglobal.org/xsd/imscp_v1p1" 
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
                <resources>
                    <resource identifier="%s"/>
                </resources>
            </manifest>',
            $resourceId
        );
    }

    /**
     * Test that special characters like & < > are encoded as &amp; &lt; &gt; in xml output
     */
    public function testInjectMetadata(): void
    {
        $resourceId = 'i65dd88260e386150d3bf822a1dace381';

        $metaValue1 = new ClassificationSourceMetadataValue(
            $resourceId,
            'http://www.w3.org/2000/01/rdf-schema#label'
        );

        $metaValue2 = new ClassificationSourceMetadataValue($resourceId, 'Amp &');
        $metaValue3 = new ClassificationSourceMetadataValue($resourceId, 'Gt >');
        $metaValue4 = new ClassificationSourceMetadataValue($resourceId, 'Lt <');

        $metaValues = [
            $resourceId => [
                $metaValue1,
                $metaValue2,
                $metaValue3,
                $metaValue4,
            ],
        ];

        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->loadXML($this->createXmlTemplate($resourceId));

        $this->imsManifestInjector->inject($dom, $metaValues);

        $xml = $dom->saveXML();

        $this->assertRegExp('/Amp &amp;/', $xml);
        $this->assertRegExp('/Gt &gt;/', $xml);
        $this->assertRegExp('/Lt &lt;/', $xml);
    }
}
