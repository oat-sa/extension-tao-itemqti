<?php
/**
 * Created by PhpStorm.
 * User: chris
 * Date: 01/09/16
 * Time: 16:03
 */

namespace oat\taoQtiItem\model\portableElement\base;


use League\Flysystem\AdapterInterface;
use oat\oatbox\filesystem\utils\FileSystemWrapperTrait;
use oat\taoQtiItem\model\portableElement\base\helper\fileSystemAwareInterface;

abstract class AbstractPortableElementExporter implements FileSystemAwareInterface
{

    use FileSystemWrapperTrait;

    abstract public function export(AbstractPortableElement $element);

}