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

namespace oat\taoQtiItem\model\qti\metadata;

use common_ext_Extension;
use common_ext_ExtensionsManager;
use InvalidArgumentException;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\qti\metadata\importer\MetadataImporter;

/**
 * @deprecated MetadataService should be used to handle export & import
 *
 * MetadataRegistry objects enables you to register/unregister
 * MetadataExtractor and MetadataInjector objects to be used
 * in various situations accross the platform.
 *
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 * @see oat\taoQtiItem\model\qti\metadata\MetadataExtractor The MetadataExtractor interface.
 * @see oat\taoQtiItem\model\qti\metadata\MetadataInjector The MetadataInjector interface.
 */
class MetadataRegistry
{
    /**
     * The key to be used in configuration to retrieve
     * or set the class mapping.
     *
     * @var string
     */
    public const CONFIG_ID = 'metadata_registry';

    /**
     * A pointer to the taoQtiItem extension
     *
     * @var \common_ext_Extension
     */
    protected $extension;

    /**
     * Create a new MetadataRegistry object.
     *
     */
    public function __construct()
    {
        $this->setExtension(common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem'));
    }

    /**
     * Set the extension to be used to store the mapping in configuration.
     *
     * @param common_ext_Extension $extension
     */
    protected function setExtension(common_ext_Extension $extension)
    {
        $this->extension = $extension;
    }

    /**
     * Get the extension to be used to store the mapping configuration.
     *
     * @return common_ext_Extension
     */
    protected function getExtension()
    {
        return $this->extension;
    }

    /**
     * @deprecated Use MetadataService->getImporter() instead to have access to specific instance of metadataImporter
     *
     * Get the class mapping of Extractor/Injector classes.
     *
     * @return array An associative array with two main keys. The 'injectors' and 'extractors' and 'guardians' keys
     *               refer to sub-arrays containing respectively classnames of MetadataInjector and MetadataExtractor
     *               implementations.
     */
    public function getMapping()
    {
        $instances = $this->getServiceManager()
            ->get(MetadataService::SERVICE_ID)
            ->getImporter()
            ->getOptions();

        $mapping = [];
        foreach ($instances as $key => $helpers) {
            if (! isset($mapping[$key])) {
                $mapping[$key] = [];
            }
            foreach ($helpers as $instance) {
                $mapping[$key][] = get_class($instance);
            }
        }

        return $mapping;
    }

    /**
     * @deprecated use MetadataService->getImporter()->registerService() instead
     *
     * Set the class mapping of Extractor/Injector classes.
     *
     * @param array $mapping An associative array with two main keys. The 'injectors' and 'extractors' keys refer
     *                       to sub-arrays containing respectively classnames of MetadataInjector and MetadataExtractor
     *                       implementations.
     */
    protected function setMapping(array $mapping)
    {
        /** @var MetadataService $metadataService */
        $metadataService = $this->getServiceManager()->get(MetadataService::SERVICE_ID);

        $importer = $metadataService->getImporter();
        $importer->setOptions($mapping);

        $metadataService->setOption(MetadataService::IMPORTER_KEY, $importer);
        $this->getServiceManager()->register(MetadataService::SERVICE_ID, $metadataService);
    }

    /**
     * @deprecated use MetadataService->getImporter()->register(MetadataImport::INJECTOR_KEY, $fqcn)
     *
     * Register a MetadataInjector implementation by $fqcn (Fully Qualified Class Name).
     *
     * @param string $fqcn A Fully Qualified Class Name.
     * @throws InvalidArgumentException If the given $fqcn does not correspond to an implementation of the
     *                                  MetadataInjector interface.
     * @see oat\taoQtiItem\model\qti\metadata\MetadataInjector The MetadataInjector interface.
     */
    public function registerMetadataInjector($fqcn)
    {
        $this->getServiceManager()
            ->get(MetadataService::SERVICE_ID)
            ->getImporter()
            ->register(MetadataImporter::INJECTOR_KEY, $fqcn);
    }

    /**
     * @deprecated use MetadataService->getImporter()->unregister(MetadataImport::INJECTOR_KEY, $fqcn)
     *
     * Unregister a MetadataInjector implementation by $fqcn (Fully Qualified Class Name).
     *
     * @param string $fqcn A Fully Qualified Class Name.
     * @see oat\taoQtiItem\model\qti\metadata\MetadataInjector The MetadataInjector interface.
     */
    public function unregisterMetadataInjector($fqcn)
    {
        $this->getServiceManager()
            ->get(MetadataService::SERVICE_ID)
            ->getImporter()
            ->unregister(MetadataImporter::INJECTOR_KEY, $fqcn);
    }

    /**
     * @deprecated use MetadataService->getImporter()->register(MetadataImport::EXTRACTOR_KEY, $fqcn)
     *
     * Register a MetadataExtractor implementation by $fqcn (Fully Qualified Class Name).
     *
     * @param string $fqcn A Fully Qualified Class Name.
     * @throws InvalidArgumentException If the given $fqcn does not correspond to an implementation of the
     *                                  MetadataExtractor interface.
     * @see oat\taoQtiItem\model\qti\metadata\MetadataExtractor The MetadataExtractor interface.
     */
    public function registerMetadataExtractor($fqcn)
    {
        $this->getServiceManager()
            ->get(MetadataService::SERVICE_ID)
            ->getImporter()
            ->register(MetadataImporter::EXTRACTOR_KEY, $fqcn);
    }

    /**
     * @deprecated use MetadataService->getImporter()->unregister(MetadataImport::EXTRACTOR_KEY, $fqcn)
     *
     * Unregister a MetadataExtractor implementation by $fqcn (Fully Qualified Class Name).
     *
     * @param string $fqcn A Fully Qualified Class Name.
     * @see oat\taoQtiItem\model\qti\metadata\MetadataExtractor The MetadataExtractor interface.
     */
    public function unregisterMetadataExtractor($fqcn)
    {
        $this->getServiceManager()
            ->get(MetadataService::SERVICE_ID)
            ->getImporter()
            ->unregister(MetadataImporter::EXTRACTOR_KEY, $fqcn);
    }

    /**
     * @deprecated use MetadataService->getImporter()->register(MetadataImport::GUARDIAN_KEY, $fqcn)
     *
     * Register a MetadataGuardian implementation by $fqcn (Fully Qualified Class Name).
     *
     * @param string $fqcn A Fully Qualified Class Name.
     * @throws InvalidArgumentException If the given $fqcn does not correspond to an implementation of the
     *                                  MetadataGuardian interface.
     * @see oat\taoQtiItem\model\qti\metadata\MetadataGuardian The MetadataExtractor interface.
     */
    public function registerMetadataGuardian($fqcn)
    {
        $this->getServiceManager()
            ->get(MetadataService::SERVICE_ID)
            ->getImporter()
            ->register(MetadataImporter::GUARDIAN_KEY, $fqcn);
    }

    /**
     * @deprecated use MetadataService->getImporter()->unregister(MetadataImport::GUARDIAN_KEY, $fqcn)
     *
     * Unregister a MetadataGuardian implementation by $fqcn (Fully Qualified Class Name).
     *
     * @param string $fqcn A Fully Qualified Class Name.
     * @see oat\taoQtiItem\model\qti\metadata\MetadataGuardian The MetadataGuardian interface.
     */
    public function unregisterMetadataGuardian($fqcn)
    {
        $this->getServiceManager()
            ->get(MetadataService::SERVICE_ID)
            ->getImporter()
            ->unregister(MetadataImporter::GUARDIAN_KEY, $fqcn);
    }

    /**
     * @deprecated use MetadataService->getImporter()->register(MetadataImport::CLASS_LOOKUP_KEY, $fqcn)
     *
     * Register a MetadataClassLookup implementation by $fqcn (Fully Qualified Class Name).
     *
     * @param string $fqcn A Fully Qualified Class Name.
     * @throws InvalidArgumentException If the given $fqcn does not correspond to an implementation of the
     *                                  MetadataClassLookup interface.
     * @see oat\taoQtiItem\model\qti\metadata\MetadataClassLookup The MetadataClassLookup interface.
     */
    public function registerMetadataClassLookup($fqcn)
    {
        $this->getServiceManager()
            ->get(MetadataService::SERVICE_ID)
            ->getImporter()
            ->register(MetadataImporter::CLASS_LOOKUP_KEY, $fqcn);
    }

    /**
     * @deprecated use MetadataService->getImporter()->unregister(MetadataImport::CLASS_LOOKUP_KEY, $fqcn)
     *
     * Unregister a MetadataClassLookup implementation by $fqcn (Fully Qualified Class Name).
     *
     * @param string $fqcn A Fully Qualified Class Name.
     * @see oat\taoQtiItem\model\qti\metadata\MetadataClassLookup The MetadataClassLookup interface.
     */
    public function unregisterMetadataClassLookup($fqcn)
    {
        $this->getServiceManager()
            ->get(MetadataService::SERVICE_ID)
            ->getImporter()
            ->unregister(MetadataImporter::CLASS_LOOKUP_KEY, $fqcn);
    }

    protected function getServiceManager()
    {
        return ServiceManager::getServiceManager();
    }
}
