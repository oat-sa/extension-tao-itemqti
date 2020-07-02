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
 * Copyright (c) 2013-2020 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\qti;

use common_ext_ExtensionsManager;
use Exception;
use InvalidArgumentException;
use oat\tao\model\service\ApplicationService;
use oat\taoQtiItem\model\qti\attribute\Attribute;
use oat\taoQtiItem\model\qti\attribute\AttributeException;
use oat\taoQtiItem\model\qti\exception\QtiModelException;
use oat\taoQtiItem\model\qti\attribute\Generic;
use oat\taoQtiItem\model\qti\container\FlowContainer;
use oat\taoQtiItem\model\qti\attribute\ResponseIdentifier;
use common_Logger;
use ReflectionException;
use taoItems_models_classes_TemplateRenderer;
use ReflectionClass;
use stdClass;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

/**
 * The QTI_Element class represent the abstract model for all the QTI objects.
 * It contains all the attributes of the different kind of QTI objects.
 * It manages the identifiers and serial creation.
 * It provides the serialisation and persistence methods.
 * And give the interface for the rendering.
 *
 * @abstract
 *
 * @access  public
 * @author  Sam, <sam@taotesting.com>
 * @package taoQTI
 */
abstract class Element implements Exportable
{
    use ServiceLocatorAwareTrait;

    /**
     * @var string
     */
    protected $serial = '';

    /**
     * @var Item|null
     */
    protected $relatedItem = null;

    /**
     * @var array
     */
    private static $instances = [];

    /**
     * Short description of attribute templatesPath
     *
     * @access protected
     * @var    string
     */
    protected static $templatesPath = '';

    /**
     * the QTI tag name as defined in QTI standard
     *
     * @access protected
     * @var    string
     */
    protected static $qtiTagName = '';

    /**
     * the options of the element
     *
     * @access protected
     * @var    array
     */
    protected $attributes = [];

    public function __construct(array $attributes = [], Item $relatedItem = null, string $serial = '')
    {
        if (!is_null($relatedItem)) {
            $this->setRelatedItem($relatedItem);
        }
        if (!empty($serial)) {
            //try setting object serial manually:
            if (isset(self::$instances[$this->getSerial()])) {
                throw new QtiModelException('the serial must be unique');
            } else {
                $this->serial = $serial;
            }
        } else {
            $this->getSerial(); //generate one
        }

        $this->resetAttributes();

        $this->setAttributes($attributes);

        self::$instances[$this->getSerial()] = $this;
    }

    /**
     * Provide the list of attributes of the Qti Element Class
     */
    abstract protected function getUsedAttributes();

    /**
     * Reset the attributes values  to the default values defined by the standard
     */
    public function resetAttributes(): void
    {
        $this->attributes = [];
        foreach ($this->getUsedAttributes() as $attributeClass) {
            if (
                class_exists($attributeClass)
                && is_subclass_of($attributeClass, 'oat\\taoQtiItem\\model\\qti\\attribute\\Attribute')
            ) {
                $attribute = new $attributeClass();
                $this->attributes[$attribute->getName()] = $attribute;
            } else {
                common_Logger::w('attr does not exists ' . $attributeClass);
            }
        }
    }

    public function getQtiTag(): string
    {
        return static::$qtiTagName;
    }

    /**
     * Remove the actual value of an attribute, distinguish from empty value
     */
    public function removeAttributeValue(string $name): void
    {
        if (isset($this->attributes[$name])) {
            $this->attributes[$name]->setNull();
        }
    }

    /**
     * Set the attributes for the the Qti Element
     * Argument format: array(attributeName => value)
     *
     * @throws AttributeException
     * @throws QtiModelException
     */
    public function setAttributes(array $values): void
    {

        if (is_array($values)) {
            foreach ($values as $name => $value) {
                $this->setAttribute($name, $value);
            }
        } else {
            throw new InvalidArgumentException('"values" must be an array');
        }
    }

