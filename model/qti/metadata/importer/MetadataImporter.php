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

namespace oat\taoQtiItem\model\qti\metadata\importer;

use oat\tao\model\metadata\exception\MetadataImportException;
use oat\taoQtiItem\model\qti\metadata\AbstractMetadataService;
use oat\taoQtiItem\model\qti\metadata\MetadataClassLookup;
use oat\taoQtiItem\model\qti\metadata\MetadataClassLookupClassCreator;
use oat\taoQtiItem\model\qti\metadata\MetadataGuardian;
use oat\taoQtiItem\model\qti\metadata\ContextualMetadataGuardian;
use oat\taoQtiItem\model\qti\metadata\MetadataService;
use oat\taoQtiItem\model\qti\metadata\MetadataValidator;
use oat\taoQtiItem\model\qti\metadata\simple\SimpleMetadataValue;

class MetadataImporter extends AbstractMetadataService
{
    /**
     * Config key to store guardians classes
     */
    public const GUARDIAN_KEY     = 'guardians';

    /**
     * Config key to store classLookup classes
     */
    public const CLASS_LOOKUP_KEY = 'classLookups';

    /**
     * Config key to store validator classes
     */
    public const VALIDATOR_KEY = 'validators';

    /**
     * Extract metadata value from a DomManifest
     *
     * {@inheritdoc}
     */
    public function extract($domManifest)
    {
        if (! $domManifest instanceof \DOMDocument) {
            throw new MetadataImportException(
                __('Metadata import requires an instance of DomManifest to extract metadata')
            );
        }
        return parent::extract($domManifest);
    }

    /**
     * Inject an identified metadata value to a resource
     *
     * {@inheritdoc}
     */
    public function inject($identifier, $resource)
    {
        if (! $resource instanceof \core_kernel_classes_Resource) {
            throw new MetadataImportException(
                __('Metadata import requires an instance of core_kernel_classes_Resource to inject metadata')
            );
        }
        parent::inject($identifier, $resource);
    }

    /**
     * Guard a metadata identifier at import
     *
     * Guard a metadata identifier by calling guard method of each guardians
     * If guardians have no reason to stop process, true is returned
     * If a guardian does not allow the import, the target guardian is returned
     *
     * @param $identifier
     * @return bool
     */
    public function guard($identifier, $context = '')
    {
        foreach ($this->getGuardians() as $guardian) {
            if ($guardian instanceof ContextualMetadataGuardian && $guardian->getContext() !== $context) {
                continue;
            }

            if ($this->hasMetadataValue($identifier)) {
                \common_Logger::i(__('Guard for resource "%s"...', $identifier));
                if (($guard = $guardian->guard($this->getMetadataValue($identifier))) !== false) {
                    return $guard;
                }
            }
        }
        return false;
    }

    /**
     * Lookup classes for a metadata identifier at import
     *
     * Lookup classes for a metadata identifier by calling lookup method of each classLookup
     * If no lookup has been triggered, false is returned
     * If a lookup has been triggered, classLookup could apply his own process
     * Specific should be applied here, like get created classes
     * CreatedClasses params could be updated
     *
     * @param $identifier
     * @param $createdClasses
     * @return bool
     */
    public function classLookUp($identifier, &$createdClasses)
    {
        $targetClass = false;
        foreach ($this->getClassLookUp() as $classLookup) {
            if ($this->hasMetadataValue($identifier)) {
                \common_Logger::i(__('Target Class Lookup for resource "%s"...', $identifier));
                if (($targetClass = $classLookup->lookup($this->getMetadataValue($identifier))) !== false) {
                    \common_Logger::i(
                        // phpcs:disable Generic.Files.LineLength
                        __('Class Lookup Successful. Resource "%s" will be stored in RDFS Class "%s".', $identifier, $targetClass->getUri())
                        // phpcs:enable Generic.Files.LineLength
                    );

                    if ($classLookup instanceof MetadataClassLookupClassCreator) {
                        $createdClasses = $classLookup->createdClasses();
                    }

                    break;
                }
            }
        }
        return $targetClass;
    }

    /**
     * @param $identifier
     * @return \common_report_Report
     */
    public function validate($identifier)
    {
        $report = new \common_report_Report(\common_report_Report::TYPE_SUCCESS);
        foreach ($this->getValidators() as $validator) {
            $report = $validator->validate($this->getMetadataValue($identifier));
            if ($report->getType() === \common_report_Report::TYPE_ERROR) {
                break;
            }
        }
        return $report;
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
     */
    public function register($key, $name)
    {
        if (empty($key) || empty($name)) {
            throw new \InvalidArgumentException(__('Register method expects $key and $name parameters.'));
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
            case self::VALIDATOR_KEY:
                $this->registerInstance(self::VALIDATOR_KEY, $name, MetadataValidator::class);
                return true;
                break;
        }
        return parent::register($key, $name);
    }

    /**
     * Unregister an instances
     *
     * Look for GUARDIAN OR CLASS_LOOKUP key, otherwise fallback to parent
     *
     * @param string $key
     * @param string $name
     * @return bool
     * @throws \common_Exception
     */
    public function unregister($key, $name)
    {
        if (empty($key) || empty($name)) {
            throw new \common_Exception(__('Unregister method expects $key and $name parameters.'));
        }

        if (is_object($name)) {
            $name = get_class($name);
        }

        switch ($key) {
            case self::GUARDIAN_KEY:
                $this->unregisterInstance(self::GUARDIAN_KEY, $name);
                return true;
                break;
            case self::CLASS_LOOKUP_KEY:
                $this->unregisterInstance(self::CLASS_LOOKUP_KEY, $name);
                return true;
                break;
        }
        return parent::unregister($key, $name);
    }

    public function metadataValueUris($metadata): array
    {
        $metadataUriList = [];
        foreach ($metadata as $resourceIdentifier => $metadataValueCollection) {
            foreach ($metadataValueCollection as $metadataValue) {
                if (!$metadataValue instanceof SimpleMetadataValue) {
                    continue;
                }
                $uri = $metadataValue->getPath()[1];
                if (!empty($uri)) {
                    $metadataUriList[] = $uri;
                }
            }
        }

        return array_unique($metadataUriList);
    }

    /**
     * Allow to register, into the config, the current importer service
     */
    protected function registerMetadataService()
    {
        if ($this->getServiceLocator()->has(MetadataService::SERVICE_ID)) {
            $metadataService = $this->getServiceLocator()->get(MetadataService::SERVICE_ID);
        } else {
            $metadataService = $this->getServiceManager()->build(MetadataService::class);
        }
        $metadataService->setOption(MetadataService::IMPORTER_KEY, $this);
        $this->getServiceManager()->register(MetadataService::SERVICE_ID, $metadataService);
    }

    /**
     * Return all guardians stored into config
     *
     * @return MetadataGuardian[]
     */
    protected function getGuardians()
    {
        return $this->getInstances(self::GUARDIAN_KEY, MetadataGuardian::class);
    }

    /**
     * Return all classLookup stored into config
     *
     * @return MetadataClassLookup[]
     */
    protected function getClassLookUp()
    {
        return $this->getInstances(self::CLASS_LOOKUP_KEY, MetadataClassLookup::class);
    }

    /**
     * Return all validators stored into config
     *
     * @return MetadataValidator[]
     */
    protected function getValidators()
    {
        return $this->getInstances(self::VALIDATOR_KEY, MetadataValidator::class);
    }
}
