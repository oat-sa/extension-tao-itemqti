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

namespace oat\taoQtiItem\model\FeatureFlag;

use oat\tao\model\featureFlag\FeatureFlagConfigHandlerInterface;

class WirisTrialModeClientConfig implements FeatureFlagConfigHandlerInterface
{
    public const ENV_CLIENT_WIRIS_TRIAL_MODE = 'ENV_CLIENT_WIRIS_TRIAL_MODE';

    private const ACTIVE_MODULE = 'taoQtiItem/qtiCreator/widgets/static/math/states/Active';

    public function __invoke(array $configs): array
    {
        $configs[self::ACTIVE_MODULE]['wirisTrialMode'] = $this->isWirisTrialModeEnabled();

        return $configs;
    }

    private function isWirisTrialModeEnabled(): bool
    {
        if (array_key_exists(self::ENV_CLIENT_WIRIS_TRIAL_MODE, $_ENV)) {
            $value = $_ENV[self::ENV_CLIENT_WIRIS_TRIAL_MODE];
        } else {
            $value = getenv(self::ENV_CLIENT_WIRIS_TRIAL_MODE);
        }

        if ($value === false || $value === null || $value === '') {
            return true;
        }

        $parsed = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

        return $parsed ?? true;
    }
}
