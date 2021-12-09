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

namespace oat\taoQtiItem\test\unit\model\qti\CustomInteractionAsset\Extractor;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\qti\CustomInteractionAsset\Extractor\TextReaderExtendedAssetExtractor;
use oat\taoQtiItem\model\qti\interaction\ImsPortableCustomInteraction;
use Ramsey\Uuid\Uuid;

/**
 * @author Kiryl Poyu <kyril.poyu@taotesting.com>
 */
class TextReaderExtendedAssetExtractorTest extends TestCase
{
    /** @var TextReaderExtendedAssetExtractor */
    private $subject;
    /** @var ImsPortableCustomInteraction */
    private $interaction;

    protected function setUp(): void
    {
        parent::setUp();
        $this->interaction = new ImsPortableCustomInteraction();
        $this->subject = new TextReaderExtendedAssetExtractor($this->interaction);
    }

    /**
     * @throws \Exception
     */
    public function testExtractionSupportedMimeTypes(): void
    {
        $properties = $this->generateProperties();
        $this->interaction->setProperties($properties);
        $assets = $this->subject->extract();

        $this->assertCount(count($properties), $assets);
    }

    public function testExtractionNotDataUrlContent(): void
    {
        $properties = $this->generatePropertiesWithoutDataUrls();
        $this->interaction->setProperties($properties);
        $assets = $this->subject->extract();

        $this->assertEmpty($assets);
    }

    /**
     * @throws \Exception
     */
    private function generateProperties(): array
    {
        $properties = [];
        for ($i = 0, $maxAssets = random_int($i, 10); $i < $maxAssets; $i++) {
            $dataUrl = "data:image/jpeg;base64," . Uuid::uuid4()->toString();
            $properties[TextReaderExtendedAssetExtractor::CONTENT_PREFIX . Uuid::uuid4()->toString()] = $dataUrl;
        }

        return $properties;
    }

    public function generatePropertiesWithoutDataUrls(): array
    {
        $properties = [];
        $contentValues = ['http://localhost', 'file.ext'];
        for ($i = 0, $maxAssets = random_int($i, 10); $i < $maxAssets; $i++) {
            $properties[TextReaderExtendedAssetExtractor::CONTENT_PREFIX . Uuid::uuid4()->toString()] = $contentValues[$i % 2];
        }

        return $properties;
    }
}
