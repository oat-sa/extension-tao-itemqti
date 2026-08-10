<?php

/**
 * SPDX-FileCopyrightText: 2026 Open Assessment Technologies S.A.
 * Copyright (C) 2026 (original work) Open Assessment Technologies S.A.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-TAO-Commercial-License
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\FeatureFlag;

use oat\tao\model\featureFlag\FeatureFlagConfigHandlerInterface;

class WirisTrialModeClientConfig implements FeatureFlagConfigHandlerInterface
{
    public const ENV_CLIENT_WIRIS_TRIAL_MODE = 'ENV_CLIENT_WIRIS_TRIAL_MODE';

    public function __invoke(array $configs): array
    {
        $configs['taoQtiItem/qtiCreator/widgets/static/math/states/Active']['wirisTrialMode'] =
            $this->isWirisTrialModeEnabled();

        return $configs;
    }

    private function isWirisTrialModeEnabled(): bool
    {
        $value = $_ENV[self::ENV_CLIENT_WIRIS_TRIAL_MODE]
            ?? getenv(self::ENV_CLIENT_WIRIS_TRIAL_MODE);

        if ($value === false || $value === null || $value === '') {
            return true;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }
}
