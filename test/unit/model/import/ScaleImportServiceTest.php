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

namespace oat\taoQtiItem\test\unit\model\import;

use core_kernel_classes_Resource;
use oat\generis\test\TestCase;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\File;
use oat\taoQtiItem\model\import\ScaleImportService;
use PHPUnit\Framework\MockObject\MockObject;
use taoItems_models_classes_ItemsService;

class ScaleImportServiceTest extends TestCase
{
    private ScaleImportService $service;
    private string $tempDir;
    /** @var MockObject|taoItems_models_classes_ItemsService */
    private $itemsService;

    public function setUp(): void
    {
        parent::setUp();
        $this->itemsService = $this->createMock(taoItems_models_classes_ItemsService::class);
        $this->service = new ScaleImportService($this->itemsService);
        $this->tempDir = sys_get_temp_dir() . '/scale_import_test_' . uniqid();
        mkdir($this->tempDir);
    }

    public function tearDown(): void
    {
        parent::tearDown();
        if (is_dir($this->tempDir)) {
            $this->removeDirectory($this->tempDir);
        }
    }

    /**
     * Test that importScaleFiles does nothing when scales directory doesn't exist
     */
    public function testImportScaleFilesReturnsEarlyWhenScalesDirectoryDoesNotExist(): void
    {
        $rdfItem = $this->createMock(core_kernel_classes_Resource::class);
        $rdfItem->method('getUri')->willReturn('http://test.item.uri');

        $nonExistentPath = $this->tempDir . '/non_existent_scales';

        // ItemsService should never be called since directory doesn't exist
        $this->itemsService->expects($this->never())
            ->method('getItemDirectory');

        // Should not throw, just return silently
        $this->service->importScaleFiles($nonExistentPath, $rdfItem, 'test_item_1');
    }

    /**
     * Test that importScaleFiles imports valid JSON files with mocked ItemsService
     */
    public function testImportScaleFilesImportsValidJsonFiles(): void
    {
        $packageScalesPath = $this->tempDir . '/package_scales';
        mkdir($packageScalesPath);

        // Create test JSON files
        file_put_contents(
            $packageScalesPath . '/OUTCOME_1.json',
            json_encode(['scale' => ['uri' => 'test_scale_1']])
        );
        file_put_contents(
            $packageScalesPath . '/OUTCOME_2.json',
            json_encode(['scale' => ['uri' => 'test_scale_2']])
        );

        $rdfItem = $this->createMock(core_kernel_classes_Resource::class);
        $itemDirectory = $this->createMock(Directory::class);
        $scalesDir = $this->createMock(Directory::class);

        $this->itemsService->expects($this->once())
            ->method('getItemDirectory')
            ->with($rdfItem)
            ->willReturn($itemDirectory);

        $itemDirectory->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scalesDir);

        $file1 = $this->createMock(File::class);
        $file2 = $this->createMock(File::class);

        $scalesDir->expects($this->exactly(2))
            ->method('getFile')
            ->willReturnCallback(function ($fileName) use ($file1, $file2) {
                return $fileName === 'OUTCOME_1.json' ? $file1 : $file2;
            });

        $file1->expects($this->once())
            ->method('put')
            ->with($this->stringContains('test_scale_1'));

        $file2->expects($this->once())
            ->method('put')
            ->with($this->stringContains('test_scale_2'));

