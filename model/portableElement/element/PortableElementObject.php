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

namespace oat\taoQtiItem\model\portableElement\element;

use oat\taoQtiItem\model\portableElement\model\PortableElementModelTrait;

abstract class PortableElementObject
{
    use PortableElementModelTrait;

    /** @var string */
    protected $typeIdentifier;
    /** @var string */
    protected $label;
    /** @var string */
    protected $short;
    /** @var string */
    protected $description;
    /** @var string */
    protected $version = null;
    /** @var string */
    protected $author;
    /** @var string */
    protected $email;
    /** @var array */
    protected $tags = [];
    /** @var array */
    protected $response = [];
    /** @var array */
    protected $runtime = [];
    /** @var array */
    protected $creator = [];
    /** @var boolean */
    protected $enabled;

    /**
     * PortableElementModel constructor with identifier & optional version
     *
     * @param $typeIdentifier
     * @param $version
     */
    public function __construct($typeIdentifier = null, $version = null)
    {
        $this->typeIdentifier = $typeIdentifier;
        $this->version = $version;
    }

    /**
     * Populate $this object from array
     *
     * @param array $data
     * @return $this
     */
    public function exchangeArray(array $data)
    {
        $attributes = array_keys($this->toArray());
        foreach ($attributes as $field) {
            if (isset($data[$field])) {
                $this->$field = $data[$field];
            }
        }
        return $this;
    }

    /**
     * Return an array representation of $this object
     * Should be filtered by $selectionGroup
     *
     * @param bool $selectionGroup
     * @return array
     */
    public function toArray($selectionGroup = false)
    {
        $array = get_object_vars($this);
        if (is_array($selectionGroup)) {
            return array_intersect_key($array, array_flip($selectionGroup));
        }
        unset($array['model']);
        return $array;
    }

    /**
     * @return string
     */
    public function getTypeIdentifier()
    {
        return $this->typeIdentifier;
    }

    /**
     * @param $typeIdentifier
     * @return $this
     */
    public function setTypeIdentifier($typeIdentifier)
    {
        $this->typeIdentifier = $typeIdentifier;
        return $this;
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return $this->label;
    }

    /**
     * @param $label
     * @return $this
     */
    public function setLabel($label)
    {
        $this->label = $label;
        return $this;
    }

    /**
     * @return string
     */
    public function getShort()
    {
        return $this->short;
    }

