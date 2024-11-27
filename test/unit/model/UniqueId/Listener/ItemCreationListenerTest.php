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

namespace oat\taoQtiItem\test\unit\model\UniqueId\Listener;

use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorInterface;
use oat\tao\model\TaoOntology;
use oat\tao\model\Translation\Service\AbstractQtiIdentifierSetter;
use oat\taoItems\model\event\ItemCreatedEvent;
use oat\taoQtiItem\model\qti\Identifier\Service\QtiIdentifierSetter;
use oat\taoQtiItem\model\UniqueId\Listener\ItemCreationListener;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class ItemCreationListenerTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private core_kernel_classes_Resource $resource;

    /** @var FeatureFlagCheckerInterface|MockObject */
    private FeatureFlagCheckerInterface $featureFlagChecker;

    /** @var Ontology|MockObject */
    private Ontology $ontology;

    /** @var IdentifierGeneratorInterface|MockObject */
    private IdentifierGeneratorInterface $identifierGenerator;

    /** @var QtiIdentifierSetter|MockObject */
    private QtiIdentifierSetter $qtiIdentifierSetter;

    private ItemCreationListener $sut;

    protected function setUp(): void
    {
        $this->resource = $this->createMock(core_kernel_classes_Resource::class);

        $this->featureFlagChecker = $this->createMock(FeatureFlagCheckerInterface::class);
        $this->ontology = $this->createMock(Ontology::class);
        $this->identifierGenerator = $this->createMock(IdentifierGeneratorInterface::class);
        $this->qtiIdentifierSetter = $this->createMock(QtiIdentifierSetter::class);

        $this->sut = new ItemCreationListener(
            $this->featureFlagChecker,
            $this->ontology,
            $this->identifierGenerator,
            $this->qtiIdentifierSetter
        );
    }

    public function testFeatureDisabled(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')
            ->willReturn(false);

        $this->identifierGenerator
            ->expects($this->never())
            ->method('generate');

        $this->resource
            ->expects($this->never())
            ->method($this->anything());

        $this->qtiIdentifierSetter
            ->expects($this->never())
            ->method('set');

        $this->sut->populateUniqueId(new ItemCreatedEvent('itemUri'));
    }

    public function testIsNotItem(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')
            ->willReturn(true);

        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('itemUri')
            ->willReturn($this->resource);

        $this->resource
            ->expects($this->once())
            ->method('getRootId')
            ->willReturn('notItemRootId');

        $this->identifierGenerator
            ->expects($this->never())
            ->method('generate');

        $this->resource
            ->expects($this->never())
            ->method('editPropertyValues');

        $this->qtiIdentifierSetter
            ->expects($this->never())
            ->method('set');

        $this->sut->populateUniqueId(new ItemCreatedEvent('itemUri'));
    }

    public function testSuccess(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')
            ->willReturn(true);

        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('itemUri')
            ->willReturn($this->resource);

        $this->resource
            ->expects($this->once())
            ->method('getRootId')
            ->willReturn(TaoOntology::CLASS_URI_ITEM);

        $this->identifierGenerator
            ->expects($this->once())
            ->method('generate')
            ->with([IdentifierGeneratorInterface::OPTION_RESOURCE => $this->resource])
            ->willReturn('123456789');

        $property = $this->createMock(core_kernel_classes_Property::class);

        $this->ontology
            ->expects($this->once())
            ->method('getProperty')
            ->with(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER)
            ->willReturn($property);

        $this->resource
            ->expects($this->once())
            ->method('editPropertyValues')
            ->with($property, '123456789');

        $this->qtiIdentifierSetter
            ->expects($this->once())
            ->method('set')
            ->with([
                AbstractQtiIdentifierSetter::OPTION_RESOURCE => $this->resource,
                AbstractQtiIdentifierSetter::OPTION_IDENTIFIER => '123456789',
            ]);

        $this->sut->populateUniqueId(new ItemCreatedEvent('itemUri'));
    }
}
