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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\metadata\guardians;

use oat\generis\test\TestCase;
use core_kernel_classes_Class;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use PHPUnit\Framework\MockObject\MockObject;
use oat\taoQtiItem\model\qti\metadata\MetadataValue;
use oat\taoQtiItem\model\qti\metadata\guardians\ItemMetadataGuardian;

class ItemMetadataGuardianTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private $instanceMock;

    /** @var core_kernel_classes_Class|MockObject */
    private $classMock;

    /** @var ItemMetadataGuardian|MockObject */
    private $sut;

    protected function setUp(): void
    {
        $this->classMock = $this->createMock(core_kernel_classes_Class::class);
        $this->instanceMock = $this->createMock(core_kernel_classes_Resource::class);

        $ontologyMock = $this->createMock(Ontology::class);
        $ontologyMock->method('getClass')->willReturn($this->classMock);

        $this->sut = new ItemMetadataGuardian([
            ItemMetadataGuardian::OPTION_EXPECTED_PATH => [
                'path1',
                'path2',
            ],
            ItemMetadataGuardian::OPTION_PROPERTY_URI => 'http://www.tao.lu/TestProperty',
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
                    $this->getMetadataValue('Item', ['path1']),
                ],
                'expected' => false,
            ],
            'noInstancesFound' => [
                'instances' => [],
                'metadataValues' => [
                    $this->getMetadataValue('Item', ['path1', 'path2']),
                ],
                'expected' => false,
            ],
            'instancesFound' => [
                'instances' => [
                    $this->instanceMock,
                ],
                'metadataValues' => [
                    $this->getMetadataValue('Item', ['path1', 'path2']),
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
