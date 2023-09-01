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

namespace oat\taoQtiItem\model\portableElement\validator;

use oat\tao\model\ClientLibRegistry;
use oat\taoQtiItem\model\portableElement\exception\PortableElementInvalidAssetException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementInvalidModelException;
use oat\taoQtiItem\model\portableElement\exception\PortableElementParserException;
use oat\taoQtiItem\model\portableElement\element\PortableElementObject;

abstract class PortableElementAssetValidator implements Validatable
{
    /**
     * Validate files by checking:
     *  - Model requirement
     *  - Existing as file or alias
     *
     * @param PortableElementObject $object
     * @param string $source Temporary directory source
     * @param array $files Array of file relative path
     * @return bool
     * @throws PortableElementInvalidAssetException
     * @throws PortableElementInvalidModelException
     * @throws PortableElementParserException
     * @throws \common_exception_Error
     */
    public function validateAssets(PortableElementObject $object, $source, array $files = [])
    {
        $errorReport = \common_report_Report::createFailure('Portable element validation has failed.');

        if (empty($files)) {
            //if no files requested, get all all assets
            try {
                $files = $this->getAssets($object);
            } catch (PortableElementInvalidAssetException $e) {
                $subReport = \common_report_Report::createFailure($e->getMessage());
                $errorReport->add($subReport);
            }
        }

        if (!empty($files)) {
            foreach ($files as $key => $file) {
                try {
                    $this->validFile($source, $file);
                } catch (PortableElementInvalidAssetException $e) {
                    $subReport = \common_report_Report::createFailure(__('Cannot locate the file "%s"', $file));
                    $errorReport->add($subReport);
                }
            }
        }

        if ($errorReport->containsError()) {
            $exception = new PortableElementInvalidModelException();
            $exception->setReport($errorReport);
            throw $exception;
        }
        return true;
    }

    /**
     * Return all assets of a portable element in a array of string
     * Path is relative to Portable Element location
     *
     * @param PortableElementObject $object
     * @param null $type Object key to focus
     * @return array List of file relative path
     * @throws PortableElementInvalidAssetException
     */
    public function getAssets(PortableElementObject $object, $type = null)
    {
        $assets = [];
        if (is_null($type) || ($type == 'runtime')) {
            $assets = ['runtime' => $object->getRuntimePath()];
        }

        if (is_null($type) || ($type == 'creator')) {
            if (! empty($object->getCreator())) {
                $assets['creator'] = $object->getCreatorPath();
            }
        }

        $files = [];
        foreach ($assets as $key => $asset) {
            $constraints = $this->getAssetConstraints($key);
            foreach ($constraints as $constraint) {
                if (! isset($asset[$constraint])) {
                    if ($this->isOptionalConstraint($key, $constraint)) {
                        continue;
                    }
                    throw new PortableElementInvalidAssetException(
                        'Missing asset file for ' . $key . ':' . $constraint
                    );
                }
                if (is_array($asset[$constraint])) {
                    //get a flat list out of the structure of file data
                    $it = new \RecursiveIteratorIterator(new \RecursiveArrayIterator($asset[$constraint]));
                    foreach ($it as $k => $v) {
                        if (!in_array(strval($k), $object->getRegistrationExcludedKey()) && !empty($v)) {
                            $files[] = $v;
                        }
                    }
                } else {
                    if (!empty($asset[$constraint])) {
                        $files[] = $asset[$constraint];
                    }
                }
            }
        }
        return $files;
    }

    /**
     * Valid a file if exists or alias
     *
     * @param string $source Temporary directory source
     * @param string $file Path to the file
     * @return bool
     * @throws PortableElementInvalidAssetException
     * @throws PortableElementParserException
     */
    public function validFile($source, $file)
    {
        if (! file_exists($source)) {
            throw new PortableElementParserException('Unable to locate extracted zip file.');
        }

        $filePath = rtrim($source, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . preg_replace('/^\.\//', '', $file);

        if (file_exists($filePath) || file_exists($filePath . '.js')) {
            return true;
        }

        if (array_key_exists($file, ClientLibRegistry::getRegistry()->getLibAliasMap())) {
            return true;
        }

        throw new PortableElementInvalidAssetException(
            'Asset "' . $file . '" is not found in the source "' . $source . '"" neither through alias'
        );
    }
}
