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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\ServiceProvider;

use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\taoQtiItem\model\qti\validator\ItemIdentifierValidator;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\env;

class ItemIdentifierValidatorServiceProvider implements ContainerServiceProviderInterface
{
    public function __invoke(ContainerConfigurator $configurator): void
    {
        $services = $configurator->services();
        $parameters = $configurator->parameters();

        /**
         * Please specify the QTI Identifier Validator Pattern that will be used to validate the item identifier
         * Ex: /^[a-zA-Z_]{1}[a-zA-Z0-9_-]*$/u
         * The Default is /^[a-zA-Z_]{1}[a-zA-Z0-9_\.-]*$/u
         */
        $parameters->set(
            ItemIdentifierValidator::DEFAULT_PATTERN_PARAMETER_NAME,
            ItemIdentifierValidator::DEFAULT_PATTERN
        );

        $services->set(ItemIdentifierValidator::class, ItemIdentifierValidator::class)
            ->public()
            ->args(
                [
                    env(
                        sprintf(
                            'default:%s:%s',
                            ItemIdentifierValidator::DEFAULT_PATTERN_PARAMETER_NAME,
                            ItemIdentifierValidator::ENV_QTI_IDENTIFIER_VALIDATOR_PATTERN
                        )
                    )
                ]
            );
    }
}