    /**
     * Set the value of an attribute
     *
     * @param mixed $value
     *
     * @throws AttributeException
     * @throws QtiModelException
     */
    public function setAttribute($name, $value): bool
    {

        $returnValue = false;

        if (is_null($value)) {
            return $returnValue;
        }

        if (isset($this->attributes[$name])) {
            $datatypeClass = $this->attributes[$name]->getType();
            // check if the attribute needs an element level validation
            if (is_subclass_of($datatypeClass, 'oat\\taoQtiItem\\model\\qti\\datatype\\Identifier')) {
                if ($value instanceof IdentifiedElement) {
                    if ($this->validateAttribute($name, $value)) {
                        $this->attributes[$name]->setValue($value);
                        $returnValue = true;
                    } else {
                        $vr = print_r($value, true);
                        common_Logger::w($vr);
                        throw new InvalidArgumentException('Invalid identifier attribute value');
                    }
                } elseif (is_string($value)) {
                    // try converting to string identifier and search the identified object:
                    $identifier = (string)$value;
                    $elt = $this->getIdentifiedElement($identifier, $datatypeClass::getAllowedClasses());
                    if (!is_null($elt)) {
                        // ok, found among allowed classes
                        $this->attributes[$name]->setValue($elt);
                        $returnValue = true;
                    } else {
                        throw new QtiModelException(
                            'No QTI element with the identifier has been found: ' . $identifier
                        );
                    }
                }
            } else {
                $this->attributes[$name]->setValue($value);
                $returnValue = true;
            }
        } else {
            $this->attributes[$name] = new Generic($value);
            $returnValue = true;
        }

        return $returnValue;
    }

    /**
     * Validate an attribute of the element, at the element level
     * (the validator of the attributes are on the attribute level)
     *
     * @param mixed $value
     *
     * @throws QtiModelException
     */
    public function validateAttribute(string $name, $value = null): bool
    {
        $returnValue = false;

        if (isset($this->attributes[$name])) {
            if (is_null($value)) {
                $value = $this->attributes[$name]->getValue();
            }

            $datatypeClass = $this->attributes[$name]->getType();
            if (is_subclass_of($datatypeClass, 'oat\\taoQtiItem\\model\\qti\\datatype\\Identifier')) {
            } else {
                $returnValue = $datatypeClass::validate($value);
            }

            if (is_subclass_of($datatypeClass, 'oat\\taoQtiItem\\model\\qti\\datatype\\Identifier')) {
                if ($datatypeClass::validate($value)) {
                    // validate itentifier
                    $relatedItem = $this->getRelatedItem();
                    if (!is_null($relatedItem)) {
                        $idCollection = $relatedItem->getIdentifiedElements();
                        if ($value instanceof IdentifiedElement && $idCollection->exists($value->getIdentifier())) {
                            $returnValue = true;
                        }
                    } else {
                        common_Logger::w('iden');
                        throw new QtiModelException(
                            'Cannot verify identifier reference because the element is not in a QTI Item '
                            . get_class($this)
                            . '::'
                            . $name,
                            0
                        );
                    }
                }
            } else {
                $returnValue = $datatypeClass::validate($value);
            }
        } else {
            throw new InvalidArgumentException('no attribute found with the name "' . $name . '"');
        }

        return $returnValue;
    }

    /**
     * Find the identified object corresponding to the identifier string
     * The optional argument $elementClasses search a specific QTI element class
     */
    public function getIdentifiedElement(string $identifier, array $elementClasses = []): IdentifiedElement
    {
        $returnValue = null;

        if (!is_array($elementClasses)) {
            throw new InvalidArgumentException('elementClasses must be an array');
        }

        $relatedItem = $this->getRelatedItem();

        if (!is_null($relatedItem)) {
            $identifiedElementsCollection = $relatedItem->getIdentifiedElements();

            if (empty($elementClasses)) {
                $returnValue = $identifiedElementsCollection->getUnique($identifier);
            } else {
                foreach ($elementClasses as $elementClass) {
                    $returnValue = $identifiedElementsCollection->getUnique($identifier, $elementClass);
                    if (!is_null($returnValue)) {
                        break;
                    }
                }
            }
        }

        return $returnValue;
    }

