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

namespace oat\taoQtiItem\model\FeatureFlag\ServiceProvider;

use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\tao\model\featureFlag\FeatureFlagConfigSwitcher;
use oat\taoQtiItem\model\FeatureFlag\UniqueNumericQtiIdentifierClientConfig;
use oat\taoQtiItem\model\FeatureFlag\UniqueNumericQtiIdentifierQtiCreator;
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
            );
    }
}
