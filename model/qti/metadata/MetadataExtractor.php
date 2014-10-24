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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\metadata;

use \DOMDocument;

/**
 * A MetadataExtractor implements the mechanics to extract all metadata values from a given
 * IMS Manifest file. 
 * 
 * The only task such an implementation must perform is to extract
 * and return MetadataValue implementations from a given IMS Manifest file, by implementing
 * the extract() method of this interface.
 * 
 * 
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 * @see MetadataValue The MedataValue interface, describing objects extracted and returned by a MetadataExtractor.
 * @see @see http://www.imsglobal.org/question/qti_v2p0/examples/mdexample/imsmanifest.xml IMS Manifest example.
 */
interface MetadataExtractor
{
    /**
     * Extract the metadata values from the given IMS $manifest file, provided as DOMDocument object.
     * Please see the documentation of the MetadataValue interface for in depth information
     * about what a metadata value actually is.
     * 
     * Important! This is not the duty of a MetadataExtractor implementation to check whether
     * or not the given $manifest object is valid against a particular XML Schema Definition (XSD)
     * file. MetadataExtractor implementations simply consider the $manifest object to be valid.
     * 
     * If no MetadataValue objects could be infered from the $manifest, an empty array is returned.
     * 
     * @param DOMDocument $manifest The IMS Manifest you want to extract MetaDataValue objects from.
     * @throws MetadataExtractionException If something goes wrong during the extraction process.
     * @return MetadataValue[] An array of MetadataValue objects.
     */
    public function extract(DOMDocument $manifest);
}