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
use oat\tao\model\resources\relation\FindAllQuery;
use oat\tao\model\resources\relation\service\ResourceRelationServiceInterface;
use oat\tao\model\resources\relation\service\ResourceRelationServiceProxy;
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
 * php index.php '\oat\taoQtiItem\scripts\cli\DeleteItems' -class uri_of_the_class --ignore-class "https://example.com/class1,https://example.com/class2"
 *
 * By default, runs in dry-run mode (shows what would be deleted)
 * Use --wet-run to actually perform the deletion
 * Use --verbose to show detailed directory information
 * Use --silent to show only progress bar and a short numeric summary at the end
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

    /** @var array<int, array{uri: string, label: string, reason: string}> Items skipped due to relations (e.g. used in tests) */
    private array $skippedItemsLog = [];

    /** @var array<string, true> Set of class URIs to ignore (including subclasses); item belongs to one of these => skip deletion */
    private array $ignoredClassUris = [];

    /** @var bool Silent mode: only progress bar and numeric summary */
    private bool $isSilent = false;

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
            ],
            'ignore-class' => [
                'prefix' => 'i',
                'longPrefix' => 'ignore-class',
                'description' => 'Comma-separated class URIs to ignore: items and subclasses inside these classes are not deleted',
                'required' => false
            ],
            'silent' => [
                'prefix' => 's',
                'flag' => true,
                'longPrefix' => 'silent',
                'description' => 'Only show progress bar and a short numeric summary at the end',
                'required' => false,
                'default' => false
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
        // Default is dry-run; OptionContainer does not apply defaults for flags when absent (both return null)
        $dryRunFlag = $this->getOption('dry-run') ?? true;
        $wetRunFlag = $this->getOption('wet-run') ?? false;
        $isDryRun = $dryRunFlag && !$wetRunFlag;
        $runType = $isDryRun ? 'DRY RUN' : 'WET RUN';
        $this->isSilent = (bool) ($this->getOption('silent') ?? false);

        $this->report = Report::createInfo("Starting {$runType} deletion of items");
        $this->echoUnlessSilent("=== {$runType} MODE ===\n");

        $user = new \core_kernel_users_GenerisUser(
            $this->getResource('https://backoffice.ngs.test/ontologies/tao.rdf#superUser')
        );
        $session = new \common_session_RestSession(
            $user
        );
        common_session_SessionManager::startSession($session);

        $this->buildIgnoredClassUris();

        if ($this->getOption('uri')) {
            $this->deleteSingleItem($this->getOption('uri'), $isDryRun);
        } elseif ($this->getOption('class')) {
            $this->deleteClassItems($this->getOption('class'), $isDryRun);
        } else {
            echo "Error: Either --uri or --class parameter must be provided.\n";
            return $this->report;
        }

        $this->echoUnlessSilent($isDryRun
            ? "\n🎯 === DRY RUN COMPLETE ===\n💡 To actually perform the deletion, run with --wet-run flag\n"
            : "\n✅ === DELETION COMPLETE ===\n");

        // Display summary report (compact in silent mode)
        $this->displaySummaryReport($isDryRun);

        // Display and persist skipped items log (skip console output in silent mode; file still written)
        $this->displaySkippedItemsLog();

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
        $this->echoUnlessSilent("Deleting single item: {$itemLabel} ({$itemUri})\n");

        // Show progress for single item
        $this->updateProgressBar(1, 1, $itemLabel, $isDryRun);

        // Process the item
        $processed = $this->processItem($instance, $isDryRun);

        // Complete the progress bar (always newline so summary appears on next line)
        $this->updateProgressBar(1, 1, "COMPLETED", $isDryRun);
        echo "\n";

        if ($processed) {
            $this->echoUnlessSilent("✓ " . ($isDryRun ? "[DRY RUN] Would delete this item" : "Item deleted successfully") . "\n");
            $this->itemsProcessed++;
        }
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

        $this->echoUnlessSilent("Found {$totalItems} items in class: {$classUri}\n");

        if ($totalItems === 0) {
            $this->echoUnlessSilent("No items found to delete.\n");
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

            // Process the item (skipped if used in tests)
            if ($this->processItem($instance, $isDryRun)) {
                $this->itemsProcessed++;
            }
        }

        // Complete the progress bar with final status (always newline so summary appears on next line)
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

    /** @return ResourceRelationServiceInterface */
    private function getResourceRelationService(): ResourceRelationServiceInterface
    {
        $service = $this->getServiceManager()->get(ResourceRelationServiceProxy::SERVICE_ID);
        assert($service instanceof ResourceRelationServiceInterface);
        return $service;
    }

    /**
     * Build the set of class URIs to ignore (each given class + all its subclasses).
     * Option --ignore-class accepts comma-separated class URIs.
     */
    private function buildIgnoredClassUris(): void
    {
        $value = $this->getOption('ignore-class');
        if ($value === null || $value === '') {
            return;
        }
        $uris = array_map('trim', explode(',', (string) $value));
        foreach ($uris as $classUri) {
            if ($classUri === '') {
                continue;
            }
            // Normalize shell-escaped hash (e.g. ...tao.rdf\#id -> ...tao.rdf#id)
            $classUri = str_replace('\\#', '#', $classUri);
            $class = $this->getClass($classUri);
            if (!$class->exists()) {
                $this->echoUnlessSilent("Warning: Ignore-class URI does not exist, skipping: {$classUri}\n");
                continue;
            }
            $this->ignoredClassUris[$class->getUri()] = true;
            foreach ($class->getSubClasses(true) as $subClass) {
                $this->ignoredClassUris[$subClass->getUri()] = true;
            }
        }
        if (!empty($this->ignoredClassUris)) {
            $this->echoUnlessSilent("Ignoring " . count($this->ignoredClassUris) . " class(es) (including subclasses).\n");
        }
    }

    private function echoUnlessSilent(string $msg): void
    {
        if (!$this->isSilent) {
            echo $msg;
        }
    }

    /**
     * Check whether the item belongs to any ignored class (or subclass of an ignored class).
     */
    private function isItemInIgnoredClass(core_kernel_classes_Resource $instance): bool
    {
        if (empty($this->ignoredClassUris)) {
            return false;
        }
        foreach ($instance->getTypes() as $type) {
            if (isset($this->ignoredClassUris[$type->getUri()])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Process a single item (deletion logic with optional verbose output).
     * Skips deletion if the item has relations in tests (same check as ResourceRelations action).
     *
     * @param core_kernel_classes_Resource $instance Item instance
     * @param bool $isDryRun Whether this is a dry run
     * @return bool True if the item was processed (deleted or would be deleted), false if skipped (e.g. used in tests)
     */
    private function processItem(core_kernel_classes_Resource $instance, bool $isDryRun): bool
    {
        if ($this->isItemInIgnoredClass($instance)) {
            $uri = $instance->getUri();
            $label = $instance->getLabel();
            $reason = 'Class is in ignored list';
            $this->skippedItemsLog[] = ['uri' => $uri, 'label' => $label, 'reason' => $reason];
            $this->echoUnlessSilent("⚠ Skipped: Item \"{$label}\" ({$uri}) – {$reason}\n");
            //$this->report->add(Report::createWarning("Item \"{$label}\" ({$uri}) skipped: {$reason}"));
            return false;
        }

        $testRelations = $this->getResourceRelationService()->findRelations(
            new FindAllQuery($instance->getUri(), null, 'test')
        );
        $relationsList = $testRelations->jsonSerialize();
        if (!empty($relationsList)) {
            $uri = $instance->getUri();
            $label = $instance->getLabel();
            $reason = 'Used in test(s)';
            $this->skippedItemsLog[] = ['uri' => $uri, 'label' => $label, 'reason' => $reason];
            $this->echoUnlessSilent("⚠ Skipped: Item \"{$label}\" ({$uri}) – {$reason}\n");
           //$this->report->add(Report::createWarning("Item \"{$label}\" ({$uri}) skipped: {$reason}"));
            return false;
        }

        try {
            if (!$isDryRun) {
                $this->itemsService->delete(new DeleteItemCommand($instance, true));
            }
        } catch (Throwable $e) {
            echo "Error: {$e->getMessage()}\n";
            return false;
        }

        return true;
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
     * Display summary report of processed items and classes.
     * In silent mode: only a single line with numbers.
     */
    private function displaySummaryReport(bool $isDryRun): void
    {
        $skipped = count($this->skippedItemsLog);
        if ($this->isSilent) {
            echo "\n";
            echo "deleted: {$this->itemsProcessed}, skipped: {$skipped}" . ($isDryRun ? " (dry run)" : "") . "\n";
            return;
        }

        $action = $isDryRun ? "would be" : "were";
        $prefix = $isDryRun ? "[DRY RUN] " : "";

        echo "\n📊 === SUMMARY REPORT ===\n";
        echo "{$prefix}{$this->itemsProcessed} item(s) {$action} deleted\n";
        if ($skipped > 0) {
            echo "{$prefix}{$skipped} item(s) ignored (relations in tests or class in ignore list)\n";
        }
        echo "========================\n";
    }

    /**
     * Output skipped items to console and write them to a dedicated log file.
     * In silent mode: only write to file, do not echo to console.
     */
    private function displaySkippedItemsLog(): void
    {
        if (empty($this->skippedItemsLog)) {
            return;
        }

        $lines = [
            '',
            '📋 === SKIPPED ITEMS LOG (deletion ignored – relations in tests or class in ignore list) ===',
            sprintf('Total: %d item(s)', count($this->skippedItemsLog)),
            '',
        ];
        foreach ($this->skippedItemsLog as $entry) {
            $lines[] = sprintf(
                "  - %s | %s | %s",
                $entry['uri'],
                $entry['label'],
                $entry['reason']
            );
        }
        $lines[] = '========================================================================';
        $logContent = implode("\n", $lines);

        $this->echoUnlessSilent($logContent . "\n");

        $logFile = getcwd() . DIRECTORY_SEPARATOR . 'delete_items_skipped_' . date('Y-m-d_His') . '.log';
        if (@file_put_contents($logFile, $logContent) !== false) {
            $this->echoUnlessSilent("\nSkipped items log written to: {$logFile}\n");
        }
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
