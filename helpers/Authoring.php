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
 * Copyright (c) 2013-2025 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiItem\helpers;

//use oat\taoQtiItem\helpers\Authoring;
use common_ext_ExtensionsManager;
use common_Logger;
use DOMDocument;
use DOMElement;
use DOMXpath;
use oat\oatbox\filesystem\File;
use oat\taoQtiItem\model\qti\exception\QtiModelException;
use oat\taoQtiItem\model\qti\Parser;
use core_kernel_classes_Resource;
use taoItems_models_classes_ItemsService;
use tao_helpers_File;
use common_exception_Error;

/**
 * Helper to provide methods for QTI authoring
 *
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoQtiItem
 */
class Authoring
{
    /**
     * Validate a QTI XML string.
     *
     * @param string $qti File path or XML string
     * @throws QtiModelException
     */
    public static function validateQtiXml($qti)
    {

        $dom = self::loadQtiXml($qti);
        $returnValue = $dom->saveXML();

        $parserValidator = new Parser($returnValue);
        $parserValidator->validate();
        if (!$parserValidator->isValid()) {
            common_Logger::w('Invalid QTI output: ' . PHP_EOL . ' ' . $parserValidator->displayErrors());
            throw new QtiModelException('invalid QTI item XML ' . PHP_EOL . ' ' . $parserValidator->displayErrors());
        }
    }

    /**
     * Simple function to check if the item is not missing any of the required asset configuration path
     * @param string $qti
     * @throws QtiModelException
     * @throws common_exception_Error
     */
    public static function checkEmptyMedia($qti)
    {
        $doc = new DOMDocument();
        $doc->loadHTML(self::loadQtiXml($qti)->saveXML());

        $imgs = $doc->getElementsByTagName('img');
        foreach ($imgs as $img) {
            if (empty($img->getAttribute('src'))) {
                throw new QtiModelException('image has no source');
            }
        }

        $objects = $doc->getElementsByTagName('object');
        foreach ($objects as $object) {
            if (empty($object->getAttribute('data'))) {
                throw new QtiModelException('object has no data source');
            }
        }

        $objects = $doc->getElementsByTagName('include');
        foreach ($objects as $object) {
            if (empty($object->getAttribute('href'))) {
                throw new QtiModelException('object has no data source');
            }
        }
    }

    /**
     * Add a list of required resources files to an RDF item and keeps the relative path structure
     * For instances, required css, js etc.
     *
     * @param string $sourceDirectory
     * @param array $relativeSourceFiles
     * @param core_kernel_classes_Resource $item
     * @param string $lang
     * @return array
     * @throws common_exception_Error
     */
    public static function addRequiredResources(
        $sourceDirectory,
        $relativeSourceFiles,
        $prefix,
        core_kernel_classes_Resource $item,
        $lang
    ) {

        $returnValue = [];

        $directory = taoItems_models_classes_ItemsService::singleton()->getItemDirectory($item, $lang);

        foreach ($relativeSourceFiles as $relPath) {
            if (! tao_helpers_File::securityCheck($relPath, true)) {
                throw new common_exception_Error('Invalid resource file path');
            }

            $relPath = preg_replace('/^\.\//', '', $relPath);
            $source = $sourceDirectory . $relPath;

            $fh = fopen($source, 'r');
            if (! is_resource($fh)) {
                throw new common_exception_Error('The resource "' . $source . '" cannot be copied.');
            }

            $path = tao_helpers_File::concat([
                $prefix ? $prefix : '',
                $relPath
            ]);

            // cannot write as PCI do not get cleaned up
            if ($directory->getFile($path)->put($fh)) {
                $returnValue[] = $relPath;
            }
            fclose($fh);
        }

        return $returnValue;
    }

    /**
     * Remove invalid elements and attributes from QTI XML.
     * @param string $qti File path or XML string
     * @return string sanitized XML
     */
    public static function sanitizeQtiXml($qti)
    {
        $doc = self::loadQtiXml($qti);

        $xpath = new DOMXpath($doc);

        $ids = [];
        $elementsWithId = $xpath->query("//*[not(local-name()='lib') and not(local-name()='module') and @id]");

        /** @var DOMElement $elementWithId */
        foreach ($elementsWithId as $elementWithId) {
            $id = $elementWithId->getAttribute('id');
            if (in_array($id, $ids)) {
                $elementWithId->removeAttribute('id');
            } else {
                $ids[] = $id;
            }
        }

        return $doc->saveXML();
    }

    /**
     * Load QTI xml and return DOMDocument instance.
     * If string is not valid xml then QtiModelException will be thrown.
     *
     * @param string|File $file If it's a string it can be a file path or an XML string
     * @throws QtiModelException
     * @throws common_exception_Error
     * @return DOMDocument
     */
    public static function loadQtiXml($file)
    {
        if ($file instanceof File) {
            $qti = $file->read();
        } elseif (preg_match("/^<\?xml(.*)?/m", trim($file))) {
            $qti = $file;
        } elseif (is_file($file)) {
            $qti = file_get_contents($file);
        } else {
            throw new common_exception_Error(
                "Wrong parameter. " . __CLASS__ . "::" . __METHOD__
                    . " accepts either XML content or the path to a file but got " . substr($file, 0, 500)
            );
        }

        $dom = new DOMDocument('1.0', 'UTF-8');

        $domDocumentConfig = common_ext_ExtensionsManager::singleton()
            ->getExtensionById('taoQtiItem')
            ->getConfig('XMLParser');

        if (is_array($domDocumentConfig) && !empty($domDocumentConfig)) {
            foreach ($domDocumentConfig as $param => $value) {
                if (property_exists($dom, $param)) {
                    $dom->$param = $value;
                }
            }
        } else {
            $dom->formatOutput = true;
            $dom->preserveWhiteSpace = false;
            $dom->validateOnParse = false;
        }

        libxml_use_internal_errors(true);

        if (!$dom->loadXML($qti)) {
            $errors = libxml_get_errors();

            $errorsMsg = 'Wrong QTI item output format:'
            . PHP_EOL
            . array_reduce($errors, function ($carry, $item) {
                $carry .= $item->message . PHP_EOL;
                return $carry;
            });

            common_Logger::w($errorsMsg);

            throw new QtiModelException($errorsMsg);
        }

        return $dom;
    }
}
