<?php

/**
 * SPDX-FileCopyrightText: 2026-2026 Open Assessment Technologies S.A.
 * Copyright (C) 2026 (original work) Open Assessment Technologies S.A.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-TAO-Commercial-License
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\FeatureFlag;

use oat\taoQtiItem\model\FeatureFlag\WirisTrialModeClientConfig;
use PHPUnit\Framework\TestCase;

class WirisTrialModeClientConfigTest extends TestCase
{
    private const ACTIVE_MODULE = 'taoQtiItem/qtiCreator/widgets/static/math/states/Active';

    private ?string $previousEnv;
    private bool $hadEnvKey;

    protected function setUp(): void
    {
        $this->hadEnvKey = array_key_exists(
            WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE,
            $_ENV
        );
        $this->previousEnv = $this->hadEnvKey
            ? $_ENV[WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE]
            : null;
    }

    protected function tearDown(): void
    {
        if ($this->hadEnvKey) {
            $_ENV[WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE] = $this->previousEnv;
            putenv(
                WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE . '=' . $this->previousEnv
            );
            return;
        }

        unset($_ENV[WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE]);
        putenv(WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE);
    }

    /**
     * @dataProvider trialModeProvider
     */
    public function testInvokeWritesWirisTrialModeAndPreservesExistingConfig(
        ?string $envValue,
        bool $expected
    ): void {
        $this->setTrialModeEnv($envValue);

        $existing = [
            'unrelated/module' => ['keep' => true],
            self::ACTIVE_MODULE => ['otherProp' => 'kept'],
        ];

        $result = (new WirisTrialModeClientConfig())($existing);

        $this->assertSame(true, $result['unrelated/module']['keep']);
        $this->assertSame('kept', $result[self::ACTIVE_MODULE]['otherProp']);
        $this->assertSame($expected, $result[self::ACTIVE_MODULE]['wirisTrialMode']);
    }

    public function trialModeProvider(): array
    {
        return [
            'unset defaults to true' => [null, true],
            'empty string defaults to true' => ['', true],
            'true enables notice' => ['true', true],
            'false disables notice' => ['false', false],
            'malformed defaults to true' => ['not-a-bool', true],
        ];
    }

    private function setTrialModeEnv(?string $value): void
    {
        if ($value === null) {
            unset($_ENV[WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE]);
            putenv(WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE);
            return;
        }

        $_ENV[WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE] = $value;
        putenv(WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE . '=' . $value);
    }
}
