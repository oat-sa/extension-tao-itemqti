<?php

namespace oat\taoQtiItem\model\qti\metadata\importer;

use oat\taoQtiItem\model\qti\metadata\AbstractMetadataService;
use oat\taoQtiItem\model\qti\metadata\MetadataClassLookup;
use oat\taoQtiItem\model\qti\metadata\MetadataClassLookupClassCreator;
use oat\taoQtiItem\model\qti\metadata\MetadataGuardian;
use oat\taoQtiItem\model\qti\metadata\MetadataService;

class MetadataImporter extends AbstractMetadataService
{
    const GUARDIAN_KEY     = 'guardians';
    const CLASS_LOOKUP_KEY = 'classLookups';

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

    public function register($key, $name)
    {
        if (empty($key) || empty($name)) {
            throw new \common_Exception();
        }

        if (is_object($name)) {
            $name = get_class($name);
        }

        switch ($key) {
            case self::GUARDIAN_KEY:
                $this->registerInstance(self::GUARDIAN_KEY, $name, MetadataGuardian::class);
                return true;
                break;
            case self::CLASS_LOOKUP_KEY:
                $this->registerInstance(self::CLASS_LOOKUP_KEY, $name, MetadataClassLookup::class);
                return true;
                break;
        }
        return parent::register($key, $name);
    }

    protected function registerService()
    {
        if ($this->getServiceLocator()->has(MetadataService::SERVICE_ID)) {
            $metadataService = $this->getServiceLocator()->get(MetadataService::SERVICE_ID);
        } else {
            $metadataService = $this->getServiceManager()->build(MetadataService::class);
        }
        $metadataService->setOption(MetadataService::IMPORTER_KEY, $this);
        $this->getServiceManager()->register(MetadataService::SERVICE_ID, $metadataService);
    }

    protected function getGuardians()
    {
        return $this->getInstances(self::GUARDIAN_KEY, MetadataGuardian::class);
    }

    protected function getClassLookUp()
    {
        return $this->getInstances(self::CLASS_LOOKUP_KEY, MetadataClassLookup::class);
    }
}