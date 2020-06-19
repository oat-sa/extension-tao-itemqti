<?php

declare(strict_types=1);

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
 * Copyright (c) 2013-2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\qti\ImportService;

$itemClass = taoItems_models_classes_ItemsService::singleton()->getRootClass();
$samplesDirectory = new DirectoryIterator(__DIR__);
$service = ServiceManager::getServiceManager()->get(ImportService::SERVICE_ID);

try {
    foreach ($samplesDirectory as $file) {
        if ($file->isReadable() && $file->isFile() && 'zip' === $file->getExtension()) {
            $service->importQTIPACKFile($file->getRealPath(), $itemClass, false);
        }
    }
} catch (Throwable $e) {
    common_Logger::e('Error Occurs when importing Qti Examples ' . $e->getMessage());
    throw $e;
}
