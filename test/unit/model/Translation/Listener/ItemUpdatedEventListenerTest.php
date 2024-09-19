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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\Translation\Listener;

use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\TaoOntology;
use oat\taoItems\model\event\ItemUpdatedEvent;
use oat\taoQtiItem\model\UniqueId\Listener\ItemUpdatedEventListener;
use oat\taoQtiItem\model\UniqueId\Service\QtiIdentifierRetriever;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class ItemUpdatedEventListenerTest extends TestCase
{
    /** @var ItemUpdatedEvent|MockObject */
    private ItemUpdatedEvent $itemUpdatedEvent;

    /** @var core_kernel_classes_Resource|MockObject */
    private core_kernel_classes_Resource $item;

    /** @var core_kernel_classes_Property|MockObject */
    private core_kernel_classes_Property $property;

    /** @var FeatureFlagCheckerInterface|MockObject */
    private FeatureFlagCheckerInterface $featureFlagChecker;

    /** @var Ontology|MockObject */
    private Ontology $ontology;

    /** @var QtiIdentifierRetriever|MockObject */
    private QtiIdentifierRetriever $qtiIdentifierRetriever;

    /** @var LoggerInterface|MockObject */
    private LoggerInterface $logger;

    private ItemUpdatedEventListener $sut;

    protected function setUp(): void
    {
        $this->itemUpdatedEvent = $this->createMock(ItemUpdatedEvent::class);
        $this->item = $this->createMock(core_kernel_classes_Resource::class);
        $this->property = $this->createMock(core_kernel_classes_Property::class);

        $this->featureFlagChecker = $this->createMock(FeatureFlagCheckerInterface::class);
        $this->ontology = $this->createMock(Ontology::class);
        $this->qtiIdentifierRetriever = $this->createMock(QtiIdentifierRetriever::class);
        $this->logger = $this->createMock(LoggerInterface::class);

        $this->sut = new ItemUpdatedEventListener(
            $this->featureFlagChecker,
            $this->ontology,
            $this->qtiIdentifierRetriever,
            $this->logger
        );
    }

    public function testPopulateTranslationPropertiesTranslationDisabled(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_TRANSLATION_ENABLED')
            ->willReturn(false);

        $this->ontology
            ->expects($this->never())
            ->method($this->anything());
        $this->logger
            ->expects($this->never())
            ->method($this->anything());
        $this->itemUpdatedEvent
            ->expects($this->never())
            ->method($this->anything());
        $this->item
            ->expects($this->never())
            ->method($this->anything());
        $this->qtiIdentifierRetriever
            ->expects($this->never())
            ->method($this->anything());

        $this->sut->populateTranslationProperties($this->itemUpdatedEvent);
    }

    public function testPopulateTranslationProperties(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_TRANSLATION_ENABLED')
            ->willReturn(true);

        $this->ontology
            ->expects($this->once())
            ->method('getProperty')
            ->with(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER)
            ->willReturn($this->property);

        $this->itemUpdatedEvent
            ->expects($this->once())
            ->method('getItemUri')
            ->willReturn('itemUri');

        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('itemUri')
            ->willReturn($this->item);

        $this->item
            ->expects($this->once())
            ->method('getOnePropertyValue')
            ->with($this->property)
            ->willReturn(null);

        $this->logger
            ->expects($this->never())
            ->method('info');

        $this->qtiIdentifierRetriever
            ->expects($this->once())
            ->method('retrieve')
            ->with($this->item)
            ->willReturn('qtiIdentifier');

        $this->item
            ->expects($this->once())
            ->method('setPropertyValue')
            ->with($this->property, 'qtiIdentifier');

        $this->sut->populateTranslationProperties($this->itemUpdatedEvent);
    }

    public function testPopulateTranslationPropertiesValueSet(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_TRANSLATION_ENABLED')
            ->willReturn(true);

        $this->ontology
            ->expects($this->once())
            ->method('getProperty')
            ->with(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER)
            ->willReturn($this->property);

        $this->itemUpdatedEvent
            ->expects($this->once())
            ->method('getItemUri')
            ->willReturn('itemUri');

        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('itemUri')
            ->willReturn($this->item);

        $this->item
            ->expects($this->once())
            ->method('getOnePropertyValue')
            ->with($this->property)
            ->willReturn('propertyValue');

        $this->logger
            ->expects($this->once())
            ->method('info');

        $this->qtiIdentifierRetriever
            ->expects($this->never())
            ->method('retrieve');

        $this->item
            ->expects($this->never())
            ->method('setPropertyValue');

        $this->sut->populateTranslationProperties($this->itemUpdatedEvent);
    }
}
