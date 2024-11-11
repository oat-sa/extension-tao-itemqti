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

namespace oat\taoQtiItem\test\unit\model\qti\identifierGenerator;

use core_kernel_classes_Resource;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorInterface;
use oat\taoQtiItem\model\qti\identifierGenerator\QtiIdentifierGenerator;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class QtiIdentifierGeneratorTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private core_kernel_classes_Resource $resource;

    /** @var FeatureFlagCheckerInterface|MockObject */
    private FeatureFlagCheckerInterface $featureFlagChecker;

    /** @var IdentifierGeneratorInterface|MockObject */
    private IdentifierGeneratorInterface $numericIdentifierGenerator;

    private QtiIdentifierGenerator $sut;

    protected function setUp(): void
    {
        $this->resource = $this->createMock(core_kernel_classes_Resource::class);
        $this->featureFlagChecker = $this->createMock(FeatureFlagCheckerInterface::class);
        $this->numericIdentifierGenerator = $this->createMock(IdentifierGeneratorInterface::class);

        $this->sut = new QtiIdentifierGenerator($this->featureFlagChecker, $this->numericIdentifierGenerator);
    }

    public function testNumericFeatureDisabled(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')
            ->willReturn(false);

        $this->resource
            ->expects($this->once())
            ->method('getUri')
            ->willReturn('namespace#resourceIdentifier');

        $this->assertEquals(
            'resourceIdentifier',
            $this->sut->generate([IdentifierGeneratorInterface::OPTION_RESOURCE => $this->resource])
        );
    }

    public function testNumericFeatureEnabled(): void
    {
        $options = [IdentifierGeneratorInterface::OPTION_RESOURCE => $this->resource];

        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')
            ->willReturn(true);

        $this->numericIdentifierGenerator
            ->expects($this->once())
            ->method('generate')
            ->with($options)
            ->willReturn('123456789');

        $identifier = $this->sut->generate($options);

        $this->assertEquals('123456789', $identifier);
    }
}