    /**
     * @param $short
     * @return $this
     */
    public function setShort($short)
    {
        $this->short = $short;
        return $this;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @param $description
     * @return $this
     */
    public function setDescription($description)
    {
        $this->description = $description;
        return $this;
    }

    /**
     * @return string
     */
    public function getVersion()
    {
        return $this->hasVersion() ? $this->version : '0.0.0';
    }

    /**
     * @param $version
     * @return $this
     */
    public function setVersion($version)
    {
        $this->version = $version;
        return $this;
    }

    /**
     * @return bool
     */
    public function hasVersion()
    {
        return ($this->version != null);
    }

    /**
     * @return string
     */
    public function getAuthor()
    {
        return $this->author;
    }

    /**
     * @param $author
     * @return $this
     */
    public function setAuthor($author)
    {
        $this->author = $author;
        return $this;
    }

    /**
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * @param $email
     * @return $this
     */
    public function setEmail($email)
    {
        $this->email = $email;
        return $this;
    }

    /**
     * @return array
     */
    public function getTags()
    {
        return $this->tags;
    }

    /**
     * @param $tags
     * @return $this
     */
    public function setTags($tags)
    {
        $this->tags = $tags;
        return $this;
    }

    /**
     * @return array
     */
    public function getResponse()
    {
        return $this->response;
    }

    /**
     * @param $response
     * @return $this
     */
    public function setResponse($response)
    {
        $this->response = $response;
        return $this;
    }

    /**
     * @return array
     */
    public function getRuntime()
    {
        return $this->runtime;
    }

    /**
     * Return runtime files with relative path
     *
     * @return array
     */
    public function getRuntimePath()
    {
        $paths = [];
        foreach ($this->getRuntime() as $key => $value) {
            if (in_array($key, ['hook', 'libraries', 'stylesheets', 'mediaFiles', 'icon', 'src'])) {
                $paths[$key] = preg_replace('/^' . $this->getTypeIdentifier() . '/', '.', $value);
            }
        }
        return $paths;
    }

    /**
     * Return creator files with relative aliases
     *
     * @return array
     */
    public function getRuntimeAliases()
    {
        $paths = [];
        foreach ($this->getRuntime() as $key => $value) {
            if (in_array($key, ['hook', 'libraries', 'stylesheets', 'mediaFiles', 'icon', 'src'])) {
                $paths[$key] = preg_replace(
                    '/^(.\/)(.*)/',
                    $this->getTypeIdentifier() . "/$2",
                    $this->getRuntimeKey($key)
                );
            }
        }
        return $paths;
    }

    /**
     * Return creator files with relative path
     *
     * @return array
     */
    public function getCreatorPath()
    {
        $paths = [];
        foreach ($this->getCreator() as $key => $value) {
            if (in_array($key, ['hook', 'libraries', 'stylesheets', 'mediaFiles', 'icon', 'src'])) {
                $paths[$key] = preg_replace('/^' . $this->getTypeIdentifier() . '/', '.', $value);
            }
        }
        return $paths;
    }

    /**
     * Return creator files with relative aliases
     *
     * @return array
     */
    public function getCreatorAliases()
    {
        $paths = [];
        foreach ($this->getCreator() as $key => $value) {
            if (in_array($key, ['hook', 'libraries', 'stylesheets', 'mediaFiles', 'icon', 'src'])) {
                $paths[$key] = preg_replace(
                    '/^(.\/)(.*)/',
                    $this->getTypeIdentifier() . "/$2",
                    $this->getCreatorKey($key)
                );
            }
        }
        return $paths;
    }


    /**
     * @param array $runtime
     * @return $this
     */
    public function setRuntime(array $runtime)
    {
        foreach ($runtime as $key => $value) {
            if (is_array($value)) {
                $this->runtime[$key] = $value;
            }
        }
        return $this;
    }

    /**
     * Check if given runtime key exists
     *
     * @param $key
     * @return bool
     */
    public function hasRuntimeKey($key)
    {
        return (isset($this->runtime[$key]));
    }

    /**
     * Get runtime value associated to the given key
     *
     * @param $key
     * @return null
     */
    public function getRuntimeKey($key)
    {
        if ($this->hasRuntimeKey($key)) {
            return $this->runtime[$key];
        }
        return [];
    }

    /**
     * Set runtime value associated to the given key
     *
     * @param $key
     * @param $value
     * @return mixed
     */
    public function setRuntimeKey($key, $value)
    {
        return $this->runtime[$key] = $value;
    }

    /**
     * @return array
     */
    public function getCreator()
    {
        return $this->creator;
    }

    /**
     * @param $creator
     * @return $this
     */
    public function setCreator($creator)
    {
        foreach ($creator as $key => $value) {
            if (is_array($value)) {
                $this->creator[$key] = $value;
            }
        }
        return $this;
    }

    /**
     * Check if given creator key exists
     *
     * @param $key
     * @return bool
     */
    public function hasCreatorKey($key)
    {
        return (isset($this->creator[$key]));
    }

    /**
     * Get creator value associated to the given key
     *
     * @param $key
     * @return null
     */
    public function getCreatorKey($key)
    {
        if ($this->hasCreatorKey($key)) {
            return $this->creator[$key];
        }
        return [];
    }

    /**
     * Set creator value associated to the given key
     *
     * @param $key
     * @param $value
     * @return mixed
     */
    public function setCreatorKey($key, $value)
    {
        return $this->creator[$key] = $value;
    }

    /**
     * Check if the portable element is enabled
     * @return bool
     */
    public function isEnabled()
    {
        return ($this->enabled === true);
    }

    /**
     * Enable the portable element
     */
    public function enable()
    {
        $this->enabled = true;
    }

    /**
     * Disable the portable element
     */
    public function disable()
    {
        $this->enabled = false;
    }

    /**
     * Check if the enabled property has already been set
     */
    public function hasEnabled()
    {
        return ! is_null($this->enabled);
    }

    /**
     * Get the registration path for the source within a standard QTI package
     * @param $packagePath - absolute path to the root of the item package
     * @param $itemPath - absolute path to the root of the item folder
     * @return string
     */
    public function getRegistrationSourcePath($packagePath, $itemPath)
    {
        return $itemPath . DIRECTORY_SEPARATOR . $this->getTypeIdentifier() . DIRECTORY_SEPARATOR;
    }

    /**
     * Get the registration file entry
     * @param $file - the relative path to the file
     * @return string
     */
    public function getRegistrationFileId($file)
    {
        //Adjust file resource entries where {QTI_NS}/xxx/yyy.js is equivalent to ./xxx/yyy.j
        return preg_replace('/^' . $this->getTypeIdentifier() . '/', '.', $file);
    }

    /**
     * Check the given file entry should be registered or not
     * @param $file
     * @return bool
     */
    public function isRegistrableFile($file)
    {
        return (substr($file, 0, 2) == './' || preg_match('/^' . $this->getTypeIdentifier() . '/', $file));
    }

    /**
     * Get the array of key in the portable element model that should not be registered as files
     * @return array
     */
    public function getRegistrationExcludedKey()
    {
        return [];
    }
}
