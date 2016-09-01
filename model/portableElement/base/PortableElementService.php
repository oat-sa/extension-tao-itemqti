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
    /**
     * @var
     */
    protected $factory;

    /**
     * @param $path
     * @return PortableElement
     * @throws PortableElementNotFoundException
     */
    public function getFormPath($path) {

    }

    /**
     * @param \DOMElement $element
     */
    public function getFormElement(\DOMElement $element) {

    }

    /**
     *
     * @param array $data
     * @return PortableElement
     * @throws PortableElementNotFoundException
     */
    public function getFromData(array $data) {

    }

    /**
     * return an empty PortableElement
     * @param string $type
     * @return PortableElement
     * @throws PortableElementNotFoundException
     */
    public function get($type) {

    }

}