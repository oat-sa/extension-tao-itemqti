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

use oat\taoQtiItem\model\portableElement\exception\PortableElementException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementExtractException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementInconsistencyModelException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementParserException;
use oat\taoQtiItem\model\portableElement\model\PortableElementModelTrait;
use oat\taoQtiItem\model\portableElement\parser\PortableElementParser;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\helpers\QtiPackage;
use common_Exception;
use ZipArchive;

/**
 * Parser of a QTI PCI package
 * A PCI package must contain a manifest pciCreator.json in the root as well as a pciCreator.js creator file
 *
 * @package taoQtiItem
 */
abstract class PortableElementPackageParser implements PortableElementParser
{
    use PortableElementModelTrait;

    /**
     * Validate the zip package
     *
     * @param string $source Zip package location to validate
     * @return bool
     * @throws PortableElementException
     * @throws PortableElementParserException
     * @throws PortableElementInconsistencyModelException
     */
    public function validate($source)
    {
        try {
            $this->assertSourceAsFile($source);

            if (! QtiPackage::isValidZip($source)) {
                throw new PortableElementParserException('Source package is not a valid zip.');
            }
        } catch (common_Exception $e) {
            throw new PortableElementParserException('A problem has occured during package parsing.', 0, $e);
        }

        $zip = new ZipArchive();
        $zip->open($source, ZIPARCHIVE::CHECKCONS);

        $definitionFiles = $this->getModel()->getDefinitionFiles();
        foreach ($definitionFiles as $file) {
            if ($zip->locateName($file) === false) {
                throw new PortableElementParserException(
                    'The portable element package "' . $this->getModel()->getId() . '" must contains a "'
                        . $file . '" file at the root of the archive.'
                );
            }
        }

        $zip->close();

        $this->getModel()->createDataObject($this->getManifestContent($source));
        return true;
    }

    /**
     * Extract zip package into temp directory
     *
     * @param string $source Zip path
     * @return string Tmp directory to find extracted zip
     * @throws PortableElementExtractException
     * @throws common_Exception
     */
    public function extract($source)
    {
        $tmpDirectory = null;

        $this->assertSourceAsFile($source);
        $folder = \tao_helpers_File::createTempDir();
        $zip = new ZipArchive();
        if ($zip->open($source) === true) {
            if (\tao_helpers_File::checkWhetherArchiveIsBomb($zip)) {
                throw new PortableElementExtractException(sprintf('Source %s seems to be a ZIP bomb', $source));
            }
            if ($zip->extractTo($folder)) {
                $tmpDirectory = $folder;
            }
            $zip->close();
        }

        if (! is_dir($tmpDirectory)) {
            throw new PortableElementExtractException('Unable to extract portable element.');
        }

        return $tmpDirectory;
    }

    /**
     * Extract JSON representation of $source package e.q. Manifest
     *
     * @param string $source Zip path
     * @return string JSON representation of $this->source
     * @throws PortableElementException
     * @throws PortableElementParserException
     */
    public function getManifestContent($source)
    {
        $zip = new ZipArchive();
        if ($zip->open($source) === false) {
            throw new PortableElementParserException('Unable to open the ZIP file located at: ' . $source);
        }

        $manifestName = $this->getModel()->getManifestName();
        if ($zip->locateName($manifestName) === false) {
            throw new PortableElementParserException(
                'ZIP package does not have a manifest at root path: ' . $this->getModel()->getManifestName()
            );
        }

        $content = $zip->getFromName($manifestName);

        if (! $content) {
            throw new PortableElementParserException('Manifest file "' . $manifestName . '" found but not readable.');
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
     * @param string $source Zip path
     * @return bool
     */
    public function hasValidPortableElement($source)
    {
        try {
            if ($this->validate($source)) {
                return true;
            }
        } catch (common_Exception $e) {
        }
        return false;
    }

    /**
     * Check if source if file
     *
     * @param string $source Zip path
     * @throws ExtractException
     */
    protected function assertSourceAsFile($source)
    {
        if (! is_file($source)) {
            throw new ExtractException('Zip file to extract is not a file. Got "' . $source . '"');
        }
    }
}
