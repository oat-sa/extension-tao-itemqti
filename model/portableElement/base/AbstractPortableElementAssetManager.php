<?php
/**
 * Created by PhpStorm.
 * User: chris
 * Date: 01/09/16
 * Time: 16:19
 */

namespace oat\taoQtiItem\model\portableElement\base;


use oat\taoQtiItem\model\portableElement\base\asset\AbstractPortableElementAsset;
use oat\taoQtiItem\model\portableElement\base\helper\FileSystemAwareInterface;
use oat\taoQtiItem\model\portableElement\base\helper\FileSystemAwareTrait;

abstract class AbstractPortableElementAssetManager implements FileSystemAwareInterface
{

    use FileSystemAwareTrait;

    protected $assets = [];

    abstract public function add(AbstractPortableElementAsset $asset);

    abstract public function getContent($path);

    abstract public function save();

}