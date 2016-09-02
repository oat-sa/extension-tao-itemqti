<?php
/**
 * Created by PhpStorm.
 * User: chris
 * Date: 01/09/16
 * Time: 16:02
 */

namespace oat\taoQtiItem\model\portableElement\base;


use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\controller\PortableElement;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementNotFoundException;

class PortableElementService extends ConfigurableService
{
    
    public function __construct($options = array()) {
        
        if(array_key_exists('factory', $options)) {
            
            $this->factory = new $options['factory']['class'];
            $this->factory->setTypeList($options['factory']['options']);
            
            parent::__construct($options);
        }
        
        throw new \InvalidArgumentException('factory must be configured');
    }

        /**
     * @var PortableElementFactory
     */
    protected $factory;

    /**
     * @param $path
     * @return PortableElement
     * @throws PortableElementNotFoundException
     */
    public function getFormPath($type , $path) {
        $portableElement = $this->factory->get($type)->loadFromPath($path);
        return $portableElement;
    }

    /**
     * @param \DOMElement $element
     * @return PortableElement
     * @throws PortableElementNotFoundException
     */
    public function getFormElement($type , \DOMElement $element) {
        $portableElement = $this->factory->get($type)->hydrateFromElement($element);
        return $portableElement;
    }

    /**
     *
     * @param array $data
     * @return PortableElement
     * @throws PortableElementNotFoundException
     */
    public function getFromData($type , array $data) {
        $portableElement = $this->factory->get($type)->hydrateFromData($data);
        return $portableElement;
    }

    /**
     * return an empty PortableElement
     * @param string $type
     * @return PortableElement
     * @throws PortableElementNotFoundException
     */
    public function get($type) {
        return $this->factory->get($type);
    }

}