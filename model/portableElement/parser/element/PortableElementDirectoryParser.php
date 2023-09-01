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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\portableElement\parser\element;

use oat\taoQtiItem\model\portableElement\exception\PortableElementInconsistencyModelException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementParserException;
use oat\taoQtiItem\model\portableElement\model\PortableElementModelTrait;
use oat\taoQtiItem\model\portableElement\parser\PortableElementParser;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use common_Exception;

/**
 * Parser of a QTI Portable element package
 * A Portable element package must contain a manifest pciCreator.json in the root as well as a pciCreator.js creator
 * file
 *
 * @package taoQtiItem
 */
abstract class PortableElementDirectoryParser implements PortableElementParser
{
    use PortableElementModelTrait;

    /**
     * Validate the source directory
     *
     * @param string $source Directory path to validate
     * @return bool
     * @throws ExtractException
     * @throws PortableElementParserException
     * @throws common_Exception
     */
    public function validate($source)
    {
        $this->assertSourceAsDirectory($source);

        $definitionFiles = $this->getModel()->getDefinitionFiles();
        foreach ($definitionFiles as $file) {
            if (! file_exists($source . DIRECTORY_SEPARATOR . $file)) {
                throw new PortableElementParserException('A portable element package must contains a "' . $file .
                    '" file at the root of the directory: "' . $source . '"');
            }
        }

        $this->getModel()->createDataObject($this->getManifestContent($source));
        return true;
    }

    /**
     * Return the source directory
     *
     * @param string $source Directory path
     * @return string
     * @throws ExtractException
     */
    public function extract($source)
    {
        $this->assertSourceAsDirectory($source);
        return $source;
    }

    /**
     * Return the manifest content found in the source directory as json array
     *
     * @param string $source Directory path
     * @return array
     * @throws PortableElementInconsistencyModelException
     * @throws common_Exception
     */
    public function getManifestContent($source)
    {
        $content = json_decode(file_get_contents($source . DIRECTORY_SEPARATOR
            . $this->getModel()->getManifestName()), true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $content;
        }
        throw new common_Exception('Portable element manifest is not a valid json file.');
    }

    /**
     * Check if the source directory contains a valid portable element model
     *
     * @param string $source Directory path
     * @return bool
     */
    public function hasValidPortableElement($source)
    {
        try {
            if ($this->validate($source)) {
                return true;
            }
        } catch (\common_Exception $e) {
        }
        return false;
    }

    /**
     * Check if $source is a directory
     *
     * @param string $source Directory path
     * @throws ExtractException
     */
    protected function assertSourceAsDirectory($source)
    {
        if (! is_dir($source)) {
            throw new ExtractException('Invalid directory');
        }
    }
}
