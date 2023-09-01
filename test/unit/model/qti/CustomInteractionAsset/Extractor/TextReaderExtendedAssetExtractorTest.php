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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA ;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\CustomInteractionAsset\Extractor;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\qti\CustomInteractionAsset\Extractor\TextReaderAssetExtractor;
use oat\taoQtiItem\model\qti\interaction\CustomInteraction;

/**
 * @author Kiryl Poyu <kyril.poyu@taotesting.com>
 */
class TextReaderExtendedAssetExtractorTest extends TestCase
{
    private const CONTENT_PREFIX = 'content-';

    /** @var TextReaderAssetExtractor */
    private $subject;

    protected function setUp(): void
    {
        parent::setUp();
        $this->subject = new TextReaderAssetExtractor();
    }

    /**
     * @throws \Exception
     */
    public function testExtractionSupportedMimeTypes(): void
    {
        $interaction = $this->generateCustomInteractionWithProperties();
        $assets = $this->subject->extract($interaction);

        $this->assertCount(count($interaction->getProperties()), $assets);
    }

    public function testExtractionNotDataUrlContent(): void
    {
        $interaction = $this->generateCustomInteractionPropertiesWithoutDataUrls();
        $assets = $this->subject->extract($interaction);

        $this->assertEmpty($assets);
    }

    /**
     * @throws \Exception
     */
    private function generateCustomInteractionWithProperties(): CustomInteraction
    {
        $properties = [];
        for ($i = 0, $maxAssets = random_int($i, 10); $i < $maxAssets; $i++) {
            $dataUrl = "data:image/jpeg;base64," . uniqid('test', true);
            $properties[self::CONTENT_PREFIX . uniqid('test', true)] = $dataUrl;
        }

        return new class ($properties) extends CustomInteraction {
            /**
             * @var array
             */
            private $properties;

            public function __construct(array $properties)
            {
                parent::__construct();
                $this->properties = $properties;
            }

            public function getProperties()
            {
                return $this->properties;
            }
        };
    }

    public function generateCustomInteractionPropertiesWithoutDataUrls(): CustomInteraction
    {
        $properties = [];
        $contentValues = ['http://localhost', 'file.ext'];
        for ($i = 0, $maxAssets = random_int($i, 10); $i < $maxAssets; $i++) {
            $properties[self::CONTENT_PREFIX . uniqid('test', true)] = $contentValues[$i % 2];
        }

        return new class ($properties) extends CustomInteraction {
            /**
             * @var array
             */
            private $properties;

            public function __construct(array $properties)
            {
                parent::__construct();
                $this->properties = $properties;
            }

            public function getProperties()
            {
                return $this->properties;
            }
        };
    }
}
