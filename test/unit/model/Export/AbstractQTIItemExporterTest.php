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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\Export;

use oat\tao\model\media\MediaBrowser;
use oat\taoQtiItem\model\Export\AbstractQTIItemExporter;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;
use RuntimeException;

class AbstractQTIItemExporterTest extends TestCase
{
    /**
     * @dataProvider styleSheetInfoProvider
     */
    public function testIsStyleSheetAsset(array $fileInfo, string $link, bool $expected): void
    {
        $mediaSource = $this->createMock(MediaBrowser::class);
        $mediaSource
            ->method('getFileInfo')
            ->with($link)
            ->willReturn($fileInfo);

        $this->assertSame($expected, $this->isStyleSheetAsset($mediaSource, $link));
    }

    public function styleSheetInfoProvider(): array
    {
        return [
            'css mime' => [['mime' => 'text/css'], 'asset.txt', true],
            'image mime' => [['mime' => 'image/png'], 'asset.css', false],
            'empty mime with css link' => [['mime' => ''], 'styles/theme.css', true],
            'empty mime with png link' => [['mime' => ''], 'images/theme.png', false],
            'css mime with parameters' => [['mime' => 'text/css;charset=UTF-8'], 'asset.txt', true],
        ];
    }

    public function testIsStyleSheetAssetReturnsFalseWhenFileInfoCannotBeRead(): void
    {
        $mediaSource = $this->createMock(MediaBrowser::class);
        $mediaSource
            ->method('getFileInfo')
            ->willThrowException(new RuntimeException('media source unavailable'));

        $this->assertFalse($this->isStyleSheetAsset($mediaSource, 'styles/theme.css'));
    }

    private function isStyleSheetAsset(MediaBrowser $mediaSource, string $link): bool
    {
        $exporter = $this->getMockBuilder(AbstractQTIItemExporter::class)
            ->disableOriginalConstructor()
            ->getMockForAbstractClass();

        $method = new ReflectionMethod(AbstractQTIItemExporter::class, 'isStyleSheetAsset');
        $method->setAccessible(true);

        return $method->invoke($exporter, $mediaSource, $link);
    }
}
