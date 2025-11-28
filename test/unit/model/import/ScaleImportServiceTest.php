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
use oat\taoQtiItem\model\import\ScaleImportService;
use PHPUnit\Framework\MockObject\MockObject;
use taoItems_models_classes_ItemsService;

class ScaleImportServiceTest extends TestCase
{
    private ScaleImportService $service;
    private string $tempDir;

    public function setUp(): void
    {
        parent::setUp();
        $this->service = new ScaleImportService();
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

        // Should not throw, just return silently
        $this->service->importScaleFiles($nonExistentPath, $rdfItem, 'test_item_1');
    }

    /**
     * Test that non-JSON files are skipped - using hasScaleFiles as proxy
     */
    public function testHasScaleFilesSkipsNonJsonFiles(): void
    {
        $packageScalesPath = $this->tempDir . '/package_scales';
        mkdir($packageScalesPath);

        // Create only non-JSON files
        file_put_contents($packageScalesPath . '/readme.txt', 'This is a text file');
        file_put_contents($packageScalesPath . '/config.xml', '<config></config>');

        $result = $this->service->hasScaleFiles($packageScalesPath);

        $this->assertFalse($result);
    }

    /**
     * Test hasScaleFiles returns false when directory doesn't exist
     */
    public function testHasScaleFilesReturnsFalseWhenDirectoryDoesNotExist(): void
    {
        $nonExistentPath = $this->tempDir . '/non_existent';

        $result = $this->service->hasScaleFiles($nonExistentPath);

        $this->assertFalse($result);
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
     * Test that general exceptions are handled gracefully (fail-soft)
     */
    public function testImportScaleFilesHandlesGeneralExceptionsGracefully(): void
    {
        $packageScalesPath = $this->tempDir . '/package_scales';
        mkdir($packageScalesPath);
        file_put_contents($packageScalesPath . '/test.json', '{"test":"data"}');

        $rdfItem = $this->createMock(core_kernel_classes_Resource::class);
        $rdfItem->method('getUri')->willReturn('http://test.item.uri');

        // Should not throw - just log and continue (even if ItemsService fails)
        $this->service->importScaleFiles($packageScalesPath, $rdfItem, 'test_item_1');

        $this->assertTrue(true); // If we reach here without exception, test passes
    }

    /**
     * Test validation of JSON file extensions
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

