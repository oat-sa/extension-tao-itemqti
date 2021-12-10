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

namespace oat\taoQtiItem\test\unit\model\qti\CustomInteractionAsset\Extractor;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\qti\CustomInteractionAsset\Extractor\NullAssetExtractor;
use oat\taoQtiItem\model\qti\CustomInteractionAsset\Extractor\TextReaderAssetExtractor;
use oat\taoQtiItem\model\qti\interaction\CustomInteraction;
use Ramsey\Uuid\Uuid;

class NullAssetExtractorTest extends TestCase
{
    /** @var NullAssetExtractor */
    private $subject;

    protected function setUp(): void
    {
        parent::setUp();
        $this->subject = new NullAssetExtractor();
    }

    public function testEmptyAssetArrayExtraction(): void
    {
        $this->assertEmpty($this->subject->extract($this->generateCustomInteractionWithProperties()));
        $this->assertEmpty($this->subject->extract($this->generateCustomInteractionPropertiesWithoutDataUrls()));
    }

    private function generateCustomInteractionWithProperties(): CustomInteraction
    {
        return new class extends CustomInteraction{
            public function getProperties()
            {
                $properties = [];
                for ($i = 0, $maxAssets = random_int($i, 10); $i < $maxAssets; $i++) {
                    $dataUrl = "data:image/jpeg;base64," . Uuid::uuid4()->toString();
                    $properties[TextReaderAssetExtractor::CONTENT_PREFIX . Uuid::uuid4()->toString()] = $dataUrl;
                }

                return $properties;
            }
        };
    }

    public function generateCustomInteractionPropertiesWithoutDataUrls(): CustomInteraction
    {
        return new class extends CustomInteraction{
            public function getProperties()
            {
                $properties = [];
                $contentValues = ['http://localhost', 'file.ext'];
                for ($i = 0, $maxAssets = random_int($i, 10); $i < $maxAssets; $i++) {
                    $properties[TextReaderAssetExtractor::CONTENT_PREFIX . Uuid::uuid4()->toString()] = $contentValues[$i % 2];
                }

                return $properties;
            }
        };
    }
}
