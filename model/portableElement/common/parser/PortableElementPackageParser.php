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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\portableElement\common\parser;

use oat\taoQtiItem\model\portableElement\common\exception\PortableElementException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementExtractException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementParserException;
use oat\taoQtiItem\model\portableElement\common\model\PortableElementModel;
use oat\taoQtiItem\model\portableElement\common\PortableElementModelTrait;
use oat\taoQtiItem\model\qti\PackageParser;
use oat\taoQtiItem\helpers\QtiPackage;
use common_Exception;
use \ZipArchive;

/**
 * Parser of a QTI PCI package
 * A PCI package must contain a manifest pciCreator.json in the root as well as a pciCreator.js creator file
 *
 * @package qtiItemPci
 */
class PortableElementPackageParser extends PackageParser
{
    use PortableElementModelTrait;

    /**
     * Validate the zip package
     *
     * @param string $schema
     * @return bool
     * @throws PortableElementException
     * @throws PortableElementParserException
     * @throws \oat\taoQtiItem\model\portableElement\common\exception\PortableElementInconsistencyModelException
     */
    public function validate($schema = '')
    {
        try {
            if (!QtiPackage::isValidZip($this->source)) {
                throw new PortableElementParserException('Source package is not a valid zip.');
            }
        } catch (common_Exception $e) {
            throw new PortableElementParserException('A problem has occured during package parsing.', 0, $e);
        }


        $zip = new ZipArchive();
        $zip->open($this->source, ZIPARCHIVE::CHECKCONS);

        $definitionFiles = $this->getModel()->getDefinitionFiles();
        foreach ($definitionFiles as $file) {
            if ($zip->locateName($file) === false) {
                throw new PortableElementParserException(
                    'A portable element package must contains a "' . $file . '" file at the root of the archive.'
                );
            }
        }

        $zip->close();

        $this->getModelFromArray($this->getManifestContent()));
        return true;
    }

    /**
     * Extract zip package into temp directory
     *
     * @return string
     * @throws PortableElementExtractException
     */
    public function extract()
    {
        try {
            $source = parent::extract();
        } catch (\common_exception_Error $e) {
            throw new PortableElementExtractException('Unable to extract portable element.', 0, $e);
        }

        if(!is_dir($source)){
            throw new PortableElementExtractException('Unable to find a valid directory of extracted package.');
        }

        return $source;
    }

    public function getManifestContent()
    {
        /** get Manifest */
        if (($handle = fopen('zip://' . $this->source . '#' . $this->getModel()->getManifestName(), 'r')) === false) {
            throw new PortableElementParserException('Unable to open the ZIP file located at: ' . $this->source);
        }

        $content = '';
        while(!feof($handle)){
            $content .= fread($handle, 8192);
        }
        fclose($handle);

        $content = json_decode($content, true);

        if (json_last_error() === JSON_ERROR_NONE) {
            return $content;
        }
        throw new PortableElementException('Portable element manifest is not a valid json file.');
    }

    public function hasValidModel(PortableElementModel $model)
    {
        $this->setModel($model);
        try {
            if ($this->validate()) {
                return true;
            }
        } catch (common_Exception $e) {}
        return false;
    }
}
