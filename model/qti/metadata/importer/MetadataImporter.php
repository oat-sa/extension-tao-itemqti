<?php

namespace oat\taoQtiItem\model\qti\metadata\importer;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\qti\metadata\MetadataClassLookupClassCreator;
use oat\taoQtiItem\model\qti\metadata\MetadataService;

class MetadataImporter extends ConfigurableService
{
    const GUARDIAN_KEY     = 'guardians';
    const CLASS_LOOKUP_KEY = 'classLookups';

    protected $metadataValues;

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

    protected function hasMetadataValue($identifier)
    {
        return array_key_exists($identifier, $this->getMetadataValues());
    }

    protected function getMetadataValue($identifier)
    {
        $metadata = $this->getMetadataValues();
        return isset($metadata[$identifier]) ? $metadata[$identifier] : null;
    }

    public function guard($identifier)
    {
        foreach ($this->getGuardians() as $guardian) {
            if ($this->hasMetadataValue($identifier)) {
                \common_Logger::i('Guard for resource "' . $identifier . '" ...');
                if (($guard = $guardian->guard($this->getMetadataValue($identifier))) !== false) {
                    return $guard;
                }
            }
        }
        return false;
    }

    public function classLookUp($identifier, &$createdClasses)
    {
        $targetClass = false;
        foreach ($this->getClassLookUp() as $classLookup) {
            if ($this->hasMetadataValue($identifier)) {
                \common_Logger::i('Target Class Lookup for resource "' . $identifier . '" ...');
                if (($targetClass = $classLookup->lookup($this->getMetadataValue($identifier))) !== false) {
                    \common_Logger::i('Class Lookup Successful. Resource "' . $identifier . '" will be stored in RDFS Class "' . $targetClass->getUri() . '".');

                    if ($classLookup instanceof MetadataClassLookupClassCreator) {
                        $createdClasses = $classLookup->createdClasses();
                    }

                    break;
                }
            }
        }
        return $targetClass;
    }

    public function extract(\DOMDocument $domManifest)
    {
        $metadata = [];
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

    protected function getGuardians()
    {
        return $this->getHelpers(self::GUARDIAN_KEY);
    }

    protected function getClassLookUp()
    {
        return $this->getHelpers(self::CLASS_LOOKUP_KEY);
    }

    protected function getExtractors()
    {
        return $this->getHelpers(MetadataService::EXTRACTOR_KEY);
    }

    protected function getInjectors()
    {
        return $this->getHelpers(MetadataService::INJECTOR_KEY);
    }

    protected function getHelpers($id, $interface = null)
    {
        $helpers = [];
        if (! $this->hasOption($id)) {
            return $helpers;
        }
        foreach ($this->getOption($id) as $config) {
            $helpers[] = $this->getSubService($config, $interface);
        }
        return $helpers;
    }


}