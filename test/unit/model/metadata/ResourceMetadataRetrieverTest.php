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

namespace oat\taoQtiItem\test\unit\model\metadata;

use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use core_kernel_classes_Triple;
use oat\generis\model\data\Ontology;
use oat\taoItems\model\TaoItemOntology;
use oat\taoQtiItem\model\metadata\ResourceMetadataRetriever;
use PHPUnit\Framework\TestCase;

class ResourceMetadataRetrieverTest extends TestCase
{
    public function setUp(): void
    {
        $this->ontologyMock = $this->createMock(Ontology::class);
        $this->subject = new ResourceMetadataRetriever(
            $this->ontologyMock
        );
    }

    public function testGetProperties()
    {
        $resourceMock = $this->createMock(core_kernel_classes_Resource::class);
        $ignoredRdfTripleMock = $this->createMock(core_kernel_classes_Triple::class);
        $propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $ignoredRdfTripleMock->predicate = TaoItemOntology::PROPERTY_ITEM_CONTENT;
        $rdfTripleMock = $this->createMock(core_kernel_classes_Triple::class);

        $resourceMock->method('getRdfTriples')->willReturn([
            $ignoredRdfTripleMock,
            $rdfTripleMock,
            $rdfTripleMock
        ]);

        $this->ontologyMock->method('getProperty')->willReturn($propertyMock);

        $propertyMock
            ->method('isProperty')
            ->willReturn(false, true);

        $propertyMock->method('getLabel')
            ->willReturn(
                'propertyLabel'
            );
        $resourceMock->method('getPropertyValues')->willReturn(['propertyValue', 'someUri']);

        $this->ontologyMock
            ->method('getResource')
            ->willReturn($resourceMock);

        $resourceMock->method('getLabel')
            ->willReturn('Resource Label');

        $resourceMock->method('exists')
            ->willReturn(true, false);

        $result = $this->subject->getProperties($resourceMock);
        self::assertIsArray($result);
        self::assertArrayHasKey('propertyLabel', $result);
        self::assertIsArray($result['propertyLabel']);
        self::assertEquals($result['propertyLabel'], ['Resource Label', 'someUri']);
    }
}
