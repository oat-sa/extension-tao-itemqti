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


/**
 * @author Christophe Noël
 */
Class itemUpdaterRunner {
    private $itemUpdaterType;
    private $itemDirectory;
    private $backupDirectory;
    private $argv;

    /**
     * @param string $itemUpdaterType : referenced in the factory
     * @param string $itemDirectory
     * @param string $backupDirectory
     * @param array $argv : command line arguments
     */
    public function __construct($itemUpdaterType, $itemDirectory, $backupDirectory, $argv) {
        $this->itemUpdaterType = $itemUpdaterType;
        $this->itemDirectory = $itemDirectory;
        $this->backupDirectory = $backupDirectory;
        $this->argv = $argv;
    }
    
    public function run() {
        $this->empyBackupDir();

        $stats = ['qtiFiles' => 0, 'broken' => 0, 'errors' => 0];

        $directoryItr   = new RecursiveDirectoryIterator($this->itemDirectory, FilesystemIterator::SKIP_DOTS);

        if ($this->isDryRun()) {
            echo "\n ===== DRY RUN MODE: add \"pray\" to command line for a real run\n";
        }

        foreach(new RecursiveIteratorIterator($directoryItr) as $file) {
            if ($file->getFilename() === "qti.xml") {
                try {
                    $stats['qtiFiles']++;

                    echo "\n" . $file->getPathname() . " ";

                    $itemUpdater = itemUpdaterFactory::getItemUpdater($this->itemUpdaterType, $file->getPathname());

                    if ($itemUpdater->isBroken()) {
                        echo "broken... ";
                        $stats['broken']++;

                        $this->backupFile($file->getPathname());
                        echo "backup... ";

                        $this->replaceFile($file->getPathname(), $itemUpdater->getFixedXml());
                        echo "fixed !";
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
    }


    private function isDryRun() {
        if (isset($this->argv[1]) && $this->argv[1] == "pray") {
            return false;
        }
        return true;
    }

    private function empyBackupDir() {
        if (is_dir($this->backupDirectory)) {
            echo "\n\ncleaning backup directory... ";
            $files = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($this->backupDirectory, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::CHILD_FIRST
            );

            foreach ($files as $fileinfo) {
                if ($fileinfo->isDir()) {
                    rmdir($fileinfo->getRealPath());
                } else {
                    unlink($fileinfo->getRealPath());
                }
            }
            echo "done\n\n";
        }
    }

    private function backupFile($pathname) {
        $sourceFile     = new \SplFileInfo($pathname);
        $path           = explode('/', $sourceFile->getPath());
        $itemDataIndex  = array_search('itemData', $path);
        $backupPath     = $this->backupDirectory . '/' . implode('/', array_slice($path, $itemDataIndex));
        if (!is_dir($backupPath)) {
            if (!mkdir($backupPath, 0775, true)) {
                throw new \common_Exception('cannot create backup directory ' . $backupPath);
            }
        }
        if (!copy($sourceFile->getPathname(), $backupPath . '/' . $sourceFile->getFilename())) {
            throw new \common_Exception('cannot backup file ' . $sourceFile->getPathname());
        };
    }

    private function replaceFile($pathname, $content) {
        if (!$this->isDryRun()) {
            if (file_put_contents($pathname, $content) === false) {
                throw new \common_Exception('couldn\'t correct file ' . $pathname);
            }
        }
    }
}
