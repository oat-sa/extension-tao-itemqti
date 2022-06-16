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
 * Copyright (c) 2014-2022 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

namespace oat\taoQtiItem\model\qti\metadata\ontology;

use oat\oatbox\event\EventManager;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\event\MetadataModified;
use oat\taoQtiItem\model\qti\metadata\MetadataInjector;
use oat\taoQtiItem\model\qti\metadata\MetadataInjectionException;
use common_Logger;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use InvalidArgumentException;
use Psr\Log\LoggerInterface;

class OntologyMetadataInjector implements MetadataInjector
{
    private $injectionRules;

    /** @var EventManager */
    private $eventManager;

    /** @var LoggerInterface */
    private $logger;

    public function __construct(
        LoggerInterface $logger = null,
        EventManager $eventManager = null
    ) {
        $this->eventManager = $eventManager;
        $this->logger = ($logger === null
            ? common_Logger::singleton()->getLogger()
            : $logger);

        $this->setInjectionRules([]);
    }

    public function addInjectionRule(array $path, $propertyUri, $value = null, $ontologyValue = null)
    {
        if (count($path) === 0) {
            throw new InvalidArgumentException(
                'The path argument must be a non-empty array.'
            );
        }

        $injectionRules = $this->getInjectionRules();

        $pathKey = implode('->', $path);
        if (isset($injectionRules[$pathKey]) === false) {
            $injectionRules[$pathKey] = [];
        }

        $injectionRules[$pathKey][] = [$propertyUri, $value, $ontologyValue];
        $this->setInjectionRules($injectionRules);
    }

    protected function setInjectionRules(array $injectionRules)
    {
        $this->injectionRules = $injectionRules;
    }

    protected function getInjectionRules()
    {
        return $this->injectionRules;
    }

    public function inject($target, array $values)
    {
        $this->debug('values = %s', var_export($values, true));
        $this->debug('rules  = %s', var_export($this->getInjectionRules(), true));

        if (!$target instanceof core_kernel_classes_Resource) {
            $msg = "The given target is not an instance of core_kernel_classes_Resource.";
            throw new MetadataInjectionException($msg);
        }

        $data = [];

        foreach ($values as $metadataValues) {
            foreach ($metadataValues as $metadataValue) {
                $lang = $metadataValue->getLanguage() ?: DEFAULT_LANG;

                if (($rule = $this->getRuleByValue($metadataValue->getPath(), $metadataValue->getValue())) !== false) {
                    // Direct Mapping.
                    if (!isset($data[$rule[0]])) {
                        $data[$rule[0]] = [];
                    }
                    if (!isset($data[$rule[0]][$lang])) {
                        $data[$rule[0]][$lang] = [];
                    }

                    $data[$rule[0]][$lang][] = [$rule[2], $metadataValue];
                } elseif (($rule = $this->getRuleByPath($metadataValue->getPath())) !== false) {
                    if (!isset($data[$rule[0]])) {
                        $data[$rule[0]] = [];
                    }
                    if (!isset($data[$rule[0]][$lang])) {
                        $data[$rule[0]][$lang] = [];
                    }

                    $data[$rule[0]][$lang][] = [$metadataValue->getValue(), $metadataValue];
                } else {
                    $this->debug(
                        'No rule for path "%s" and value "%s"',
                        $metadataValue->getPath(),
                        var_export($metadataValue->getValue(), true)
                    );
                }
            }
        }

        $this->debug('data = %s', var_export($values, true));

        // Cleanup impacted metadata, in case the $target is being overwritten.
        foreach ($data as $propertyUri => $perLangData) {
            foreach (array_keys($perLangData) as $lang) {
                $this->debug(
                    'Remove property "%s" resource="%s" language="%s"',
                    $propertyUri,
                    $target->getUri(),
                    $lang
                );

                $target->removePropertyValueByLg(new core_kernel_classes_Property($propertyUri), $lang);
            }
        }

        // Inject new data in Ontology for target.
        //
        $eventManager = $this->getEventManager();
        foreach ($data as $propertyUri => $perLangData) {
            foreach ($perLangData as $lang => $d) {
                foreach ($d as $actualData) {
                    $this->debug(
                        'Set property "%s" value="%s" language="%s"',
                        $propertyUri,
                        $actualData[0],
                        $lang
                    );

                    $target->setPropertyValueByLg(new core_kernel_classes_Property($propertyUri), $actualData[0], $lang);

                    $metadata = $actualData[1]->getPath();
                    $metadataUri = array_pop($metadata);
                    $eventManager->trigger(
                        new MetadataModified($target, $metadataUri, $actualData[1]->getValue())
                    );
                }
            }
        }
    }

    protected function getRuleByValue($path, $value)
    {
        $pathKey = implode('->', $path);
        $rules = $this->getInjectionRules();

        if (isset($rules[$pathKey]) === true) {
            foreach ($rules[$pathKey] as $rule) {
                if ($rule[1] === $value) {
                    return $rule;
                }
            }
        }

        return false;
    }

    protected function getRuleByPath($path)
    {
        $pathKey = implode('->', $path);
        $rules = $this->getInjectionRules();
        if (isset($rules[$pathKey]) === true) {
            return $rules[$pathKey][0];
        }

        return false;
    }

    private function debug(string $message, ...$replacements): void
    {
        $this->logger->info(__CLASS__ . ': ' . vsprintf($message, $replacements));
    }

    private function getEventManager(): EventManager
    {
        if (null === $this->eventManager) {
            $this->eventManager = ServiceManager::getServiceManager()->get(
                EventManager::SERVICE_ID
            );
        }

        return $this->eventManager;
    }
}
