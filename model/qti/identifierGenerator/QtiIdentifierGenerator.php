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

use core_kernel_classes_Resource;
use InvalidArgumentException;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorInterface;

class QtiIdentifierGenerator implements IdentifierGeneratorInterface
{
    private FeatureFlagCheckerInterface $featureFlagChecker;
    private IdentifierGeneratorInterface $numericIdentifierGenerator;

    public function __construct(
        FeatureFlagCheckerInterface $featureFlagChecker,
        IdentifierGeneratorInterface $numericIdentifierGenerator
    ) {
        $this->featureFlagChecker = $featureFlagChecker;
        $this->numericIdentifierGenerator = $numericIdentifierGenerator;
    }

    public function generate(array $options = []): string
    {
        if ($this->featureFlagChecker->isEnabled('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')) {
            return $this->numericIdentifierGenerator->generate($options);
        }

        $resourceId = $this->getResourceId($options);

        return explode('#', $resourceId)[1] ?? $resourceId;
    }

    private function getResourceId(array $options): string
    {
        if (isset($options[self::OPTION_RESOURCE_ID]) && is_string($options[self::OPTION_RESOURCE_ID])) {
            return $options[self::OPTION_RESOURCE_ID];
        }

        if (
            isset($options[self::OPTION_RESOURCE])
            && $options[self::OPTION_RESOURCE] instanceof core_kernel_classes_Resource
        ) {
            return $options[self::OPTION_RESOURCE]->getUri();
        }

        throw new InvalidArgumentException(
            'QTI Identifier generation failure: resource ID is required and must be a string'
        );
    }
}
