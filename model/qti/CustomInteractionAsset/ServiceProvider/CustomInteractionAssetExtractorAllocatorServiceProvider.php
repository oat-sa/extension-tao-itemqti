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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\CustomInteractionAsset\ServiceProvider;

use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\taoQtiItem\model\qti\CustomInteractionAsset\CustomInteractionAssetExtractorAllocator;
use oat\taoQtiItem\model\qti\CustomInteractionAsset\Extractor\TextReaderAssetExtractor;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use function Symfony\Component\DependencyInjection\Loader\Configurator\inline_service;

class CustomInteractionAssetExtractorAllocatorServiceProvider implements ContainerServiceProviderInterface
{
    public function __invoke(ContainerConfigurator $configurator): void
    {
        $services = $configurator->services();

        $services
            ->set(CustomInteractionAssetExtractorAllocator::class, CustomInteractionAssetExtractorAllocator::class)
            ->public()
            ->arg('$extractorMapping', [
                TextReaderAssetExtractor::INTERACTION_IDENTIFIER => inline_service(TextReaderAssetExtractor::class)
            ]);
    }
}
