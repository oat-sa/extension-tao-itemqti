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

namespace oat\taoQtiItem\model\Export;

use oat\oatbox\filesystem\Directory;
use RuntimeException;
use ZipArchive;

/**
 * Service responsible for exporting scale files from items to ZIP archives
 */
class ScaleExportService
{
    private const SCALES_DIRECTORY = 'scales';
    private const JSON_EXTENSION = 'json';

    /**
     * Export scale files from item directory to ZIP archive
     *
     * @param Directory $itemDirectory The item's storage directory
     * @param string $basePath The base path in the ZIP for this item
     * @param ZipArchive $zip The ZIP archive to add files to
     * @return void
     * @throws RuntimeException If a critical scale export error occurs
     */
    public function exportScaleFiles(Directory $itemDirectory, string $basePath, ZipArchive $zip): void
    {
        try {
            $scalesDir = $this->getExistingScalesDirectory($itemDirectory);
            if ($scalesDir === null) {
                return;
            }

            $this->exportScaleFilesFromDirectory($scalesDir, $basePath, $zip);
        } catch (\Exception $e) {
            \common_Logger::w('Could not export scale files: ' . $e->getMessage());
            // Don't throw - scale export failure shouldn't break item export
        }
    }

    /**
     * Export scale files from a specific scales directory
     *
     * @param Directory $scalesDir The scales directory
     * @param string $basePath The base path in the ZIP
     * @param ZipArchive $zip The ZIP archive
     * @return int Number of files exported
     * @throws RuntimeException If a critical error occurs
     */
    private function exportScaleFilesFromDirectory(Directory $scalesDir, string $basePath, ZipArchive $zip): int
    {
        $iterator = $scalesDir->getFlyIterator(Directory::ITERATOR_FILE);
        $exportedCount = 0;

        foreach ($iterator as $file) {
            if (!$this->isValidScaleFile($file->getBasename())) {
                \common_Logger::w('Skipping non-JSON file in scales directory: ' . $file->getBasename());
                continue;
            }

            $relativePath = self::SCALES_DIRECTORY . '/' . $file->getBasename();
            $scaleFilePath = $basePath . '/' . $relativePath;

            try {
                $content = $file->read();
                if ($zip->addFromString($scaleFilePath, $content) === false) {
                    throw new RuntimeException('Failed to add scale file to ZIP archive: ' . $scaleFilePath);
                }

                \common_Logger::t('SCALE FILE AT: ' . $scaleFilePath);
                $exportedCount++;
            } catch (\Exception $e) {
                \common_Logger::e('Failed to export scale file: ' . $file->getBasename() . ' - ' . $e->getMessage());
                throw new RuntimeException('Scale file export failed: ' . $file->getBasename(), 0, $e);
            }
        }

        return $exportedCount;
    }

    /**
     * Validate if a file is a valid scale file (JSON)
     *
     * @param string $filename The filename to validate
     * @return bool True if valid, false otherwise
     */
    private function isValidScaleFile(string $filename): bool
    {
        return pathinfo($filename, PATHINFO_EXTENSION) === self::JSON_EXTENSION;
    }

    /**
     * Check if an item has scale files
     *
     * @param Directory $itemDirectory The item's storage directory
     * @return bool True if the item has scale files, false otherwise
     */
    public function hasScaleFiles(Directory $itemDirectory): bool
    {
        try {
            $scalesDir = $this->getExistingScalesDirectory($itemDirectory);
            if ($scalesDir === null) {
                return false;
            }

            $iterator = $scalesDir->getFlyIterator(Directory::ITERATOR_FILE);
            foreach ($iterator as $file) {
                if ($this->isValidScaleFile($file->getBasename())) {
                    return true;
                }
            }

            return false;
        } catch (\Exception $e) {
            \common_Logger::w('Could not check for scale files: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Retrieve the scales directory only when it exists on disk
     */
    private function getExistingScalesDirectory(Directory $itemDirectory): ?Directory
    {
        $scalesDir = $itemDirectory->getDirectory(self::SCALES_DIRECTORY);

        return $scalesDir->exists() ? $scalesDir : null;
    }
}
