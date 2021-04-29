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
use PHPUnit\Framework\MockObject\MockObject;
use oat\taoQtiItem\model\qti\metadata\MetadataValue;
use oat\taoQtiItem\model\qti\metadata\guardians\MetadataGuardian;

class MetadataGuardianTest extends TestCase
{
    /** @var core_kernel_classes_Class|MockObject */
    private $class;

    /** @var MetadataGuardian|MockObject */
    private $metadataGuardian;

    protected function setUp(): void
    {
        $this->class = $this->createMock(core_kernel_classes_Class::class);

        $this->metadataGuardian = $this->getMockBuilder(MetadataGuardian::class)
            ->enableOriginalConstructor()
            ->setConstructorArgs([
                [
                    MetadataGuardian::OPTION_EXPECTED_PATH => [
                        'path1',
                        'path2',
                    ],
                    MetadataGuardian::OPTION_PROPERTY_URI => 'propertyUri',
                ],
            ])
            ->onlyMethods(['getClass'])
            ->getMock();
        $this->metadataGuardian
            ->expects(static::once())
            ->method('getClass')
            ->willReturn($this->class);
    }

    /**
     * @dataProvider guardData
     */
    public function testGuard(array $instances, array $metadataValues, $expected): void
    {
        $this->class
            ->method('searchInstances')
            ->willReturn($instances);

        $this->assertEquals($expected, $this->metadataGuardian->guard($metadataValues));
    }

    public function guardData(): array
    {
        $resource = $this->createMock(core_kernel_classes_Resource::class);

        return [
            'noMetadataValues' => [
                'instances' => [],
                'metadataValues' => [],
                'expected' => false,
            ],
            'wrongMetadataValuesPath' => [
                'instances' => [],
                'metadataValues' => [
                    $this->createMetadataValue('Item', ['path1']),
                ],
                'expected' => false,
            ],
            'noInstancesFound' => [
                'instances' => [],
                'metadataValues' => [
                    $this->createMetadataValue('Item', ['path1', 'path2']),
                ],
                'expected' => false,
            ],
            'instancesFound' => [
                'instances' => [
                    $resource,
                ],
                'metadataValues' => [
                    $this->createMetadataValue('Item', ['path1', 'path2']),
                ],
                'expected' => $resource,
            ],
        ];
    }

    private function createMetadataValue(string $value, array $path): MetadataValue
    {
        $metadataValue = $this->createMock(MetadataValue::class);
        $metadataValue
            ->method('getValue')
            ->willReturn($value);
        $metadataValue
            ->method('getPath')
            ->willReturn($path);

        return $metadataValue;
    }
}
