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

namespace oat\taoQtiItem\model\Translation\ServiceProvider;

use oat\generis\model\data\Ontology;
use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\oatbox\log\LoggerService;
use oat\tao\model\TaoOntology;
use oat\tao\model\Translation\Service\ResourceLanguageRetriever;
use oat\tao\model\Translation\Service\ResourceTranslatableStatusRetriever;
use oat\tao\model\Translation\Service\TranslationCreationService;
use oat\tao\model\Translation\Service\TranslationUniqueIdSetter;
use oat\taoQtiItem\model\qti\Identifier\Service\QtiIdentifierSetter;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiItem\model\Translation\Service\QtiLanguageRetriever;
use oat\taoQtiItem\model\Translation\Service\QtiLanguageSetter;
use oat\taoQtiItem\model\Translation\Service\ResourceTranslatableStatusHandler;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use tao_models_classes_LanguageService;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

class TranslationServiceProvider implements ContainerServiceProviderInterface
{
    public function __invoke(ContainerConfigurator $configurator): void
    {
        $services = $configurator->services();

        $services
            ->set(QtiLanguageRetriever::class, QtiLanguageRetriever::class)
            ->args([
                service(Service::class),
                service(LoggerService::SERVICE_ID),
            ]);

        $services
            ->get(ResourceLanguageRetriever::class)
            ->call(
                'setRetriever',
                [
                    TaoOntology::CLASS_URI_ITEM,
                    service(QtiLanguageRetriever::class),
                ]
            );

        $services
            ->set(QtiLanguageSetter::class, QtiLanguageSetter::class)
            ->args([
                service(Service::class),
                service(LoggerService::SERVICE_ID),
                service(Ontology::SERVICE_ID),
                service(tao_models_classes_LanguageService::class),
            ]);

        $services
            ->set(ResourceTranslatableStatusHandler::class, ResourceTranslatableStatusHandler::class)
            ->args([
                service(Service::class),
                service(LoggerService::SERVICE_ID),
                service(Ontology::SERVICE_ID),
            ]);

        $services
            ->get(TranslationUniqueIdSetter::class)
            ->call(
                'addQtiIdentifierSetter',
                [
                    service(QtiIdentifierSetter::class),
                    TaoOntology::CLASS_URI_ITEM,
                ]
            );

        $services
            ->get(TranslationCreationService::class)
            ->call(
                'addPostCreation',
                [
                    TaoOntology::CLASS_URI_ITEM,
                    service(QtiLanguageSetter::class),
                ]
            )
            ->call(
                'addPostCreation',
                [
                    TaoOntology::CLASS_URI_ITEM,
                    service(TranslationUniqueIdSetter::class),
                ]
            );

        $services
            ->get(ResourceTranslatableStatusRetriever::class)
            ->call(
                'addCallable',
                [
                    TaoOntology::CLASS_URI_ITEM,
                    service(ResourceTranslatableStatusHandler::class),
                ]
            );
    }
}
