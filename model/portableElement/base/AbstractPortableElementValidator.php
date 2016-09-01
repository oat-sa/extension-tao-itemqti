<?php
/**
 * Created by PhpStorm.
 * User: chris
 * Date: 01/09/16
 * Time: 16:11
 */

namespace oat\taoQtiItem\model\portableElement\base;


use oat\oatbox\filesystem\utils\FileSystemWrapperTrait;
use oat\taoQtiItem\model\portableElement\base\helper\FileSystemAwareInterface;

abstract class AbstractPortableElementValidator implements FileSystemAwareInterface
{

    use FileSystemWrapperTrait;

    /**
     * @return boolean
     */
    abstract public function isValid(AbstractPortableElement $element);

}