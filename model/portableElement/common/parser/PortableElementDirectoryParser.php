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

namespace oat\taoQtiItem\model\portableElement\common\parser;

use oat\taoQtiItem\model\portableElement\common\model\PortableElementModel;
use oat\taoQtiItem\model\portableElement\common\PortableElementModelTrait;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use common_Exception;

/**
 * Parser of a QTI PCI package
 * A PCI package must contain a manifest pciCreator.json in the root as well as a pciCreator.js creator file
 *
 * @package taoQtiItem
 */
class PortableElementDirectoryParser
{
    use PortableElementModelTrait;

    protected $source = '';

    /**
     * PortableElementDirectoryParser constructor.
     * @param $directory
     * @throws ExtractException
     */
    public function __construct($directory){
        if(!is_dir($directory)){
            throw new ExtractException('Invalid directory');
        }
        $this->source = $directory;
    }

    /**
     * Validate the source directory
     *
     * @return bool
     * @throws \oat\taoQtiItem\model\portableElement\common\exception\PortableElementInconsistencyModelException
     * @throws common_Exception
     */
    public function validate()
    {
        $definitionFiles = $this->getModel()->getDefinitionFiles();
        foreach ($definitionFiles as $file) {
            if (!file_exists($this->source . DIRECTORY_SEPARATOR . $file)) {
                throw new common_Exception('A portable element package must contains a "' . $file . '" file at the root of the directory');
            }
        }

        $this->getModelFromArray($this->getManifestContent());
        return true;
    }

    /**
     * Return the source directory
     *
     * @return string
     */
    public function extract()
    {
        return $this->source;
    }

    /**
     * Return the manifest content found in the source directory as an associative array
     *
     * @return array
     * @throws \oat\taoQtiItem\model\portableElement\common\exception\PortableElementInconsistencyModelException
     * @throws common_Exception
     */
    public function getManifestContent()
    {
        $content = json_decode(file_get_contents($this->source . DIRECTORY_SEPARATOR . $this->getModel()->getManifestName()), true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $content;
        }
        throw new common_Exception('Portable element manifest is not a valid json file.');
    }

    /**
     * Check if the source directory contains a valid portable element model
     * The class of the portable element model must be provided in argument
     *
     * @param PortableElementModel $model
     * @return bool
     */
    public function hasValidModel(PortableElementModel $model)
    {
        $this->setModel($model);
        try {
            if ($this->validate()) {
                return true;
            }
        } catch (\common_Exception $e) {}
        return false;
    }
}
