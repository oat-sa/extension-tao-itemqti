<?php

declare(strict_types=1);

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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiItem\test\unit\model\qti\CustomInteractionAsset;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\qti\CustomInteractionAsset\CustomInteractionAssetExtractorAllocator;
use oat\taoQtiItem\model\qti\CustomInteractionAsset\Extractor\TextReaderAssetExtractor;
use oat\taoQtiItem\model\qti\interaction\CustomInteraction;
use oat\taoQtiItem\model\qti\interaction\ImsPortableCustomInteraction;
use oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction;

/**
 * @author Kiryl Poyu <kyril.poyu@taotesting.com>
 */
class ExtendedCustomInteractionAssetExtractorAllocatorTest extends TestCase
{
    public function testSuccessTextReaderExtractorAllocationFromImsPCI(): void
    {
        $interaction = new ImsPortableCustomInteraction();
        $interaction->setTypeIdentifier(
            CustomInteractionAssetExtractorAllocator::TEXT_READER_INTERACTION
        );
        $extractor = CustomInteractionAssetExtractorAllocator::allocateExtractor($interaction);

        $this->assertInstanceOf(TextReaderAssetExtractor::class, $extractor);
    }

    public function testSuccessTextReaderExtractorAllocationFromPCI(): void
    {
        $interaction = new PortableCustomInteraction();
        $interaction->setTypeIdentifier(
            CustomInteractionAssetExtractorAllocator::TEXT_READER_INTERACTION
        );
        $extractor = CustomInteractionAssetExtractorAllocator::allocateExtractor($interaction);

        $this->assertInstanceOf(TextReaderAssetExtractor::class, $extractor);
    }


    public function testUnsupportedAssetExtractorAllocationForCustomInteraction(): void
    {
        $interaction = new class extends CustomInteraction { };
        $extractor = CustomInteractionAssetExtractorAllocator::allocateExtractor($interaction);

        $this->assertNull($extractor);
    }

    public function testUnsupportedAssetExtractorAllocationFromImsPCI(): void
    {
        $interaction = new ImsPortableCustomInteraction();
        $interaction->setTypeIdentifier('');
        $extractor = CustomInteractionAssetExtractorAllocator::allocateExtractor($interaction);

        $this->assertNull($extractor);
    }

    public function testUnsupportedAssetExtractorAllocationFromPCI(): void
    {
        $interaction = new PortableCustomInteraction();
        $interaction->setTypeIdentifier('');
        $extractor = CustomInteractionAssetExtractorAllocator::allocateExtractor($interaction);

        $this->assertNull($extractor);
    }
}
