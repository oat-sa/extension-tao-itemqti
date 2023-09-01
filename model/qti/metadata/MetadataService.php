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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\qti\metadata;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\qti\metadata\exporter\MetadataExporter;
use oat\taoQtiItem\model\qti\metadata\importer\MetadataImporter;

/**
 * Class MetadataService
 * Service to manage importer & exporter service for metadata
 *
 * @package oat\taoQtiItem\model\qti\metadata
 * @author Moyon Camille
 */
class MetadataService extends ConfigurableService
{
    public const SERVICE_ID = 'taoQtiItem/metadataService';

    /**
     * Config key to store importer service for metadata
     */
    public const IMPORTER_KEY  = 'import';

    /**
     * Config key to store exporter service for metadata
     */
    public const EXPORTER_KEY  = 'export';

    /**
     * Return metadata importer to handle metadata
     *
     * @return MetadataImporter
     */
    public function getImporter()
    {
        return $this->getSubService(self::IMPORTER_KEY);
    }

    /**
     * Return metadata exporter to handle metadata
     *
     * @return MetadataExporter
     */
    public function getExporter()
    {
        return $this->getSubService(self::EXPORTER_KEY);
    }
}
