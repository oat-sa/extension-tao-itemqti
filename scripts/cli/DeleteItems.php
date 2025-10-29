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

use common_session_SessionManager;
use core_kernel_classes_Resource;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\extension\script\ScriptAction;
use oat\oatbox\reporting\Report;
use oat\taoItems\model\Command\DeleteItemCommand;
use Psr\Container\ContainerInterface;
use taoItems_models_classes_ItemsService;
use Throwable;

/**
 * Class DeleteItems
 *
 * Examples:
 * php index.php '\oat\taoQtiItem\scripts\cli\DeleteItems' -uri uri_of_the_item
 * php index.php '\oat\taoQtiItem\scripts\cli\DeleteItems' -uri uri_of_the_item --wet-run
 * php index.php '\oat\taoQtiItem\scripts\cli\DeleteItems' -class uri_of_the_class
 * php index.php '\oat\taoQtiItem\scripts\cli\DeleteItems' -class uri_of_the_class --wet-run
 * php index.php '\oat\taoQtiItem\scripts\cli\DeleteItems' -class uri_of_the_class --verbose
 *
 * By default, runs in dry-run mode (shows what would be deleted)
 * Use --wet-run to actually perform the deletion
 * Use --verbose to show detailed directory information
 *
 */

class DeleteItems extends ScriptAction
{
    use OntologyAwareTrait;

    private Report $report;

    /** @var taoItems_models_classes_ItemsService */
    private taoItems_models_classes_ItemsService $itemsService;

    /** @var int Number of items processed */
    private int $itemsProcessed = 0;

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
            ],
            'class' => [
                'prefix' => 'class',
                'longPrefix' => 'class',
                'description' => 'Class uri to delete items from',
                'required' => false
            ],
            'uri' => [
                'prefix' => 'uri',
                'longPrefix' => 'uri',
                'description' => 'Uri of the item to delete',
                'required' => false
            ]

        ];
    }

    protected function provideDescription(): string
    {
        return 'Tool to remove items from the tao';
    }

    protected function provideUsage(): array
    {
        return [
            'prefix' => 'h',
            'longPrefix' => 'help',
            'description' => 'Prints a help statement'
        ];
    }
    public function run(): Report
    {
        $isDryRun = $this->getOption('dry-run') && !$this->getOption('wet-run');
        $runType = $isDryRun ? 'DRY RUN' : 'WET RUN';

        $this->report = Report::createInfo("Starting {$runType} deletion of items");
        echo "=== {$runType} MODE ===\n";

        $user = new \core_kernel_users_GenerisUser(
            $this->getResource('https://backoffice.ngs.test/ontologies/tao.rdf#superUser')
        );
        $session = new \common_session_RestSession(
            $user
        );
        common_session_SessionManager::startSession($session);

        if ($this->getOption('uri')) {
            $this->deleteSingleItem($this->getOption('uri'), $isDryRun);
        } elseif ($this->getOption('class')) {
            $this->deleteClassItems($this->getOption('class'), $isDryRun);
        } else {
            echo "Error: Either --uri or --class parameter must be provided.\n";
            return $this->report;
        }

        if ($isDryRun) {
            echo "\n🎯 === DRY RUN COMPLETE ===\n";
            echo "💡 To actually perform the deletion, run with --wet-run flag\n";
        } else {
            echo "\n✅ === DELETION COMPLETE ===\n";
        }

        // Display summary report
        $this->displaySummaryReport($isDryRun);

        return $this->report;
    }

    /**
     * Delete a single item by URI
     *
     * @param string $itemUri URI of the item to delete
     * @param bool $isDryRun Whether this is a dry run
     */
    private function deleteSingleItem(string $itemUri, bool $isDryRun): void
    {
        $this->itemsService = $this->getItemTreeService();

        $instance = new core_kernel_classes_Resource($itemUri);

        if (!$instance->exists()) {
            echo "Error: Item with URI '{$itemUri}' does not exist.\n";
            return;
        }

        $itemLabel = $instance->getLabel();
        echo "Deleting single item: {$itemLabel} ({$itemUri})\n";

        // Show progress for single item
        $this->updateProgressBar(1, 1, $itemLabel, $isDryRun);

        // Process the item
        $this->processItem($instance, $isDryRun);

        // Complete the progress bar
        $this->updateProgressBar(1, 1, "COMPLETED", $isDryRun);
        echo "\n";

        echo "✓ " . ($isDryRun ? "[DRY RUN] Would delete this item" : "Item deleted successfully") . "\n";

        $this->itemsProcessed++;
    }

    /**
     * Delete all items in a class
     *
     * @param string $classUri URI of the class to delete items from
     * @param bool $isDryRun Whether this is a dry run
     */
    private function deleteClassItems(string $classUri, bool $isDryRun): void
    {
        $this->itemsService = $this->getItemTreeService();
        $class = $this->getClass($classUri);

        if (!$class->exists()) {
            echo "Error: Class with URI '{$classUri}' does not exist.\n";
            return;
        }
        $instances = $class->getInstances(true);
        $totalItems = count($instances);
        $currentItem = 0;

        echo "Found {$totalItems} items in class: {$classUri}\n";

        if ($totalItems === 0) {
            echo "No items found to delete.\n";
            return;
        }

        foreach ($instances as $instance) {
            if (!$instance->exists()) {
                continue;
            }

            $currentItem++;
            $itemLabel = $instance->getLabel();

            // Update progress bar and process item
            $this->updateProgressBar($currentItem, $totalItems, $itemLabel, $isDryRun);

            // Process the item
            $this->processItem($instance, $isDryRun);

            // Track items processed
            $this->itemsProcessed++;
        }

        // Complete the progress bar with final status
        $this->updateProgressBar($totalItems, $totalItems, "COMPLETED", $isDryRun);
        echo "\n";
    }

    private function getItemTreeService(): taoItems_models_classes_ItemsService
    {
        return $this->getPsrContainer()->get(taoItems_models_classes_ItemsService::class);
    }

    private function getPsrContainer(): ContainerInterface
    {
        return $this->getServiceManager()->getContainer();
    }

    /**
     * Process a single item (deletion logic with optional verbose output)
     *
     * @param core_kernel_classes_Resource $instance Item instance
     * @param bool $isDryRun Whether this is a dry run
     */
    private function processItem(core_kernel_classes_Resource $instance, bool $isDryRun): void
    {
        try {
            if (!$isDryRun) {
                $this->itemsService->delete(new DeleteItemCommand($instance, true));
            }
        } catch (Throwable $e) {
            echo "Error: {$e->getMessage()}\n";
        }
    }

    /**
     * Update progress bar in console
     *
     * @param int $current Current item number
     * @param int $total Total number of items
     * @param string $itemLabel Current item label
     * @param bool $isDryRun Whether this is a dry run
     */
    private function updateProgressBar(int $current, int $total, string $itemLabel, bool $isDryRun): void
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
            $this->truncateString($itemLabel, 25)
        );

        // Flush output to ensure immediate display
        if (ob_get_level()) {
            ob_flush();
        }
        flush();
    }

    /**
     * Display summary report of processed items and classes
     *
     * @param bool $isDryRun Whether this was a dry run
     */
    private function displaySummaryReport(bool $isDryRun): void
    {
        $action = $isDryRun ? "would be" : "were";
        $prefix = $isDryRun ? "[DRY RUN] " : "";

        echo "\n📊 === SUMMARY REPORT ===\n";
        echo "{$prefix}{$this->itemsProcessed} item(s) {$action} deleted\n";

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
