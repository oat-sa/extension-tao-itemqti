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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\ServiceProvider;

use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\oatbox\log\LoggerService;
use oat\taoQtiItem\model\Export\Qti22PostProcessorService;
use oat\taoQtiItem\model\Export\Qti3Package\ExporterFactory;
use oat\taoQtiItem\model\Export\Qti3Package\Qti3XsdValidator;
use oat\taoQtiItem\model\Export\Qti3Package\TransformationService;
use oat\taoQtiItem\model\qti\converter\CaseConversionService;
use oat\taoQtiItem\model\qti\converter\ItemConverter;
use oat\taoQtiItem\model\qti\converter\ManifestConverter;
use oat\taoQtiItem\model\qti\Identifier\Service\QtiIdentifierSetter;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiItem\model\ValidationService;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

class QtiServiceProvider implements ContainerServiceProviderInterface
{
    public function __invoke(ContainerConfigurator $configurator): void
    {
        $services = $configurator->services();

        $services
            ->set(QtiIdentifierSetter::class, QtiIdentifierSetter::class)
            ->args([
                service(Service::class),
                service(LoggerService::SERVICE_ID),
            ]);

        $services->set(Qti3XsdValidator::class, Qti3XsdValidator::class)->args([
            service(ValidationService::class),
        ])->public();

        $services->set(TransformationService::class, TransformationService::class)->args([
            service(Qti3XsdValidator::class),
        ])->public();

        $services->set(ExporterFactory::class, ExporterFactory::class)
        ->args([
            service(TransformationService::class),
        ])->public();

        $services->set(CaseConversionService::class);

        $services
            ->set(ManifestConverter::class, ManifestConverter::class)
            ->public();

        $services->set(ItemConverter::class)
            ->args([
                service(CaseConversionService::class),
                service(ValidationService::SERVICE_ID)
            ])
            ->public();

        $services->set(Qti22PostProcessorService::class)
            ->public();
    }
}
