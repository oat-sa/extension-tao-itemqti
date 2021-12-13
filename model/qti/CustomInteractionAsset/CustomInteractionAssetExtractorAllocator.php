<?php

/*
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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti\CustomInteractionAsset;

use oat\taoQtiItem\model\qti\CustomInteractionAsset\Extractor\Api\AssetExtractorInterface;
use oat\taoQtiItem\model\qti\CustomInteractionAsset\Extractor\NullAssetExtractor;

/**
 * @author Kiryl Poyu <kyril.poyu@taotesting.com>
 */
class CustomInteractionAssetExtractorAllocator
{
    /**
     * @var array<AssetExtractorInterface>
     */
    private $extractorMapping;

    /**
     * @param array<AssetExtractorInterface> $extractorMapping
     */
    public function __construct(array $extractorMapping)
    {
        $this->extractorMapping = $extractorMapping;
    }

    public function allocateExtractor(string $interactionTypeIdentifier): AssetExtractorInterface
    {
        return $this->extractorMapping[$interactionTypeIdentifier] ?? new NullAssetExtractor();
    }
}
