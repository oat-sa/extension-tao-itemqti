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

namespace oat\taoQtiItem\model\qti\metadata\importer;

use http\Env;
use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\oatbox\log\LoggerService;
use oat\tao\model\Lists\Business\Service\RemoteSource;
use oat\taoBackOffice\model\lists\ListService;
use oat\taoQtiItem\model\import\ChecksumGenerator;
use oat\taoQtiItem\model\qti\metadata\exporter\CustomPropertiesManifestScanner;
use oat\taoQtiItem\model\qti\metadata\exporter\scale\ScalePreprocessor;
use oat\taoQtiItem\model\qti\metadata\ontology\MappedMetadataInjector;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\env;
use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

class MetaMetadataServiceProvider implements ContainerServiceProviderInterface
{
    public function __invoke(ContainerConfigurator $configurator): void
    {
        $services = $configurator->services();

        $services
            ->set(MappedMetadataInjector::class, MappedMetadataInjector::class)
            ->args([
                service(ListService::class)
            ])
            ->public();

        $services
            ->set(MetaMetadataImportMapper::class, MetaMetadataImportMapper::class)
            ->args([
                service(ChecksumGenerator::class)
            ])
            ->public();

        $services
            ->set(CustomPropertiesManifestScanner::class);

        $services->set(ScalePreprocessor::class)
            ->args([
                service(RemoteSource::SERVICE_ID),
                service(CustomPropertiesManifestScanner::class),
                service(LoggerService::SERVICE_ID),
                env('REMOTE_LIST_SCALE')
                    ->default('')
                    ->string()
            ])
            ->public();
    }
}
