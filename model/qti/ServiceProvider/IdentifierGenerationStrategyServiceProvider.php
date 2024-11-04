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

namespace oat\taoQtiItem\model\qti\ServiceProvider;

use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use common_ext_ExtensionsManager as ExtensionsManager;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorProxy;
use oat\tao\model\IdentifierGenerator\Generator\NumericIdentifierGenerator;
use oat\tao\model\TaoOntology;
use oat\taoQtiItem\helpers\QtiXmlLoader;
use oat\taoQtiItem\model\qti\identifierGenerator\QtiIdentifierGenerator;
use oat\taoQtiItem\model\qti\parser\UniqueNumericQtiIdentifierReplacer;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

class IdentifierGenerationStrategyServiceProvider implements ContainerServiceProviderInterface
{
    public function __invoke(ContainerConfigurator $configurator): void
    {
        $services = $configurator->services();

        $services
            ->set(QtiXmlLoader::class, QtiXmlLoader::class)
            ->args([
                service(ExtensionsManager::SERVICE_ID)
            ]);

        $services
            ->set(QtiIdentifierGenerator::class, QtiIdentifierGenerator::class)
            ->args([
                service(FeatureFlagChecker::class),
                service(NumericIdentifierGenerator::class),
            ]);

        $services
            ->get(IdentifierGeneratorProxy::class)
            ->call(
                'addIdentifierGenerator',
                [
                    service(QtiIdentifierGenerator::class),
                    TaoOntology::CLASS_URI_ITEM,
                ]
            );

        $services
            ->set(UniqueNumericQtiIdentifierReplacer::class, UniqueNumericQtiIdentifierReplacer::class)
            ->args([
                service(FeatureFlagChecker::class),
                service(QtiXmlLoader::class),
                service(NumericIdentifierGenerator::class)
            ])
            ->public();
    }
}
