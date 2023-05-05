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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\qti\metadata;

use oat\oatbox\service\ConfigurableService;

/**
 * Class AbstractMetadataService
 * Base class for a metadata Service e.q. MetadataExporter or MetadataImporter
 *
 * @package oat\taoQtiItem\model\qti\metadata
 * @author Moyon Camille
 */
abstract class AbstractMetadataService extends ConfigurableService
{
    /**
     * Config key to store injectors classes
     */
    public const INJECTOR_KEY  = 'injectors';

    /**
     * Config key to store extractors classes
     */
    public const EXTRACTOR_KEY = 'extractors';

    /**
     * @var array Array of metadata, with metadata key with associated value
     */
    protected $metadataValues;

    /**
     * @var array Instances to manage metadata values
     */
    protected $instances;

    /**
     * Allow to register into config a metadataService
     */
    abstract protected function registerMetadataService();

    /**
     * Extract metadata value of a given $source
     *
     * Extract metadata values by calling each extractors
     *
     * @param $source
     * @return array
     */
    public function extract($source)
    {
        $metadata = [[]];
        foreach ($this->getExtractors() as $extractor) {
            $metadata[] = $extractor->extract($source);
        }
        $metadata = array_merge_recursive(...$metadata);
        \common_Logger::d(__('%s metadata values found in source by extractor(s).', count($metadata)));

        return $metadata;
    }

    /**
     * Inject metadata value for an identifier through injectors
     *
     * Inject metadata value for an identifier by calling each injectors
     * Injectors need $target for injection
     *
     * @param $identifier
     * @param $target
     */
    public function inject($identifier, $target)
    {
        if ($this->hasMetadataValue($identifier)) {
            \common_Logger::i(__('Preparing Metadata Values for target "%s"...', $identifier));
            $values = $this->getMetadataValue($identifier);

            foreach ($this->getInjectors() as $injector) {
                \common_Logger::i(
                    // phpcs:disable Generic.Files.LineLength
                    __('Attempting to inject "%s" metadata values for target "%s" with metadata Injector "%s".', count($values), $identifier, get_class($injector))
                    // phpcs:enable Generic.Files.LineLength
                );
                $injector->inject($target, [$identifier => $values]);
            }
        }
    }

    /**
     * Register an importer instance
     *
     * Register an instance e.q. Injectors, Extractors, Guardians or LooUpClass
     * Respective interface is checked
     * Throw exception if call if not correctly formed
     *
     * @param $key
     * @param $name
     * @return bool
     * @throws \InvalidArgumentException
     * @throws \common_Exception
     */
    public function register($key, $name)
    {
        if (empty($key) || empty($name)) {
            throw new \InvalidArgumentException(__('Register method expects $key and $name parameters'));
        }

        if (is_object($name)) {
            $name = get_class($name);
        }

        switch ($key) {
            case self::EXTRACTOR_KEY:
                $this->registerInstance(self::EXTRACTOR_KEY, $name, MetadataExtractor::class);
                break;
            case self::INJECTOR_KEY:
                $this->registerInstance(self::INJECTOR_KEY, $name, MetadataInjector::class);
                break;
            default:
                throw new \common_Exception(__('Unknown $key to register MetadataService instance'));
        }

        return true;
    }

    /**
     * Unregister a instance of metadataService config
     *
     * Unregister an instance with helper method unregisterInstance
     *
     * @param string $key The config key where unregister instance
     * @param string $name The instance name to unregister
     * @throws \common_Exception If method is call with empty argument
     */
    public function unregister($key, $name)
    {
        if (empty($key) || empty($name)) {
            throw new \common_Exception();
        }

        if (is_object($name)) {
            $name = get_class($name);
        }

        switch ($key) {
            case self::EXTRACTOR_KEY:
                $this->unregisterInstance(self::EXTRACTOR_KEY, $name);
                break;
            case self::INJECTOR_KEY:
                $this->unregisterInstance(self::INJECTOR_KEY, $name);
                break;
        }
        return;
    }

    /**
     * Return metadata values
     *
     * @return array
     */
    public function getMetadataValues()
    {
        return $this->metadataValues;
    }

    /**
     * Set metadata values with given array
     *
     * @param array $metadataValues
     */
    public function setMetadataValues(array $metadataValues)
    {
        $this->metadataValues = $metadataValues;
    }

    /**
     *
     * @return MetadataExtractor[]
     */
    public function getExtractors()
    {
        return $this->getInstances(self::EXTRACTOR_KEY, MetadataExtractor::class);
    }

    /**
     * Register an instance
     *
     * Register a $name instance into $key config
     * $key class has to implements $interface
     *
     * @param $key
     * @param $name
     * @param $interface
     */
    protected function registerInstance($key, $name, $interface)
    {
        if (is_a($name, $interface, true)) {
            $instances = $this->getOption($key);
            if ($instances === null || array_search($name, $instances) === false) {
                $instances[] = $name;
                $this->setOption($key, $instances);
                $this->registerMetadataService();
            }
        }
    }

    /**
     * Unregister an instance
     *
     * Unregister a $name instance into $key config
     *
     * @param $key
     * @param $name
     */
    protected function unregisterInstance($key, $name)
    {
        if ($this->hasOption($key)) {
            $instances = $this->getOption($key);

            if (($index = array_search($name, $instances)) !== false) {
                unset($instances[$index]);
                $this->setOption($key, $instances);
                $this->registerMetadataService();
            }
        }
    }

    /**
     * Check if metadata value $identifier exists
     *
     * @param $identifier
     * @return bool
     */
    public function hasMetadataValue($identifier)
    {
        return array_key_exists($identifier, $this->getMetadataValues());
    }

    /**
     * Return the associated value of metadata $identifier or null if not exists
     *
     * @param $identifier
     * @return mixed|null
     */
    public function getMetadataValue($identifier)
    {
        $metadata = $this->getMetadataValues();
        return isset($metadata[$identifier]) ? $metadata[$identifier] : null;
    }

    /**
     *
     * @return MetadataInjector[]
     */
    protected function getInjectors()
    {
        return $this->getInstances(self::INJECTOR_KEY, MetadataInjector::class);
    }

    /**
     * Return config instances
     *
     * Retrieve instances stored into config
     * Config $key is scan to take only instances with given $interface
     *
     * @param $id
     * @param $interface
     * @return mixed
     */
    protected function getInstances($id, $interface)
    {
        if (isset($this->instances[$id])) {
            return $this->instances[$id];
        }

        $this->instances[$id] = [];

        if (! $this->hasOption($id)) {
            return $this->instances[$id];
        } else {
            foreach ($this->getOption($id) as $instance) {
                if (is_a($instance, $interface, true)) {
                    $this->instances[$id][] = $this->getInstance($instance);
                }
            }
        }

        return $this->instances[$id];
    }

    private function getInstance(string $instance): object
    {
        $isConfigurableService = is_a($instance, ConfigurableService::class, true);

        if ($isConfigurableService) {
            return $this->getServiceLocator()->get($this->getConfigurableServiceKey($instance));
        }

        return new $instance();
    }

    private function getConfigurableServiceKey(string $instance): string
    {
        return defined($instance . '::SERVICE_ID')
            ? $instance::SERVICE_ID
            : $instance;
    }
}
