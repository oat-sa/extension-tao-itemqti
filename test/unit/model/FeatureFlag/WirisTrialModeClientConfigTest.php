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

namespace oat\taoQtiItem\test\unit\model\FeatureFlag;

use oat\taoQtiItem\model\FeatureFlag\WirisTrialModeClientConfig;
use PHPUnit\Framework\TestCase;

class WirisTrialModeClientConfigTest extends TestCase
{
    private const ACTIVE_MODULE = 'taoQtiItem/qtiCreator/widgets/static/math/states/Active';

    private ?string $previousEnv;
    private bool $hadEnvKey;
    /** @var string|false */
    private $previousGetenv;

    protected function setUp(): void
    {
        $this->hadEnvKey = array_key_exists(
            WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE,
            $_ENV
        );
        $this->previousEnv = $this->hadEnvKey
            ? $_ENV[WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE]
            : null;
        $this->previousGetenv = getenv(WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE);
    }

    protected function tearDown(): void
    {
        if ($this->hadEnvKey) {
            $_ENV[WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE] = $this->previousEnv;
        } else {
            unset($_ENV[WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE]);
        }

        if ($this->previousGetenv === false) {
            putenv(WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE);
            return;
        }

        putenv(
            WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE . '=' . $this->previousGetenv
        );
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

    public function testUsesGetenvFallbackWhenEnvSuperglobalUnsetPositive(): void
    {
        unset($_ENV[WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE]);
        putenv(WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE . '=true');

        $result = (new WirisTrialModeClientConfig())([]);

        $this->assertTrue($result[self::ACTIVE_MODULE]['wirisTrialMode']);
    }

    public function testUsesGetenvFallbackWhenEnvSuperglobalUnsetNegative(): void
    {
        unset($_ENV[WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE]);
        putenv(WirisTrialModeClientConfig::ENV_CLIENT_WIRIS_TRIAL_MODE . '=false');

        $result = (new WirisTrialModeClientConfig())([]);

        $this->assertFalse($result[self::ACTIVE_MODULE]['wirisTrialMode']);
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
