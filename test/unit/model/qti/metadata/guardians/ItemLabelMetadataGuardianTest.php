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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\metadata\guardians;

use core_kernel_classes_Class;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\generis\model\OntologyRdfs;
use oat\generis\test\TestCase;
use oat\taoQtiItem\model\qti\metadata\guardians\ItemLabelMetadataGuardian;
use oat\taoQtiItem\model\qti\metadata\MetadataValue;
use PHPUnit\Framework\MockObject\MockObject;

class ItemLabelMetadataGuardianTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private $instanceMock;

    /** @var core_kernel_classes_Class|MockObject */
    private $classMock;

    /** @var ItemLabelMetadataGuardian */
    private $sut;

    protected function setUp(): void
    {
        $this->classMock = $this->createMock(core_kernel_classes_Class::class);
        $this->instanceMock = $this->createMock(core_kernel_classes_Resource::class);

        $ontologyMock = $this->createMock(Ontology::class);
        $ontologyMock->method('getClass')->willReturn($this->classMock);

        $this->sut = new ItemLabelMetadataGuardian([
            ItemLabelMetadataGuardian::OPTION_PROPERTY_URI => OntologyRdfs::RDFS_LABEL,
        ]);
        $this->sut->setModel($ontologyMock);
    }

    /**
     * @dataProvider guardData
     */
    public function testGuard(array $instances, array $metadataValues, $expected): void
    {
        $this->classMock->method('searchInstances')->willReturn($instances);

        $this->assertEquals($expected, $this->sut->guard($metadataValues));
    }

    public function testGuardUsesScopeClassWhenProvided(): void
    {
        $scopedClassMock = $this->createMock(core_kernel_classes_Class::class);
        $scopedClassMock->method('exists')->willReturn(true);
        $scopedClassMock->method('getUri')->willReturn('http://example.com#scopedClass');

        $this->sut->setScopeClass($scopedClassMock);

        $scopedClassMock->expects($this->once())
            ->method('searchInstances')
            ->willReturn([$this->instanceMock]);

        $this->assertSame(
            $this->instanceMock,
            $this->sut->guard([
                $this->getMetadataValue('Item label', [OntologyRdfs::RDFS_LABEL]),
            ])
        );
    }

    public function guardData(): array
    {
        return [
            'noMetadataValues' => [
                'instances' => [],
                'metadataValues' => [],
                'expected' => false,
            ],
            'wrongMetadataValuesPath' => [
                'instances' => [],
                'metadataValues' => [
                    $this->getMetadataValue('Item label', ['http://example.com#other']),
                ],
                'expected' => false,
            ],
            'noInstancesFound' => [
                'instances' => [],
                'metadataValues' => [
                    $this->getMetadataValue('Item label', [OntologyRdfs::RDFS_LABEL]),
                ],
                'expected' => false,
            ],
            'instancesFoundByRdfsLabelPath' => [
                'instances' => [
                    $this->instanceMock,
                ],
                'metadataValues' => [
                    $this->getMetadataValue('Item label', [OntologyRdfs::RDFS_LABEL]),
                ],
                'expected' => $this->instanceMock,
            ],
            'instancesFoundByLomLabelPath' => [
                'instances' => [
                    $this->instanceMock,
                ],
                'metadataValues' => [
                    $this->getMetadataValue('Item label', [
                        'http://ltsc.ieee.org/xsd/LOM#lom',
                        OntologyRdfs::RDFS_LABEL,
                    ]),
                ],
                'expected' => $this->instanceMock,
            ],
        ];
    }

    private function getMetadataValue(string $value, array $path): MetadataValue
    {
        $metadataValueMock = $this->createMock(MetadataValue::class);
        $metadataValueMock->method('getValue')->willReturn($value);
        $metadataValueMock->method('getPath')->willReturn($path);

        return $metadataValueMock;
    }
}
