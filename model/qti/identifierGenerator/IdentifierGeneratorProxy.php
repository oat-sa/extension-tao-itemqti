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

namespace oat\taoQtiItem\model\qti\identifierGenerator;

use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;

class IdentifierGeneratorProxy implements IdentifierGenerator
{
    private SimpleQtiIdentifierGenerator $simpleQtiIdentifierGenerator;
    private UniqueNumericQtiIdentifierGenerator $uniqueNumericQtiIdentifierGenerator;
    private FeatureFlagCheckerInterface $featureFlagChecker;

    public function __construct(
        SimpleQtiIdentifierGenerator $simpleQtiIdentifierGenerator,
        UniqueNumericQtiIdentifierGenerator $uniqueNumericQtiIdentifierGenerator,
        FeatureFlagCheckerInterface $featureFlagChecker
    ) {
        $this->simpleQtiIdentifierGenerator = $simpleQtiIdentifierGenerator;
        $this->uniqueNumericQtiIdentifierGenerator = $uniqueNumericQtiIdentifierGenerator;
        $this->featureFlagChecker = $featureFlagChecker;
    }

    public function generate(array $options = []): string
    {
        if ($this->featureFlagChecker->isEnabled('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')) {
            return $this->uniqueNumericQtiIdentifierGenerator->generate($options);
        }

        return $this->simpleQtiIdentifierGenerator->generate($options);
    }
}