    /**
     * Check if an attribute exists within the Qti Element
     */
    public function hasAttribute(string $name): bool
    {
        return isset($this->attributes[$name]);
    }

    /**
     * Short handy method to get/set an attribute value
     *
     * @param mixed $value
     *
     * @return mixed
     *
     * @throws QtiModelException
     * @throws AttributeException
     */
    public function attr(string $name, $value = null)
    {
        if (is_null($value)) {
            return $this->getAttributeValue($name);
        } else {
            return $this->setAttribute($name, $value);
        }
    }

    /**
     * Add a CSS class to the item body
     *
     * @author Dieter Raber <dieter@taotesting.com>
     *
     * @param $className one or more class names, separated by space
     *
     * @throws QtiModelException
     * @throws AttributeException
     */
    public function addClass(string $className): void
    {
        $oldClassName = $this->getAttributeValue('class');
        $oldClassNameArr = $oldClassName ? explode(' ', $oldClassName) : [];
        $classNameArr = array_merge($oldClassNameArr, explode(' ', $className));
        // housekeeping
        $classNameArr = array_unique(array_filter(array_map('trim', $classNameArr)));
        $this->setAttribute('class', implode(' ', $classNameArr));
    }

    /**
     * Add a CSS class from the item body
     *
     * @author Dieter Raber <dieter@taotesting.com>
     */
    public function removeClass(string $className): void
    {
        $oldClassName = $this->getAttributeValue('class');
        $oldClassNameArr = $oldClassName ? explode(' ', $oldClassName) : [];
        unset($oldClassNameArr[array_search($className, $oldClassNameArr)]);
        $this->setAttribute('class', implode(' ', $oldClassNameArr));
    }

    /**
     * Get the attribute as an Attribute object
     */
    protected function getAttribute(string $name): Attribute
    {
        return $this->hasAttribute($name) ? $this->attributes[$name] : null;
    }

    /**
     * Get the attribute's actual value (not as an Attribute object)
     *
     * @return mixed
     */
    public function getAttributeValue(string $name)
    {
        $returnValue = null;
        if ($this->hasAttribute($name)) {
            $returnValue = $this->attributes[$name]->getValue();
        }
        return $returnValue;
    }

    /**
     * Get all attributes' values
     */
    public function getAttributeValues(bool $filterNull = true): array
    {
        $returnValue = [];
        foreach ($this->attributes as $name => $attribute) {
            if (!$filterNull || !$attribute->isNull()) {
                $returnValue[$name] = $attribute->getValue();
            }
        }
        return $returnValue;
    }

    /**
     * Get the placeholder of the Qti Element to used in a Container
     *
     * @see oat\taoQtiItem\model\qti\container\Container
     */
    public function getPlaceholder(): string
    {
        return '{{' . $this->getSerial() . '}}';
    }

    /**
     * Get the absolute path of the template of the qti.xml
     *
     * @throws QtiModelException
     */
    public static function getTemplateQti(): string
    {
        if (empty(static::$qtiTagName)) {
            throw new QtiModelException('The element has no tag name defined : ' . get_called_class());
        }
        $template = static::getTemplatePath() . '/qti.' . static::$qtiTagName . '.tpl.php';
        if (!file_exists($template)) {
            $template = static::getTemplatePath() . '/qti.element.tpl.php';
        }

        return $template;
    }

    /**
     * Get the variables to be used in the qti.xml template
     */
    protected function getTemplateQtiVariables(): array
    {
        $variables = [];
        $variables['tag'] = static::$qtiTagName;
        $variables['attributes'] = $this->getAttributeValues();
        if ($this instanceof FlowContainer) {
            $variables['body'] = $this->getBody()->toQTI();
        }

        return $variables;
    }

    /**
     * Export the data to the QTI XML format
     *
     * @throws Exception
     */
    public function toQTI(): string
    {
        $template = static::getTemplateQti();
        $variables = $this->getTemplateQtiVariables();
        if (isset($variables['attributes'])) {
            $variables['attributes'] = $this->xmlizeOptions($variables['attributes'], true);
        }
        $tplRenderer = new taoItems_models_classes_TemplateRenderer($template, $variables);

        return $tplRenderer->render();
    }

