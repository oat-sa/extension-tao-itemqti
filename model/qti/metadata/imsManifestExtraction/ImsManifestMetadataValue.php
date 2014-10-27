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

namespace oat\taoQtiItem\model\qti\metadata\imsManifestExtraction;

use oat\taoQtiItem\model\qti\metadata\MetadataValue;

/**
 * @author Antoine Robin <antoine.robin@vesperiagroup.com>
 */
class ImsManifestMetadataValue implements MetadataValue
{
    private $path;
    private $language;
    private $resourceIdentifier;
    private $resourceType;
    private $resourceHref;
    private $value;

    public function __construct()
    {
        $this->path = array();
        $this->language = '';
        $this->resourceIdentifier = '';
        $this->resourceType = '';
        $this->resourceHref = '';
        $this->value = '';

    }

    /**
     * @param mixed $language
     */
    public function setLanguage($language)
    {
        $this->language = $language;
    }

    /**
     * @param mixed $path
     */
    public function setPath($path)
    {
        $this->path = $path;
    }

    /**
     * @param mixed $resourceHref
     */
    public function setResourceHref($resourceHref)
    {
        $this->resourceHref = $resourceHref;
    }

    /**
     * @param mixed $resourceIdentifier
     */
    public function setResourceIdentifier($resourceIdentifier)
    {
        $this->resourceIdentifier = $resourceIdentifier;
    }

    /**
     * @param mixed $resourceType
     */
    public function setResourceType($resourceType)
    {
        $this->resourceType = $resourceType;
    }

    /**
     * @param mixed $value
     */
    public function setValue($value)
    {
        $this->value = $value;
    }

    /**
     * @see MetadataValue::getPath()
     */
    public function getPath()
    {
        return $this->path;
    }

    /**
     * @see MetadataValue::getLanguage()
     */
    public function getLanguage()
    {
        return $this->language;
    }

    /**
     * @see MetadataValue::getResourceIdentifier()
     */
    public function getResourceIdentifier()
    {
        return $this->resourceIdentifier;
    }

    /**
     * @see MetadataValue::getResourceType()
     */
    public function getResourceType()
    {
        return $this->resourceType;
    }

    /**
     * @see MetadataValue::getResourceHref()
     */
    public function getResourceHref()
    {
        return $this->resourceHref;
    }

    /**
     * @see MetadataValue::getValue()
     */
    public function getValue()
    {
        return $this->value;
    }
}