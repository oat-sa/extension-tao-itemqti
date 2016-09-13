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

namespace oat\taoQtiItem\model\portableElement\parser\implementation;

use oat\taoQtiItem\model\portableElement\exception\PortableElementException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementExtractException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementInconsistencyModelException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementParserException;
use oat\taoQtiItem\model\portableElement\model\PortableElementModelTrait;
use oat\taoQtiItem\model\portableElement\parser\PortableElementParser;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\helpers\QtiPackage;
use common_Exception;
use \ZipArchive;

/**
 * Parser of a QTI PCI package
 * A PCI package must contain a manifest pciCreator.json in the root as well as a pciCreator.js creator file
 *
 * @package taoQtiItem
 */
abstract class PortableElementPackageParser implements PortableElementParser
{
    use PortableElementModelTrait;

    protected $source = '';

    /**
     * Set the source to extract
     *
     * @param $source
     * @return $this
     * @throws ExtractException
     */
    public function setSource($source)
    {
        $this->source = DIRECTORY_SEPARATOR . ltrim($source, DIRECTORY_SEPARATOR);
        $this->assertSourceAsFile();
        return $this;
    }

    /**
     * Validate the zip package
     *
     * @param string $schema
     * @return bool
     * @throws PortableElementException
     * @throws PortableElementParserException
     * @throws PortableElementInconsistencyModelException
     */
    public function validate($schema = '')
    {
        try {
            $this->assertSourceAsFile();

            if (! QtiPackage::isValidZip($this->source)) {
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

        $this->getModel()->createDataObject($this->getManifestContent());
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
        $source = null;

        $this->assertSourceAsFile();
        $folder = \tao_helpers_File::createTempDir();
        $zip = new ZipArchive();
        if ($zip->open($this->source) === true) {
            if($zip->extractTo($folder)){
                $source = $folder;
            }
            $zip->close();
        }

        if (! is_dir($source)) {
            throw new PortableElementExtractException('Unable to extract portable element.');
        }

        return $source;
    }

    /**
     * Extract JSON representation of $source package e.q. Manifest
     *
     * @return string JSON representation of $this->source
     * @throws PortableElementException
     * @throws PortableElementParserException
     */
    public function getManifestContent()
    {
        $zip = new ZipArchive();
        if($zip->open($this->source) === false ) {
            throw new PortableElementParserException('Unable to open the ZIP file located at: ' . $this->source);
        }

        $manifestName = $this->getModel()->getManifestName();
        if ($zip->locateName($manifestName) === false) {
            throw new PortableElementParserException(
                'ZIP package does not have a manifest at root path: ' . $this->getModel()->getManifestName()
            );
        }

        $content = $zip->getFromName($manifestName);

        if (! $content) {
            throw new PortableElementParserException('Manifest file "' . $manifestName. '" found but not readable.');
        }

        $content = json_decode($content, true);

        if (json_last_error() === JSON_ERROR_NONE) {
            return $content;
        }
        throw new PortableElementException('Portable element manifest is not a valid json file.');
    }

    /**
     * Check if $source has valid portable element
     *
     * @return bool
     */
    public function hasValidPortableElement()
    {
        try {
            if ($this->validate()) {
                return true;
            }
        } catch (common_Exception $e) {}
        return false;
    }

    /**
     * Check if source if file
     *
     * @throws ExtractException
     */
    protected function assertSourceAsFile()
    {
        if (! is_file($this->source)) {
            throw new ExtractException('Zip file to extract is not a file.');
        }
    }

}