        $this->service->importScaleFiles($packageScalesPath, $rdfItem, 'test_item_1');
    }

    /**
     * Test that non-JSON files are skipped
     */
    public function testImportScaleFilesSkipsNonJsonFiles(): void
    {
        $packageScalesPath = $this->tempDir . '/package_scales';
        mkdir($packageScalesPath);

        // Create a mix of files
        file_put_contents($packageScalesPath . '/OUTCOME_1.json', json_encode(['scale' => ['uri' => 'test_scale_1']]));
        file_put_contents($packageScalesPath . '/readme.txt', 'text');

        $rdfItem = $this->createMock(core_kernel_classes_Resource::class);
        $itemDirectory = $this->createMock(Directory::class);
        $scalesDir = $this->createMock(Directory::class);

        $this->itemsService->expects($this->once())
            ->method('getItemDirectory')
            ->with($rdfItem)
            ->willReturn($itemDirectory);

        $itemDirectory->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scalesDir);

        $jsonFile = $this->createMock(File::class);

        $scalesDir->expects($this->once())
            ->method('getFile')
            ->with('OUTCOME_1.json')
            ->willReturn($jsonFile);

        // Only JSON file should be written
        $jsonFile->expects($this->once())
            ->method('put')
            ->with($this->stringContains('test_scale_1'));

        $this->service->importScaleFiles($packageScalesPath, $rdfItem, 'test_item_1');
    }

    /**
     * Test that invalid JSON files are skipped
     */
    public function testImportScaleFilesSkipsInvalidJsonFiles(): void
    {
        $packageScalesPath = $this->tempDir . '/package_scales';
        mkdir($packageScalesPath);

        // Create invalid JSON file
        file_put_contents($packageScalesPath . '/OUTCOME_1.json', '{invalid json');

        $rdfItem = $this->createMock(core_kernel_classes_Resource::class);
        $itemDirectory = $this->createMock(Directory::class);
        $scalesDir = $this->createMock(Directory::class);

        $this->itemsService->expects($this->once())
            ->method('getItemDirectory')
            ->with($rdfItem)
            ->willReturn($itemDirectory);

        $itemDirectory->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scalesDir);

        // getFile should not be called because JSON is invalid
        $scalesDir->expects($this->never())
            ->method('getFile');

        $this->service->importScaleFiles($packageScalesPath, $rdfItem, 'test_item_1');
    }

    /**
     * Test hasScaleFiles returns true when JSON files exist
     */
    public function testHasScaleFilesReturnsTrueWhenJsonFilesExist(): void
    {
        $packageScalesPath = $this->tempDir . '/package_scales';
        mkdir($packageScalesPath);

        file_put_contents($packageScalesPath . '/OUTCOME_1.json', '{"scale":{"uri":"test"}}');

        $result = $this->service->hasScaleFiles($packageScalesPath);

        $this->assertTrue($result);
    }

    /**
     * Test hasScaleFiles returns false when only non-JSON files exist
     */
    public function testHasScaleFilesReturnsFalseWhenOnlyNonJsonFilesExist(): void
    {
        $packageScalesPath = $this->tempDir . '/package_scales';
        mkdir($packageScalesPath);

        file_put_contents($packageScalesPath . '/readme.txt', 'text');
        file_put_contents($packageScalesPath . '/config.xml', '<xml/>');

        $result = $this->service->hasScaleFiles($packageScalesPath);

        $this->assertFalse($result);
    }

    /**
     * Test hasScaleFiles returns false when directory is empty
     */
    public function testHasScaleFilesReturnsFalseWhenDirectoryIsEmpty(): void
    {
        $packageScalesPath = $this->tempDir . '/empty_scales';
        mkdir($packageScalesPath);

        $result = $this->service->hasScaleFiles($packageScalesPath);

        $this->assertFalse($result);
    }

    /**
     * Test validation of JSON file extensions with mixed files
     */
    public function testHasScaleFilesValidatesFileExtensions(): void
    {
        $packageScalesPath = $this->tempDir . '/package_scales';
        mkdir($packageScalesPath);

        // Mix of files
        file_put_contents($packageScalesPath . '/OUTCOME_1.json', '{"scale":{"uri":"test"}}');
        file_put_contents($packageScalesPath . '/readme.txt', 'text');

        $result = $this->service->hasScaleFiles($packageScalesPath);

        // Should find JSON file
        $this->assertTrue($result);
    }

    /**
     * Helper method to remove a directory recursively
     */
    private function removeDirectory(string $dir): void
    {
        if (!is_dir($dir)) {
            return;
        }

        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            is_dir($path) ? $this->removeDirectory($path) : unlink($path);
        }
        rmdir($dir);
    }
}
