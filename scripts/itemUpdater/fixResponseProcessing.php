<?php
/*
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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 *
 */

namespace oat\taoQtiItem\scripts\itemUpdater;

use \FilesystemIterator;
use \RecursiveIteratorIterator;
use \RecursiveDirectoryIterator;

require_once dirname(__FILE__).'/../../../tao/includes/raw_start.php';

// README:
// dry run by default:
//      php taoQtiItem/scripts/itemUpdater/fixResponseProcessing.php
// add "pray" for a no-dry run:
//      php taoQtiItem/scripts/itemUpdater/fixResponseProcessing.php pray


/**
 * @author Christophe Noël
 */
const BACKUP_DIR = __DIR__ . '/backup';
define("DRY_RUN", isDryRun($argv));

$stats = ['qtiFiles' => 0, 'broken' => 0, 'errors' => 0];

$directory      = __DIR__ . "/../../../data/taoItems/itemData/i145408150933711260";
$directoryItr   = new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS);

echo "\n";
foreach(new RecursiveIteratorIterator($directoryItr) as $file) {
    if ($file->getFilename() === "qti.xml") {
        try {
            $stats['qtiFiles']++;

            echo "\n" . $file->getPathname() . " ";

            $responseProcessingUpdater = new ResponseProcessingUpdater($file->getPathname());

            if ($responseProcessingUpdater->isBroken()) {
                $stats['broken']++;
                echo "broken... ";
                backupFile($file->getPathname());
                echo "backup... ";
                replaceFile($file->getPathname(), $responseProcessingUpdater->getFixedXml());
                echo "fix !";
            } else {
                echo "ok";
            }
        } catch (\Exception $e) {
            $stats['errors']++;
            echo "\n\n !!! ERROR: " . $e->getMessage() . "\n\n";
            echo "\n\n " . $e->getTraceAsString() . "\n\n";
        }
    }
}
echo "\n\n================================= ";
echo "\n" . $stats['qtiFiles'] . " qti.xml files analysed";
echo "\n" . $stats['broken'] . " modified";
echo "\n" . $stats['errors'] . " errors";
echo "\n================================= \n\n";

function isDryRun($argv) {
    if (isset($argv[1]) && $argv[1] == "pray") {
        return false;
    }
    return true;
}

function backupFile($pathname) {
    $sourceFile     = new \SplFileInfo($pathname);
    $path           = explode('/', $sourceFile->getPath());
    $itemDataIndex  = array_search('itemData', $path);
    $backupPath     = BACKUP_DIR . '/' . implode('/', array_slice($path, $itemDataIndex));
    if (!is_dir($backupPath)) {
        if (!mkdir($backupPath, null, true)) {
            throw new \common_Exception('cannot create backup directory ' . $backupPath);
        }
    }
    if (!copy($sourceFile->getPathname(), $backupPath . '/' . $sourceFile->getFilename())) {
        throw new \common_Exception('cannot backup file ' . $sourceFile->getPathname());
    };
}

function replaceFile($pathname, $content) {
    if (!DRY_RUN) {
        if (file_put_contents($pathname, $content) === false) {
            throw new \common_Exception('couldn\'t correct file ' . $pathname);
        }
    }
}
