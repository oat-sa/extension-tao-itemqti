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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\Export;

use oat\generis\test\TestCase;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\File;
use oat\taoQtiItem\model\Export\ScaleExportService;
use PHPUnit\Framework\MockObject\MockObject;
use RuntimeException;
use ZipArchive;

class ScaleExportServiceTest extends TestCase
{
    private ScaleExportService $service;

    public function setUp(): void
    {
        parent::setUp();
        $this->service = new ScaleExportService();
    }

    /**
     * Test that exportScaleFiles does nothing when scales directory doesn't exist
     */
    public function testExportScaleFilesReturnsEarlyWhenScalesDirectoryDoesNotExist(): void
    {
        $itemDirectory = $this->createMock(Directory::class);
        $scalesDir = $this->createMock(Directory::class);
        $zip = $this->createMock(ZipArchive::class);

        $itemDirectory->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scalesDir);

        $scalesDir->expects($this->once())
            ->method('exists')
            ->willReturn(false);

        // Zip should never be called
        $zip->expects($this->never())
            ->method('addFromString');

        $this->service->exportScaleFiles($itemDirectory, 'item_123', $zip);
    }

    /**
     * Test that exportScaleFiles exports valid JSON files
     */
    public function testExportScaleFilesExportsValidJsonFiles(): void
    {
        $itemDirectory = $this->createMock(Directory::class);
        $scalesDir = $this->createMock(Directory::class);
        $zip = $this->createMock(ZipArchive::class);

        $file1 = $this->createMockFile('OUTCOME_1.json', '{"scale":{"uri":"test"}}');
        $file2 = $this->createMockFile('OUTCOME_2.json', '{"scale":{"uri":"test2"}}');

        $itemDirectory->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scalesDir);

        $scalesDir->expects($this->once())
            ->method('exists')
            ->willReturn(true);

        $scalesDir->expects($this->once())
            ->method('getFlyIterator')
            ->with(Directory::ITERATOR_FILE)
            ->willReturn(new \ArrayIterator([$file1, $file2]));

        $zip->expects($this->exactly(2))
            ->method('addFromString')
            ->withConsecutive(
                ['item_123/scales/OUTCOME_1.json', '{"scale":{"uri":"test"}}'],
                ['item_123/scales/OUTCOME_2.json', '{"scale":{"uri":"test2"}}']
            )
            ->willReturn(true);

        $this->service->exportScaleFiles($itemDirectory, 'item_123', $zip);
    }

    /**
     * Test that non-JSON files are skipped
     */
    public function testExportScaleFilesSkipsNonJsonFiles(): void
    {
        $itemDirectory = $this->createMock(Directory::class);
        $scalesDir = $this->createMock(Directory::class);
        $zip = $this->createMock(ZipArchive::class);

        $jsonFile = $this->createMockFile('OUTCOME_1.json', '{"scale":{"uri":"test"}}');
        $txtFile = $this->createMockFile('readme.txt', 'This is a text file');
        $xmlFile = $this->createMockFile('scale.xml', '<scale></scale>');

        $itemDirectory->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scalesDir);

        $scalesDir->expects($this->once())
            ->method('exists')
            ->willReturn(true);

        $scalesDir->expects($this->once())
            ->method('getFlyIterator')
            ->with(Directory::ITERATOR_FILE)
            ->willReturn(new \ArrayIterator([$jsonFile, $txtFile, $xmlFile]));

        // Only the JSON file should be added
        $zip->expects($this->once())
            ->method('addFromString')
            ->with('item_123/scales/OUTCOME_1.json', '{"scale":{"uri":"test"}}')
            ->willReturn(true);

        $this->service->exportScaleFiles($itemDirectory, 'item_123', $zip);
    }

    /**
     * Test that exportScaleFiles handles ZIP addition failures gracefully (fail-soft)
     */
    public function testExportScaleFilesHandlesZipAdditionFailuresGracefully(): void
    {
        $itemDirectory = $this->createMock(Directory::class);
        $scalesDir = $this->createMock(Directory::class);
        $zip = $this->createMock(ZipArchive::class);

        $file = $this->createMockFile('OUTCOME_1.json', '{"scale":{"uri":"test"}}');

        $itemDirectory->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scalesDir);

        $scalesDir->expects($this->once())
            ->method('exists')
            ->willReturn(true);

        $scalesDir->expects($this->once())
            ->method('getFlyIterator')
            ->willReturn(new \ArrayIterator([$file]));

        $zip->expects($this->once())
            ->method('addFromString')
            ->willReturn(false); // Simulate ZIP failure

        // Should not throw - just log and continue (fail-soft approach)
        $this->service->exportScaleFiles($itemDirectory, 'item_123', $zip);

        // If we reach here without exception, test passes
        $this->assertTrue(true);
    }

    /**
     * Test that file read errors are handled gracefully (fail-soft)
     */
    public function testExportScaleFilesHandlesFileReadErrorsGracefully(): void
    {
        $itemDirectory = $this->createMock(Directory::class);
        $scalesDir = $this->createMock(Directory::class);
        $zip = $this->createMock(ZipArchive::class);

        $file = $this->createMock(File::class);
        $file->expects($this->any())
            ->method('getBasename')
            ->willReturn('OUTCOME_1.json');

        $file->expects($this->once())
            ->method('read')
            ->willThrowException(new \Exception('File read error'));

        $itemDirectory->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scalesDir);

        $scalesDir->expects($this->once())
            ->method('exists')
            ->willReturn(true);

        $scalesDir->expects($this->once())
            ->method('getFlyIterator')
            ->willReturn(new \ArrayIterator([$file]));

        // Should not throw - just log and continue (fail-soft approach)
        $this->service->exportScaleFiles($itemDirectory, 'item_123', $zip);

        // If we reach here without exception, test passes
        $this->assertTrue(true);
    }

    /**
     * Test hasScaleFiles returns false when directory doesn't exist
     */
    public function testHasScaleFilesReturnsFalseWhenDirectoryDoesNotExist(): void
    {
        $itemDirectory = $this->createMock(Directory::class);
        $scalesDir = $this->createMock(Directory::class);

        $itemDirectory->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scalesDir);

        $scalesDir->expects($this->once())
            ->method('exists')
            ->willReturn(false);

        $result = $this->service->hasScaleFiles($itemDirectory);

        $this->assertFalse($result);
    }

    /**
     * Test hasScaleFiles returns true when valid JSON files exist
     */
    public function testHasScaleFilesReturnsTrueWhenJsonFilesExist(): void
    {
        $itemDirectory = $this->createMock(Directory::class);
        $scalesDir = $this->createMock(Directory::class);

        $file = $this->createMockFile('OUTCOME_1.json', '{"scale":{"uri":"test"}}');

        $itemDirectory->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scalesDir);

        $scalesDir->expects($this->once())
            ->method('exists')
            ->willReturn(true);

        $scalesDir->expects($this->once())
            ->method('getFlyIterator')
            ->with(Directory::ITERATOR_FILE)
            ->willReturn(new \ArrayIterator([$file]));

        $result = $this->service->hasScaleFiles($itemDirectory);

        $this->assertTrue($result);
    }

    /**
     * Test hasScaleFiles returns false when only non-JSON files exist
     */
    public function testHasScaleFilesReturnsFalseWhenOnlyNonJsonFilesExist(): void
    {
        $itemDirectory = $this->createMock(Directory::class);
        $scalesDir = $this->createMock(Directory::class);

        $txtFile = $this->createMockFile('readme.txt', 'text');

        $itemDirectory->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scalesDir);

        $scalesDir->expects($this->once())
            ->method('exists')
            ->willReturn(true);

        $scalesDir->expects($this->once())
            ->method('getFlyIterator')
            ->with(Directory::ITERATOR_FILE)
            ->willReturn(new \ArrayIterator([$txtFile]));

        $result = $this->service->hasScaleFiles($itemDirectory);

        $this->assertFalse($result);
    }

    /**
     * Test hasScaleFiles returns false when directory is empty
     */
    public function testHasScaleFilesReturnsFalseWhenDirectoryIsEmpty(): void
    {
        $itemDirectory = $this->createMock(Directory::class);
        $scalesDir = $this->createMock(Directory::class);

        $itemDirectory->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scalesDir);

        $scalesDir->expects($this->once())
            ->method('exists')
            ->willReturn(true);

        $scalesDir->expects($this->once())
            ->method('getFlyIterator')
            ->with(Directory::ITERATOR_FILE)
            ->willReturn(new \ArrayIterator([]));

        $result = $this->service->hasScaleFiles($itemDirectory);

        $this->assertFalse($result);
    }

    /**
     * Test hasScaleFiles handles exceptions gracefully
     */
    public function testHasScaleFilesHandlesExceptionsGracefully(): void
    {
        $itemDirectory = $this->createMock(Directory::class);
        $scalesDir = $this->createMock(Directory::class);

        $itemDirectory->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scalesDir);

        $scalesDir->expects($this->once())
            ->method('exists')
            ->willReturn(true);

        $scalesDir->expects($this->once())
            ->method('getFlyIterator')
            ->willThrowException(new \Exception('Filesystem error'));

        $result = $this->service->hasScaleFiles($itemDirectory);

        $this->assertFalse($result);
    }

    /**
     * Test that exportScaleFiles handles general exceptions without breaking item export
     */
    public function testExportScaleFilesHandlesGeneralExceptionsGracefully(): void
    {
        $itemDirectory = $this->createMock(Directory::class);
        $zip = $this->createMock(ZipArchive::class);

        $itemDirectory->expects($this->once())
            ->method('getDirectory')
            ->willThrowException(new \Exception('Directory access error'));

        // Should not throw - just log and continue
        $this->service->exportScaleFiles($itemDirectory, 'item_123', $zip);

        // If we reach here without exception, test passes
        $this->assertTrue(true);
    }

    /**
     * Test correct path construction for scale files
     */
    public function testExportScaleFilesConstructsCorrectPaths(): void
    {
        $itemDirectory = $this->createMock(Directory::class);
        $scalesDir = $this->createMock(Directory::class);
        $zip = $this->createMock(ZipArchive::class);

        $file = $this->createMockFile('OUTCOME_SCORE.json', '{"scale":{}}');

        $itemDirectory->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scalesDir);

        $scalesDir->expects($this->once())
            ->method('exists')
            ->willReturn(true);

        $scalesDir->expects($this->once())
            ->method('getFlyIterator')
            ->willReturn(new \ArrayIterator([$file]));

        // Verify the path is constructed as: basePath/scales/filename.json
        $zip->expects($this->once())
            ->method('addFromString')
            ->with('items/item_abc123/scales/OUTCOME_SCORE.json', '{"scale":{}}')
            ->willReturn(true);

        $this->service->exportScaleFiles($itemDirectory, 'items/item_abc123', $zip);
    }

    /**
     * Helper method to create a mock File with basename and read() support
     */
    private function createMockFile(string $basename, string $content): MockObject
    {
        $file = $this->createMock(File::class);
        $file->expects($this->any())
            ->method('getBasename')
            ->willReturn($basename);
        $file->expects($this->any())
            ->method('read')
            ->willReturn($content);

        return $file;
    }
}

