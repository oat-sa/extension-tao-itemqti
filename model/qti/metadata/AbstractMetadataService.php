<?php

namespace oat\taoQtiItem\model\qti\metadata;

use oat\oatbox\service\ConfigurableService;

abstract class AbstractMetadataService extends ConfigurableService
{
    const INJECTOR_KEY  = 'injectors';
    const EXTRACTOR_KEY = 'extractors';

    protected $metadataValues;
    protected $instances;

    abstract protected function registerService();

    public function extract(\DOMDocument $domManifest)
    {
        $metadata = [];
        \common_Logger::i(print_r($this->getExtractors(), true));
        foreach ($this->getExtractors() as $extractor) {
            $metadata = array_merge($metadata, $extractor->extract($domManifest));
        }
        \common_Logger::i(count($metadata) . ' metadata Values found in manifest by extractor(s).');

        return $metadata;
    }

    public function inject($identifier, \core_kernel_classes_Resource $rdfItem)
    {
        if ($this->hasMetadataValue($identifier)) {
            \common_Logger::i('Preparing Metadata Values for resource "' . $identifier . '"...');
            $values = $this->getMetadataValue($identifier);

            foreach ($this->getInjectors() as $injector) {
                \common_Logger::i('Attempting to inject "' . count($values) . '" metadata values in database ' .
                    ' for resource "' . $identifier . '" with Metadata Injector "' . get_class($injector) . '".');
                $injector->inject($rdfItem, array($identifier => $values));
            }
        }
    }

    public function register($key, $name)
    {
        if (empty($key) || empty($name)) {
            throw new \common_Exception();
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
                throw new \common_Exception('');
        }

        return true;
    }

    public function getMetadataValues()
    {
        if (! $this->metadataValues) {
            throw new \common_Exception(__('Metadata values are not found.'));
        }
        return $this->metadataValues;
    }

    public function setMetadataValues(array $metadataValues)
    {
        $this->metadataValues = $metadataValues;
    }

    protected function registerInstance($key, $name, $interface)
    {
        if (is_a($name, $interface, true)) {
            $instances = $this->getOption($key);
            if (array_search($name, $instances) === false) {
                $instances[] = $name;
                $this->setOption($key, $instances);
                $this->registerService();
            }
        }
    }

    protected function hasMetadataValue($identifier)
    {
        return array_key_exists($identifier, $this->getMetadataValues());
    }

    protected function getMetadataValue($identifier)
    {
        $metadata = $this->getMetadataValues();
        return isset($metadata[$identifier]) ? $metadata[$identifier] : null;
    }

    protected function getExtractors()
    {
        return $this->getInstances(self::EXTRACTOR_KEY, MetadataExtractor::class);
    }

    protected function getInjectors()
    {
        return $this->getInstances(self::INJECTOR_KEY, MetadataInjector::class);
    }

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
                    $this->instances[$id][] = new $instance();
                }
            }
        }
        return $this->instances[$id];
    }
}