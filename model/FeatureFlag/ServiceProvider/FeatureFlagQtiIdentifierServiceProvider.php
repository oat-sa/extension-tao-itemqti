<?php

/**
 * SPDX-FileCopyrightText: 2024-2026 Open Assessment Technologies S.A.
 * Copyright (C) 2026 (original work) Open Assessment Technologies S.A.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-TAO-Commercial-License
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\FeatureFlag\ServiceProvider;

use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\tao\model\featureFlag\FeatureFlagConfigSwitcher;
use oat\taoQtiItem\model\FeatureFlag\UniqueNumericQtiIdentifierClientConfig;
use oat\taoQtiItem\model\FeatureFlag\UniqueNumericQtiIdentifierQtiCreator;
use oat\taoQtiItem\model\FeatureFlag\WirisTrialModeClientConfig;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

class FeatureFlagQtiIdentifierServiceProvider implements ContainerServiceProviderInterface
{
    public function __invoke(ContainerConfigurator $configurator): void
    {
        $services = $configurator->services();

        $services
            ->set(UniqueNumericQtiIdentifierClientConfig::class)
            ->args(
                [
                    service(FeatureFlagChecker::class),
                ]
            )
            ->public();

        $services
            ->set(UniqueNumericQtiIdentifierQtiCreator::class)
            ->args(
                [
                    service(FeatureFlagChecker::class),
                ]
            )
            ->public();

        $services
            ->set(WirisTrialModeClientConfig::class)
            ->public();

        $services->get(FeatureFlagConfigSwitcher::class)
            ->call(
                'addClientConfigHandler',
                [
                    UniqueNumericQtiIdentifierClientConfig::class,
                ]
            )->call(
                'addExtensionConfigHandler',
                [
                    'taoQtiItem',
                    'qtiCreator',
                    UniqueNumericQtiIdentifierQtiCreator::class
                ]
            )->call(
                'addClientConfigHandler',
                [
                    WirisTrialModeClientConfig::class,
                ]
            );
    }
}
