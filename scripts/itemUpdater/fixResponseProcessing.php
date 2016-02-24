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

// launch with :
// php taoQtiItem/scripts/itemUpdater/fixResponseProcessing.php


/**
 * @author Christophe Noël
 */
$directory      = __DIR__ . "/../../../data/taoItems/itemData";
$directoryItr   = new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS);

foreach(new RecursiveIteratorIterator($directoryItr) as $file) {
    if ($file->getFilename() === "qti.xml") {
        try {
            echo $file->getPathname() . " ... ";

            $responseProcessingUpdater = new ResponseProcessingUpdater($file->getPathname());

            if ($responseProcessingUpdater->isBroken()) {
                echo "broken ! fixing...\n";
                file_put_contents(
                    $file->getPathname(),
                    $responseProcessingUpdater->getFixedXml()
                );
            } else {
                echo "ok\n";
            }
        } catch (\Exception $e) {
            echo "\n\n !!!!!!!!!!!!!!!! error : " . $e->getMessage() . "\n\n";
        }
    }
}
