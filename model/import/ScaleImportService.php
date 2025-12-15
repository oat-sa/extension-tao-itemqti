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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\import;

use common_Logger;
use core_kernel_classes_Resource;
use Exception;
use oat\oatbox\filesystem\Directory;
use taoItems_models_classes_ItemsService;

/**
 * Service responsible for importing scale files from QTI packages to items
 */
class ScaleImportService
{
    private const SCALES_DIRECTORY = 'scales';
    private const JSON_EXTENSION = 'json';
    private const MAX_SCALE_FILE_SIZE = 1048576; // 1MB
    private taoItems_models_classes_ItemsService $itemsService;

    public function __construct(taoItems_models_classes_ItemsService $itemsService)
    {
        $this->itemsService = $itemsService;
    }

    /**
     * Import scale files from the extracted package to the item directory
     *
     * @param string $packageScalesPath Path to scales directory in extracted package
     * @param core_kernel_classes_Resource $rdfItem The item resource in the ontology
     * @param string $itemIdentifier Item identifier for logging
     * @return void
     */
    public function importScaleFiles(
        string $packageScalesPath,
        core_kernel_classes_Resource $rdfItem,
        string $itemIdentifier
    ): void {
        try {
            // Check if scales directory exists in the package
            if (!file_exists($packageScalesPath) || !is_dir($packageScalesPath)) {
                common_Logger::d("No scales directory found for item: " . $itemIdentifier);
                return;
            }

            $itemDirectory = $this->getItemDirectory($rdfItem);
            $targetScalesDir = $itemDirectory->getDirectory(self::SCALES_DIRECTORY);

            $this->copyScaleFiles($packageScalesPath, $targetScalesDir, $itemIdentifier);
        } catch (Exception $e) {
            common_Logger::w(
                sprintf(
                    'Could not import scale files for item %s: %s',
                    $itemIdentifier,
                    $e->getMessage()
                )
            );
            // Don't throw - scale import failure shouldn't break item import (fail-soft)
        }
    }

    /**
     * Copy scale files from package to item directory
     *
     * @param string $packageScalesPath Source directory path
     * @param Directory $targetScalesDir Target directory
     * @param string $itemIdentifier Item identifier for logging
     * @return void
     */
    private function copyScaleFiles(
        string $packageScalesPath,
        Directory $targetScalesDir,
        string $itemIdentifier
    ): void {
        $scaleFiles = scandir($packageScalesPath);

        if ($scaleFiles === false) {
            $lastError = error_get_last();
            common_Logger::e(
                sprintf(
                    'Could not read scales directory "%s" for item %s%s',
                    $packageScalesPath,
                    $itemIdentifier,
                    $lastError && isset($lastError['message']) ? ' - ' . $lastError['message'] : ''
                )
            );
            return;
        }

        foreach ($scaleFiles as $fileName) {
            if ($fileName === '.' || $fileName === '..') {
                continue;
            }

            $sourceFilePath = $packageScalesPath . '/' . $fileName;

            if (!$this->isValidScaleFile($sourceFilePath, $fileName)) {
                continue;
            }

            try {
                $this->importSingleScaleFile($sourceFilePath, $fileName, $targetScalesDir, $itemIdentifier);
            } catch (\Exception $e) {
                common_Logger::e(
                    sprintf(
                        'Failed to import scale file %s: %s',
                        $fileName,
                        $e->getMessage()
                    )
                );
                // Continue with other files - don't fail the entire import
            }
        }
    }

    /**
     * Validate if a file is a valid scale file
     *
     * @param string $filePath Full path to the file
     * @param string $fileName Name of the file
     * @return bool True if valid, false otherwise
     */
    private function isValidScaleFile(string $filePath, string $fileName): bool
    {
        // Only import JSON files
        if (pathinfo($fileName, PATHINFO_EXTENSION) !== self::JSON_EXTENSION) {
            common_Logger::w('Skipping non-JSON file in scales directory: ' . $fileName);
            return false;
        }

        // Reject file names with unexpected characters to avoid traversal or hidden files
        if (!preg_match('/^[a-zA-Z0-9_.-]+$/', $fileName)) {
            common_Logger::w('Skipping scale file with invalid name: ' . $fileName);
            return false;
        }

        if (!is_file($filePath)) {
            return false;
        }

        return true;
    }

    /**
     * Import a single scale file
     *
     * @param string $sourceFilePath Source file path
     * @param string $fileName File name
     * @param Directory $targetScalesDir Target directory
     * @param string $itemIdentifier Item identifier for logging
     * @return void
     * @throws Exception If file operation fails
     */
    private function importSingleScaleFile(
        string $sourceFilePath,
        string $fileName,
        Directory $targetScalesDir,
        string $itemIdentifier
    ): void {
        $fileSize = filesize($sourceFilePath);
        if ($fileSize === false) {
            throw new Exception('Could not determine file size');
        }

        if ($fileSize > self::MAX_SCALE_FILE_SIZE) {
            common_Logger::w(
                sprintf(
                    'Scale file too large (%d bytes, max %d): %s',
                    $fileSize,
                    self::MAX_SCALE_FILE_SIZE,
                    $fileName
                )
            );
            return;
        }

        // Read the scale file content
        $content = file_get_contents($sourceFilePath);

        if ($content === false) {
            throw new Exception('Failed to read file');
        }

        // Validate JSON
        json_decode($content);
        if (json_last_error() !== JSON_ERROR_NONE) {
            common_Logger::w('Invalid JSON in scale file: ' . $fileName);
            return;
        }

        // Write to the item's scales directory
        $targetFile = $targetScalesDir->getFile($fileName);
        $targetFile->put($content);

        common_Logger::d(
            sprintf(
                'Imported scale file: %s for item: %s',
                $fileName,
                $itemIdentifier
            )
        );
    }

    /**
     * Get the item directory
     *
     * @param core_kernel_classes_Resource $rdfItem The item resource
     * @return Directory The item directory
     */
    private function getItemDirectory(core_kernel_classes_Resource $rdfItem): Directory
    {

        return $this->itemsService->getItemDirectory($rdfItem);
    }

    /**
     * Check if an item package has scale files
     *
     * @param string $packageScalesPath Path to scales directory in extracted package
     * @return bool True if scale files exist, false otherwise
     */
    public function hasScaleFiles(string $packageScalesPath): bool
    {
        try {
            if (!file_exists($packageScalesPath) || !is_dir($packageScalesPath)) {
                return false;
            }

            $scaleFiles = scandir($packageScalesPath);

            if ($scaleFiles === false) {
                $lastError = error_get_last();
                \common_Logger::w(
                    sprintf(
                        'Could not list scales directory "%s"%s',
                        $packageScalesPath,
                        $lastError && isset($lastError['message']) ? ' - ' . $lastError['message'] : ''
                    )
                );
                return false;
            }

            foreach ($scaleFiles as $fileName) {
                if ($fileName === '.' || $fileName === '..') {
                    continue;
                }

                if (pathinfo($fileName, PATHINFO_EXTENSION) === self::JSON_EXTENSION) {
                    return true;
                }
            }

            return false;
        } catch (\Exception $e) {
            \common_Logger::w('Could not check for scale files: ' . $e->getMessage());
            return false;
        }
    }
}
