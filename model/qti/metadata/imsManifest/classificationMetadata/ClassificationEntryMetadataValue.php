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
 * Copyright (c) 2017 Open Assessment Technologies SA
 *
 */

namespace oat\taoQtiItem\model\qti\metadata\imsManifest\classificationMetadata;

use oat\taoQtiItem\model\qti\metadata\LomMetadata;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;

class ClassificationEntryMetadataValue extends SimpleMetadataValue implements ClassificationValue
{
    /**
     * ClassificationEntryMetadataValue constructor.
     *
     * @param string $resourceIdentifier
     * @param string $value
     * @param string $language
     */
    public function __construct($resourceIdentifier, $value, $language = DEFAULT_LANG)
    {
        parent::__construct($resourceIdentifier, $this->getRelativeEntryPath(), $value, $language);
    }

    /**
     * Get the default entry path inside a classification node
     *
     * @return array
     */
    protected function getRelativeEntryPath()
    {
        return array(
            LomMetadata::LOM_NAMESPACE . '#taxon',
            LomMetadata::LOM_NAMESPACE . '#entry',
            LomMetadata::LOM_NAMESPACE . '#string'
        );
    }

    /**
     * Get default entry path into DomDocument
     *
     * @return array
     */
    static public function getEntryPath()
    {
        return [
            LomMetadata::LOM_NAMESPACE . '#lom',
            LomMetadata::LOM_NAMESPACE . '#classification',
            LomMetadata::LOM_NAMESPACE . '#taxonPath',
            LomMetadata::LOM_NAMESPACE . '#taxon',
            LomMetadata::LOM_NAMESPACE . '#entry',
            LomMetadata::LOM_NAMESPACE . '#string'
        ];
    }
}