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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\metadata;

use core_kernel_classes_Resource;
use oat\oatbox\event\EventManager;
use oat\taoQtiItem\model\qti\metadata\MetadataInjectionException;
use oat\taoQtiItem\model\qti\metadata\ontology\OntologyMetadataInjector;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class OntologyMetadataInjectorTest extends TestCase
{
    /** @var EventManager|MockObject */
    private $eventManager;

    /** @var LoggerInterface|MockObject */
    private $loggerMock;

    /** @var OntologyMetadataInjector */
    private $sut;

    protected function setUp(): void
    {
        $this->loggerMock = $this->createMock(LoggerInterface::class);
        $this->eventManager = $this->createMock(EventManager::class);

        $this->sut = new OntologyMetadataInjector(
            $this->loggerMock,
            $this->eventManager
        );
    }

    public function testInjectNonResourceThrowsException()
    {
        $this->expectException(MetadataInjectionException::class);
        $this->sut->inject((object)[], []);
    }

    public function testInjectWithNoInjectionRulesDoesDoesNothing()
    {
        $target = $this->createMock(core_kernel_classes_Resource::class);

        $values = [
            'choice' => [
                new SimpleMetadataValue(
                    'choice',
                    [
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#lom',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#general',
                        'http://www.imsglobal.org/xsd/imsmd_v1p2#identifier'
                    ],
                    'qti_v2_item_01'
                )
            ]
        ];

        $target
            ->expects($this->never())
            ->method('removePropertyValueByLg');

        $target
            ->expects($this->never())
            ->method('setPropertyValueByLg');

        $this->eventManager
            ->expects($this->never())
            ->method('trigger');

        $this->sut->inject($target, $values);
    }

    // @todo Tests with actual injection rules
}
