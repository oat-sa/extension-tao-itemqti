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

namespace oat\taoQtiItem\model\qti\scale;

use JsonException;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\File;
use oat\oatbox\service\ConfigurableService;
use taoItems_models_classes_ItemsService;
use core_kernel_classes_Resource;

class ScaleStorageService extends ConfigurableService
{
    public const SCALES_DIRECTORY = 'scales';

    private taoItems_models_classes_ItemsService $itemsService;

    public function __construct(?taoItems_models_classes_ItemsService $itemsService = null)
    {
        parent::__construct();
        $this->itemsService = $itemsService ?? taoItems_models_classes_ItemsService::singleton();
    }

    /**
     * Persist scale metadata for the provided item.
     *
     * @throws JsonException
     */
    public function storeScaleData(
        core_kernel_classes_Resource $item,
        string $relativePath,
        array $payload
    ): string {
        $path = $this->sanitizeRelativePath($relativePath);
        if (!$this->isScalePath($path)) {
            $path = $this->generateRelativePath($path);
        }

        $directory = $this->ensureScalesDirectory($item, $path);
        $fileName = basename($path);
        $file = $directory->getFile($fileName);

        $file->put($this->encodePayload($payload));

        return $path;
    }

    public function deleteScale(core_kernel_classes_Resource $item, string $relativePath): void
    {
        if (!$this->isScalePath($relativePath)) {
            return;
        }

        $path = $this->sanitizeRelativePath($relativePath);
        $directory = $this->ensureScalesDirectory($item, $path);
        $file = $directory->getFile(basename($path));

        if ($file->exists()) {
            $file->delete();
        }
    }

    /**
     * Remove stored scales that are not part of the provided keep list for the given item.
     *
     * @param core_kernel_classes_Resource $item Item whose scales are being inspected.
     * @param string[] $keepRelativePaths Relative scale paths that must remain on disk.
     *
     * @return void
     */
    public function cleanupScales(core_kernel_classes_Resource $item, array $keepRelativePaths): void
    {
        $keep = array_filter(array_map([$this, 'sanitizeRelativePath'], array_filter($keepRelativePaths)));
        $directory = $this->getScalesDirectory($item);

        if (!$directory->exists()) {
            return;
        }

        foreach ($directory->getIterator() as $entry) {
            if ($entry instanceof Directory) {
                continue;
            }

            if (!$entry instanceof File) {
                continue;
            }

            $relative = sprintf('%s/%s', self::SCALES_DIRECTORY, $entry->getBasename());
            if (!in_array($relative, $keep, true)) {
                $entry->delete();
            }
        }
    }

    /**
     * Get existing item scales from the item's scales directory
     *
     * @param core_kernel_classes_Resource $item
     * @return array Array of existing scales indexed by relative path
     */
    public function getItemScales(core_kernel_classes_Resource $item): array
    {
        $scalesDir = $this->getScalesDirectory($item);

        if (!$scalesDir->exists()) {
            return [];
        }

        $scales = [];

        foreach ($scalesDir->getIterator() as $file) {
            if (!$file instanceof File) {
                continue;
            }

            if ($file->getMimeType() === 'application/json') {
                try {
                    $content = $file->read();
                    $scaleData = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
                    $scales[sprintf('scales/%s', $file->getBasename())] = $scaleData;
                } catch (JsonException $e) {
                    // Skip files that cannot be decoded
                    continue;
                }
            }
        }

        return $scales;
    }

    /**
     * Generate a relative path for a scale JSON file from a given identifier or path seed.
     * The result is placed under the "scales" directory and suffixed with a short hash for uniqueness.
     *
     * @param string $identifierOrPath The scale identifier or seed string used to build the file name.
     * @return string The generated relative path to the scale file (e.g., "scales/foo_abcdef12.json").
     */
    public function generateRelativePath(string $identifierOrPath): string
    {
        $baseName = preg_replace('/[^a-zA-Z0-9_-]+/', '_', $identifierOrPath);
        $baseName = trim($baseName, '_');

        if ($baseName === '') {
            $baseName = 'scale';
        }

        return sprintf(
            '%s/%s_%s.json',
            self::SCALES_DIRECTORY,
            strtolower($baseName),
            substr(sha1(uniqid((string)mt_rand(), true)), 0, 8)
        );
    }

    /**
     * Check whether the provided value denotes a valid scale JSON relative path.
     * A valid path starts with "scales/" and has a ".json" extension.
     *
     * @param string|null $value The relative path to validate; null values are considered invalid.
     * @return bool True if the path matches the expected "scales/*.json" pattern, false otherwise.
     */
    public function isScalePath(?string $value): bool
    {
        if ($value === null) {
            return false;
        }

        $path = $this->sanitizeRelativePath($value);

        return strpos($path, self::SCALES_DIRECTORY . '/') === 0 && substr($path, -5) === '.json';
    }

    private function encodePayload(array $payload): string
    {
        return json_encode(
            $payload,
            JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
        );
    }

    private function ensureScalesDirectory(core_kernel_classes_Resource $item, string $relativePath): Directory
    {
        $directory = $this->getScalesDirectory($item);

        if (!$directory->exists()) {
            $directory->getFileSystem()->createDirectory($directory->getPrefix());
        }

        $subPath = trim(substr(dirname($relativePath), strlen(self::SCALES_DIRECTORY)), '/');
        if ($subPath !== '' && $subPath !== '.') {
            $subDirectory = $directory->getDirectory($subPath);
            if (!$subDirectory->exists()) {
                $subDirectory->getFileSystem()->createDirectory($subDirectory->getPrefix());
            }
            return $subDirectory;
        }

        return $directory;
    }

    private function getScalesDirectory(core_kernel_classes_Resource $item): Directory
    {
        return $this
            ->itemsService
            ->getItemDirectory($item)
            ->getDirectory(self::SCALES_DIRECTORY);
    }

    private function sanitizeRelativePath(string $path): string
    {
        $normalized = trim($path);
        $normalized = str_replace('\\', '/', $normalized);

        $segments = explode('/', $normalized);
        $sanitized = [];

        foreach ($segments as $segment) {
            if ($segment === '' || $segment === '.') {
                continue;
            }

            if ($segment === '..') {
                array_pop($sanitized);
                continue;
            }

            $sanitized[] = $segment;
        }

        return implode('/', $sanitized);
    }
}
