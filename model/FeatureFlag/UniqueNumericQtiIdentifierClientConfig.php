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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\FeatureFlag;

use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\featureFlag\FeatureFlagConfigHandlerInterface;

class UniqueNumericQtiIdentifierClientConfig implements FeatureFlagConfigHandlerInterface
{
    public const QTI_ID_PATTERN = '/^[^\t\n\r]*$/';
    public function __construct(FeatureFlagCheckerInterface $featureFlagChecker)
    {
        $this->featureFlagChecker = $featureFlagChecker;
    }
    public function __invoke(array $configs): array
    {
        if ($this->isEnabled()) {
            $configs['taoQtiItem/qtiCreator/widgets/helpers/qtiIdentifier']['qtiIdPattern'] = self::QTI_ID_PATTERN;
            $configs['taoQtiItem/qtiCreator/widgets/helpers/qtiIdentifier']['invalidQtiIdMessage'] =
                'The QTI identifier must be a 9-digit number.';
            $configs['taoQtiItem/qtiCreator/widgets/helpers/qtiIdentifier']['isDisabled'] = true;
        }

        return $configs;
    }

    private function isEnabled(): bool
    {
        return $this->featureFlagChecker
            ->isEnabled('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER');
    }
}
