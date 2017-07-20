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

namespace oat\taoQtiItem\model\qti\metadata\simple;

use oat\taoQtiItem\model\qti\metadata\MetadataValue;
use \InvalidArgumentException;

/**
 * A Basic implementation of the MetadataValue interface.
 * 
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 */
class NestedMetadataValue implements MetadataValue
{
    /**
     * The Resource Identifier the MetadataValue belongs to.
     *
     * @var string
     */
    private $resourceIdentifier;

    /**
     * The language of the MetadataValue.
     * 
     * @var string
     */
    private $language;

    /**
     * The relative path of the MetadataValue.
     *
     * @var array
     */
    private $path;

    /**
     * The base path of the child nodes and the MetadataValue.
     *
     * @var array
     */
    private $basePath;

    /**
     * The intrinsic value of the MetadataValue.
     * 
     * @var string
     */
    private $value;

    /**
     * @var SimpleMetadataValue[]
     */
    private $childNodes;
    
    /**
     * Create a new SimpleMetadataValue object.
     * 
     * @param string $resourceIdentifier   The Identifier of the resource the MetadataValue describes.
     * @param array  $path                 The relative descriptive path of the metadata.
     * @param string $value                The intrinsic value of the MetadataValue.
     * @param string $language             A string. If no specific language, an empty string is accepted.
     * @param string $basePath             The base path of the child nodes.
     * @param array  $childNodes           The child nodes.
     *
     * @throws InvalidArgumentException If one of the argument contains an invalid value.
     */
    public function __construct($resourceIdentifier, $path, $value, $language = '', $basePath, array $childNodes)
    {
        $this->setResourceIdentifier($resourceIdentifier);
        $this->setPath($path);
        $this->setValue($value);
        $this->setLanguage($language);
        $this->setBasePath($basePath);
        $this->setChildNodes($childNodes);
    }
    
    /**
     * Set the identifier of the resource the MetadataValue describes.
     * 
     * @param string $resourceIdentifier An identifier.
     * @throws InvalidArgumentException If $resourceIdentifier is not a string or an empty string.
     */
    public function setResourceIdentifier($resourceIdentifier)
    {
        if (is_string($resourceIdentifier) === false) {
            throw new InvalidArgumentException('The resourceIdentifier argument must be a string.');
        }

        if ($resourceIdentifier === '') {
            throw new InvalidArgumentException('The resourceIdentifier argument must be a non-empty string.');
        }

        $this->resourceIdentifier = $resourceIdentifier;
    }
    
    /**
     * @see \oat\taoQtiItem\model\qti\metadata\MetadataValue::getResourceIdentifier()
     */
    public function getResourceIdentifier()
    {
        return $this->resourceIdentifier;
    }
    
    /**
     * Set the descriptive path of the MetadataValue.
     * 
     * @param array $path An array of Path Components.
     * @throws InvalidArgumentException If $path is an empty array.
     */
    public function setPath(array $path)
    {
        if (count($path) === 0) {
            throw new InvalidArgumentException('The path argument must be a non-empty array.');
        }

        $this->path = $path;
    }
    
    /**
     * @see \oat\taoQtiItem\model\qti\metadata\MetadataValue::getPath()
     */
    public function getPath()
    {
        return array_merge_recursive(
            $this->getBasePath(),
            $this->path
        );
    }

    /**
     * @see \oat\taoQtiItem\model\qti\metadata\MetadataValue::getPath()
     */
    public function getRelativePath()
    {
        return $this->path;
    }

    /**
     * Returns the base path of the child nodes.
     *
     * @return array
     */
    public function getBasePath()
    {
        return $this->basePath;
    }

    /**
     * Sets the base path of the child nodes.
     *
     * @param array $basePath
     */
    public function setBasePath(array $basePath)
    {
        $this->basePath = $basePath;
    }
    
    /**
     * Set the intrinsic value of the MetadataValue.
     * 
     * @param string $value An intrinsic value.
     */
    public function setValue($value)
    {
        $this->value = $value;
    }
    
    /**
     * @see \oat\taoQtiItem\model\qti\metadata\MetadataValue::getValue()
     */
    public function getValue()
    {
        return $this->value;
    }
    
    /**
     * Set the language of the MetadataValue. If the intrinsic value of 
     * the MetadataValue has no specific language, $language is an empty string.
     * 
     * @param string $language A language or an empty string.
     */
    public function setLanguage($language)
    {
        $this->language = $language;
    }
    
    /**
     * @see \oat\taoQtiItem\model\qti\metadata\MetadataValue::getLanguage()
     */
    public function getLanguage()
    {
        return $this->language;
    }

    /**
     * Returns the child nodes.
     *
     * @return array
     */
    public function getChildNodes()
    {
        return $this->childNodes;
    }

    /**
     * Sets the child nodes.
     *
     * @param SimpleMetadataValue[] $childNodes
     */
    public function setChildNodes(array $childNodes)
    {
        $this->childNodes = $childNodes;
    }
}