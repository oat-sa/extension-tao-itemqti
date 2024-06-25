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

namespace oat\taoQtiItem\scripts\install;

use common_ext_ExtensionsManager;
use oat\oatbox\extension\InstallAction;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;

class EnableUuidQtiIdentifier extends InstallAction
{
    public function __invoke($params): void
    {
        if ($this->customIdentifierGenerationStrategyEnabled()) {
            $this->addQtiCreatorConfig();
            $this->addClientLibRegistryEntry();
        }
    }

    private function addClientLibRegistryEntry(): void
    {
        $taoExtension = $this->getServiceManager()
            ->get(common_ext_ExtensionsManager::SERVICE_ID)
            ->getExtensionById('tao');

        $config = $taoExtension->getConfig('client_lib_config_registry');

        if (!isset($config['taoQtiItem/qtiCreator/widgets/helpers/qtiIdentifier'])) {
            $config['taoQtiItem/qtiCreator/widgets/helpers/qtiIdentifier'] = [
                'qtiIdPattern' => '/^\d{9}$/'
            ];
        }

        $taoExtension->setConfig('client_lib_config_registry', $config);
    }

    private function addQtiCreatorConfig(): void
    {
        $taoQtiItemExtension = $this->getServiceManager()
            ->get(common_ext_ExtensionsManager::SERVICE_ID)
            ->getExtensionById('taoQtiItem');
        $config = $taoQtiItemExtension
            ->getConfig('qtiCreator');

        if (!isset($config['identifierGenerationStrategy'])) {
            $config['identifierGenerationStrategy'] = 'uuid';
        }

        $taoQtiItemExtension->setConfig('qtiCreator', $config);
    }

    private function customIdentifierGenerationStrategyEnabled(): bool
    {
        return $this->getServiceManager()
            ->getContainer()
            ->get(FeatureFlagChecker::class)
            ->isEnabled(FeatureFlagCheckerInterface::FEATURE_FLAG_UUID_QTI_IDENTIFIER);
    }
}
