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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiItem\scripts\cli;

use oat\generis\model\kernel\uri\UriProvider;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\extension\script\ScriptAction;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\service\ConfigurableService;
use Psr\Container\ContainerInterface;
use taoItems_models_classes_ItemsService;
use Throwable;

/**
 * Class CleanDeletedItemFiles
 *
 * Examples:
 * php index.php '\oat\taoQtiItem\scripts\cli\CleanDeletedItemFiles'
 * php index.php '\oat\taoQtiItem\scripts\cli\CleanDeletedItemFiles' --dry-run
 * php index.php '\oat\taoQtiItem\scripts\cli\CleanDeletedItemFiles' --wet-run
 * php index.php '\oat\taoQtiItem\scripts\cli\CleanDeletedItemFiles' --wet-run --verbose
 *
 * By default, runs in dry-run mode (shows what would be deleted)
 * Use --wet-run to actually perform the deletion
 * Use --verbose to show detailed directory information
 *
 * @package oat\taoQtiItem\scripts\cli
 */
class CleanDeletedItemFiles extends ScriptAction
{
    use OntologyAwareTrait;

    /** @var int Number of directories processed */
    private int $directoriesProcessed = 0;
    /** @var int Number of directories deleted */
    private int $directoriesDeleted = 0;
    /** @var int Number of directories skipped (item exists) */
    private int $directoriesSkipped = 0;

    protected function provideOptions(): array
    {
        return [
            'dry-run' => [
                'prefix' => 'd',
                'flag' => true,
                'longPrefix' => 'dry-run',
                'description' => 'Show what would be deleted without actually deleting (default behavior)',
                'required' => false,
                'default' => true
            ],
            'wet-run' => [
                'prefix' => 'w',
                'flag' => true,
                'longPrefix' => 'wet-run',
                'description' => 'Actually perform the deletion (overrides dry-run)',
                'required' => false,
                'default' => false
            ],
            'verbose' => [
                'prefix' => 'v',
                'flag' => true,
                'longPrefix' => 'verbose',
                'description' => 'Show detailed output including directory paths',
                'required' => false,
                'default' => false
            ]
        ];
    }

    protected function provideDescription(): string
    {
        return 'Clean deleted item files from the item directory';
    }

    protected function provideUsage(): string
    {
        return 'php index.php "\oat\taoQtiItem\scripts\cli\CleanDeletedItemFiles"';
    }

    public function run(): void
    {
        $isDryRun = $this->getOption('dry-run') && !$this->getOption('wet-run');
        $runType = $isDryRun ? 'DRY RUN' : 'WET RUN';

        echo "=== CLEANING DELETED ITEM FILES ({$runType}) ===\n";

        $itemTreeService = $this->getItemTreeService();
        $defaultItemDirectory = $itemTreeService->getDefaultItemDirectory();
        $iterator = $defaultItemDirectory->getIterator();

        // Count total directories first for progress tracking
        $totalDirectories = 0;
        foreach ($iterator as $itemDirectory) {
            if ($itemDirectory instanceof Directory) {
                $totalDirectories++;
            }
        }

        echo "Found {$totalDirectories} item directories to check\n";

        if ($totalDirectories === 0) {
            echo "No directories found to process.\n";
            return;
        }

        $currentDirectory = 0;
        $iterator = $defaultItemDirectory->getIterator();

        foreach ($iterator as $itemDirectory) {
            if ($itemDirectory instanceof Directory) {
                $currentDirectory++;
                $prefix = $itemDirectory->getPrefix();
                $namespace = $this->getUriProvider()->getOption('namespace');
                $uri = $namespace . $prefix;
                $item = $this->getResource($uri);

                // Update progress bar
                $this->updateProgressBar($currentDirectory, $totalDirectories, $prefix, $isDryRun);

                if ($item->exists()) {
                    $this->directoriesSkipped++;
                    continue;
                }

                // Only delete if not in dry run mode
                if (!$isDryRun) {
                    try {
                        $itemDirectory->deleteSelf();
                    } catch (Throwable $e) {
                        echo "\nError deleting directory {$prefix}: {$e->getMessage()}\n";
                        continue;
                    }
                }
                $this->directoriesDeleted++;
            }

            $this->directoriesProcessed++;
        }

        // Complete the progress bar
        $this->updateProgressBar($totalDirectories, $totalDirectories, "COMPLETED", $isDryRun);
        echo "\n";

        // Display summary report
        $this->displaySummaryReport($isDryRun);

        if ($isDryRun) {
            echo "\n🎯 === DRY RUN COMPLETE ===\n";
            echo "💡 To actually perform the deletion, run with --wet-run flag\n";
        } else {
            echo "\n✅ === CLEANUP COMPLETE ===\n";
        }
    }

    private function getItemTreeService(): taoItems_models_classes_ItemsService
    {
        return $this->getPsrContainer()->get(taoItems_models_classes_ItemsService::class);
    }

    private function getPsrContainer(): ContainerInterface
    {
        return $this->getServiceManager()->getContainer();
    }

    private function getUriProvider(): UriProvider | ConfigurableService
    {
        return $this->getPsrContainer()->get(UriProvider::class);
    }

    /**
     * Update progress bar in console
     *
     * @param int $current Current directory number
     * @param int $total Total number of directories
     * @param string $directoryPrefix Current directory prefix
     * @param bool $isDryRun Whether this is a dry run
     */
    private function updateProgressBar(int $current, int $total, string $directoryPrefix, bool $isDryRun): void
    {
        $percentage = round(($current / $total) * 100);
        $barLength = 50;
        $filledLength = (int) round(($barLength * $current) / $total);

        $bar = str_repeat('█', $filledLength) . str_repeat('░', $barLength - $filledLength);

        // Clear the line and move cursor to beginning
        echo "\r\033[K";

        // Display progress bar with status
        $status = $isDryRun ? "[DRY RUN]" : "[WET RUN]";
        printf(
            "\r[%s] %d%% (%d/%d) %s %s",
            $bar,
            $percentage,
            $current,
            $total,
            $status,
            $this->truncateString($directoryPrefix, 25)
        );

        // Flush output to ensure immediate display
        if (ob_get_level()) {
            ob_flush();
        }
        flush();
    }

    /**
     * Display summary report of processed directories
     *
     * @param bool $isDryRun Whether this was a dry run
     */
    private function displaySummaryReport(bool $isDryRun): void
    {
        $action = $isDryRun ? "would be" : "were";
        $prefix = $isDryRun ? "[DRY RUN] " : "";

        echo "\n📊 === SUMMARY REPORT ===\n";
        echo "{$prefix}{$this->directoriesProcessed} directory(ies) processed\n";
        echo "{$prefix}{$this->directoriesDeleted} directory(ies) {$action} deleted\n";
        echo "{$prefix}{$this->directoriesSkipped} directory(ies) skipped (item exists)\n";
        echo "========================\n";
    }

    /**
     * Truncate string to specified length with ellipsis
     *
     * @param string $string String to truncate
     * @param int $length Maximum length
     * @return string Truncated string
     */
    private function truncateString(string $string, int $length): string
    {
        if (strlen($string) <= $length) {
            return $string;
        }

        return substr($string, 0, $length - 3) . '...';
    }
}