    /**
     * Get the array representation of the Qti Element.
     * Particularly helpful for data transformation, e.g. json
     *
     * @param $filterVariableContent
     * @param array $filtered
     *
     * @return array
     */
    public function toArray($filterVariableContent = false, &$filtered = [])
    {

        $data = [];
        $data['serial'] = $this->getSerial();
        $tag = $this->getQtiTag();
        if (!empty($tag)) {
            $data['qtiClass'] = $tag;
        }
        $attributes = $this->getAttributeValues();
        $data['attributes'] = empty($attributes) ? new StdClass() : $attributes;

        if ($this instanceof FlowContainer) {
            $data['body'] = $this->getBody()->toArray($filterVariableContent, $filtered);
        }

        if ($this->getApplicationService()->isDebugMode()) {
            //in debug mode, add debug data, such as the related item
            $data['debug'] = ['relatedItem' => is_null($this->getRelatedItem()) ? '' : $this->getRelatedItem()->getSerial()];
        }

        return $data;
    }

    /**
     * Get the main template directory
     *
     * @access public
     * @author Sam, <sam@taotesting.com>
     */
    public static function getTemplatePath(): string
    {
        if (empty(self::$templatesPath)) {
            $dir = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem')->getDir();
            self::$templatesPath = $dir . 'model/qti/templates/';
        }
        $returnValue = self::$templatesPath;

        return $returnValue;
    }

    /**
     * Set the item the current Qti Element belongs to.
     * The related item assignment is propagated to all containing Qti Element of the current one.
     * The "force" option allows changing the associated item (even if it has already been defined)
     *
     * @throws QtiModelException*
     * @throws ReflectionException
     */
    public function setRelatedItem(Item $item, bool $force = false): bool
    {
        $returnValue = false;

        if (!is_null($this->relatedItem) && $this->relatedItem->getSerial() == $item->getSerial()) {
            $returnValue = true; // identical
        } elseif (!$force && !is_null($this->relatedItem)) {
            throw new QtiModelException('attempt to change item reference for a QTI element');
        } else {
            // propagate the assignation of item to all included objects
            $reflection = new ReflectionClass($this);
            foreach ($reflection->getProperties() as $property) {
                if (!$property->isStatic() && !$property->isPrivate()) {
                    $propertyName = $property->getName();
                    $value = $this->$propertyName;
                    if (is_array($value)) {
                        foreach ($value as $subvalue) {
                            if (is_object($subvalue) && $subvalue instanceof Element) {
                                $subvalue->setRelatedItem($item);
                            } elseif (is_object($subvalue) && $subvalue instanceof ResponseIdentifier) {
                                // manage the reference of identifier
                                $idenfierBaseType = $subvalue->getValue(true);
                                if (!is_null($idenfierBaseType)) {
                                    $idenfierBaseType->getReferencedObject()->setRelatedItem($item);
                                }
                            }
                        }
                    } elseif (is_object($value) && $value instanceof Element) {
                        $value->setRelatedItem($item);
                    }
                }
            }

            // set item reference to current object
            $this->relatedItem = $item;

            $returnValue = true;
        }

        return $returnValue;
    }

    /**
     * Recursively get all Qti Elements contained within the current Qti Element
     *
     * @throws ReflectionException
     */
    public function getComposingElements(string $className = ''): array
    {

        $returnValue = [];
        if ($className === '') {
            $className = 'oat\taoQtiItem\model\qti\Element';
        }

        $reflection = new ReflectionClass($this);
        foreach ($reflection->getProperties() as $property) {
            if (!$property->isStatic() && !$property->isPrivate()) {
                $propertyName = $property->getName();
                if ($propertyName != 'relatedItem') {
                    $value = $this->$propertyName;
                    if (is_array($value)) {
                        foreach ($value as $subvalue) {
                            if ($subvalue instanceof Element) {
                                if ($subvalue instanceof $className) {
                                    $returnValue[$subvalue->getSerial()] = $subvalue;
                                }
                                $returnValue = array_merge($returnValue, $subvalue->getComposingElements($className));
                            }
                        }
                    } else {
                        if ($value instanceof Element) {
                            if ($value instanceof $className) {
                                if ($value->getSerial() != $this->getSerial()) {
                                    $returnValue[$value->getSerial()] = $value;
                                }
                            }
                            $returnValue = array_merge($returnValue, $value->getComposingElements($className));
                        }
                    }
                }
            }
        }

        return $returnValue;
    }

