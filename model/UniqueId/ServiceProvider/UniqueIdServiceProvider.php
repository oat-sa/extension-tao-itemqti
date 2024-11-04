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

namespace oat\taoQtiItem\model\UniqueId\ServiceProvider;

use oat\generis\model\data\Ontology;
use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\oatbox\log\LoggerService;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorProxy;
use oat\tao\model\TaoOntology;
use oat\tao\model\Translation\Service\TranslationCreationService;
use oat\taoItems\model\Form\Modifier\FormModifierProxy;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiItem\model\UniqueId\Listener\ItemCreationListener;
use oat\taoQtiItem\model\UniqueId\Listener\ItemUpdatedEventListener;
use oat\taoQtiItem\model\UniqueId\Modifier\UniqueIdFormModifier;
use oat\taoQtiItem\model\UniqueId\Service\QtiIdentifierRetriever;
use oat\taoQtiItem\model\UniqueId\Service\QtiIdentifierSetter;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

class UniqueIdServiceProvider implements ContainerServiceProviderInterface
{
    public function __invoke(ContainerConfigurator $configurator): void
    {
        $services = $configurator->services();

        $services
            ->set(QtiIdentifierRetriever::class, QtiIdentifierRetriever::class)
            ->args([
                service(Service::class),
                service(LoggerService::SERVICE_ID),
            ]);

        $services
            ->set(UniqueIdFormModifier::class, UniqueIdFormModifier::class)
            ->args([
                service(Ontology::SERVICE_ID),
                service(QtiIdentifierRetriever::class),
                service(FeatureFlagChecker::class),
            ]);

        $services
            ->get(FormModifierProxy::class)
            ->call(
                'addModifier',
                [
                    service(UniqueIdFormModifier::class),
                ]
            );

        $services
            ->set(ItemUpdatedEventListener::class, ItemUpdatedEventListener::class)
            ->public()
            ->args([
                service(FeatureFlagChecker::class),
                service(Ontology::SERVICE_ID),
                service(QtiIdentifierRetriever::class),
                service(LoggerService::SERVICE_ID),
            ]);

        $services
            ->set(ItemCreationListener::class, ItemCreationListener::class)
            ->public()
            ->args([
                service(FeatureFlagChecker::class),
                service(Ontology::SERVICE_ID),
                service(IdentifierGeneratorProxy::class),
                service(Service::class),
            ]);

        $services
            ->set(QtiIdentifierSetter::class, QtiIdentifierSetter::class)
            ->args([
                service(Service::class),
                service(LoggerService::SERVICE_ID),
                service(Ontology::SERVICE_ID),
            ]);

        $services
            ->get(TranslationCreationService::class)
            ->call(
                'addPostCreation',
                [
                    TaoOntology::CLASS_URI_ITEM,
                    service(QtiIdentifierSetter::class),
                ]
            );
    }
}
