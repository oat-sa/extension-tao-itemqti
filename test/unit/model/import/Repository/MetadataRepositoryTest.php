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
 * Copyright (c) 2021  (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\import\Repository;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\import\Repository\MetadataRepository;
use oat\generis\model\data\Ontology;
use oat\generis\model\GenerisRdf;
use core_kernel_classes_Class;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use PHPUnit\Framework\MockObject\MockObject;

class MetadataRepositoryTest extends TestCase
{
    private const URI = 'https://test-tao.docker.localhost/ontologies/tao.rdf#i60a4c48ec090693e7eff48464b03b8';

    private MetadataRepository $repository;
    private Ontology|MockObject $ontology;
    private GenerisRdf|MockObject $generis;
    private MockObject|core_kernel_classes_Class $classMock;
    private core_kernel_classes_Property|MockObject $propertyMock;

    public function setUp(): void
    {
        $this->repository = new MetadataRepository();
        $this->ontology = $this->createMock(Ontology::class);
        $this->generis = $this->createMock(GenerisRdf::class);
        $this->classMock = $this->createMock(core_kernel_classes_Class::class);
        $this->propertyMock = $this->createMock(core_kernel_classes_Property::class);
        $this->repository->setServiceLocator(
            $this->getServiceLocatorMock(
                [
                    Ontology::SERVICE_ID => $this->ontology
                ]
            )
        );
    }

    public function testFindMetadataByClassUri(): void
    {
        $this->ontology
            ->method('getClass')
            ->willReturn($this->classMock);

        $this->classMock
            ->method('getProperty')
            ->with($this->generis::PROPERTY_ALIAS)
            ->willReturn($this->propertyMock);

        $this->classMock
            ->method('getProperties')
            ->with(true)
            ->willReturn(
                [
                    $this->propertyMock
                ]
            );

        $this->propertyMock
        ->method('getWidget')
        ->willReturn($this->propertyMock);

        $this->propertyMock
        ->method('getOnePropertyValue')
        ->willReturn("Alias Value");

        $metaDataArray = $this->repository->findMetadataByClassUri(self::URI);
        $this->assertContainsOnlyInstancesOf(core_kernel_classes_Property::class, $metaDataArray);
    }
}
