<?php
/**
 * Created by PhpStorm.
 * User: chris
 * Date: 01/09/16
 * Time: 16:09
 */

namespace oat\taoQtiItem\model\portableElement\base;



use oat\taoQtiItem\model\portableElement\base\helper\FileSystemAwareInterface;
use oat\taoQtiItem\model\portableElement\base\helper\FileSystemAwareTrait;

abstract class AbstractPortableElementImporter implements FileSystemAwareInterface
{

    use FileSystemAwareTrait;

    abstract public function import(AbstractPortableElement $element);

}