    /**
     * Get the Qti Item the current Qti Element belongs to
     */
    public function getRelatedItem(): Item
    {
        return $this->relatedItem;
    }

    /**
     * This method enables you to build a string of attributes for an xml node
     * from the Qti Element attributes according to their types.
     *
     * @access protected
     * @author Sam, <sam@taotesting.com>
     */
    protected function xmlizeOptions(array $formalOpts = [], bool $recursive = false): string
    {
        $returnValue = '';
        if (!is_array($formalOpts)) {
            throw new InvalidArgumentException('formalOpts must be an array, ' . gettype($formalOpts) . ' given');
        }

        $options = (!$recursive) ? $this->getAttributeValues() : $formalOpts;
        foreach ($options as $key => $value) {
            if (is_string($value) || is_numeric($value)) {
                // str_replace is unicode safe...
                $returnValue .= ' ' . $key . '="' . str_replace(
                    [
                        '&',
                        '<',
                        '>',
                        '\'',
                        '"',
                    ],
                    [
                        '&amp;',
                        '&lt;',
                        '&gt;',
                        '&apos;',
                        '&quot;',
                    ],
                    $value
                ) . '"';
            }
            if (is_bool($value)) {
                $returnValue .= ' ' . $key . '="' . (($value) ? 'true' : 'false') . '"';
            }
            if (is_array($value)) {
                if (count($value) > 0) {
                    $keys = array_keys($value);
                    if (is_int($keys[0])) { // repeat the attribute key
                        $returnValue .= ' ' . $key . '="' . implode(' ', array_values($value)) . '"';
                    } else {
                        $returnValue .= $this->xmlizeOptions($value, true);
                    }
                }
            }
        }

        return $returnValue;
    }

    /**
     * Obtain a serial for the instance of the class that implements the
     *
     * @access public
     * @author Jerome Bogaerts, <jerome.bogaerts@tudor.lu>
     */
    public function getSerial(): string
    {
        if (empty($this->serial)) {
            $this->serial = $this->buildSerial();
        }

        return $this->serial;
    }

    /**
     * create a unique serial number
     *
     * @access protected
     * @author Sam, <sam@taotesting.com>
     */
    protected function buildSerial(): string
    {
        if ($this->getApplicationService()->isDebugMode()) {
            //in debug mode, use more meaningful serials
            $clazz = strtolower(get_class($this));
            $prefix = substr($clazz, strpos($clazz, 'taoqtiitem\\model\\qti\\') + 21) . '_';
            $serial = str_replace('.', '', uniqid($prefix, true));
            $serial = str_replace('\\', '_', $serial);
        } else {
            //build a short unique id for memory saving
            $serial = uniqid('i');
        }

        return (string)$serial;
    }

    protected function getArraySerializedElementCollection(
        array $elements,
        bool $filterVariableContent = false,
        array &$filtered = []
    ): array {
        if (empty($elements)) {
            $data = new stdClass();
        } else {
            $data = [];
            foreach ($elements as $element) {
                $data[$element->getSerial()] = $element->toArray($filterVariableContent, $filtered);
            }
        }
        return $data;
    }

    protected function getArraySerializedPrimitiveCollection(array $elements): array
    {
        if (empty($elements)) {
            $data = new stdClass();
        } else {
            $data = [];
            foreach ($elements as $key => $value) {
                if (is_array($value)) {
                    $data[$key] = $this->getArraySerializedPrimitiveCollection($value);
                } else {
                    $data[$key] = $value;
                }
            }
        }
        return $data;
    }

    private function getApplicationService(): ApplicationService
    {
        return $this->getServiceLocator()->get(ApplicationService::SERVICE_ID);
    }
}
