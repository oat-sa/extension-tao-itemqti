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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\taoQtiItem\model\flyExporter\simpleExporter;

use oat\oatbox\filesystem\File;

/**
 * Service to export item data
 *
 * Interface SimpleExporter
 * @package oat\taoQtiItem\model\simpleExporter
 */
interface SimpleExporter
{
    public const SERVICE_ID = 'taoQtiItem/simpleExporter';

    /**
     * Main action to launch export
     *
     * @param \core_kernel_classes_Resource[] $items
     * @return mixed
     */
    public function export(array $items = null);

    /**
     * Extract data from items
     *
     * @param array $items
     * @return array
     */
    public function getDataByItems(array $items);

    /**
     * Extract data from one item
     *
     * @param \core_kernel_classes_Resource $item
     * @return array
     */
    public function getDataByItem(\core_kernel_classes_Resource $item);

    /**
     * Save extracted to a file, return file or file path, depending of $asFile
     *
     * @param array $headers
     * @param array $data
     * @return string
     */
    public function save(array $headers, array $data);

    /**
     * Get headers of csv
     *
     * @return array
     */
    public function getHeaders();
}
