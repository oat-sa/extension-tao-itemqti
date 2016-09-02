<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace oat\taoQtiItem\model\portableElement\base;

/**
 * Description of PortableElementFactory
 *
 * @author Christophe GARCIA <christopheg@taotesting.com>
 */
class PortableElementFactory {
    
    /**
     * configuration array contains for each
     * portable element type, associate class name and options
     * @var array 
     */
    protected $typeList = [];
    
    /**
     * set up type list
     * @param array $typeList
     * @return \oat\taoQtiItem\model\portableElement\base\PortableElementFactory
     */
    public function setTypeList(array $typeList) {
        $this->typeList = $typeList;
        return $this;
    }

    /**
     * create a new Portable Element
     * @param string $type
     * @param array $options
     * @return \oat\taoQtiItem\model\portableElement\base\AbstractPortableElement
     */
    public function get($type) {
        if(array_key_exists($type, $this->typeList) && class_exists($this->typeList[$type]['class'])) {
            $className = $this->typeList[$type]['class'];
            $options   = $this->typeList[$type]['options'];
            return new $className($options);
        }
        throw new \oat\taoQtiItem\model\portableElement\common\exception\PortableElementNotFoundException('Unknown type ' . $type . '. Specific extension may be installed. ');
    }
    
}
