<?php
/**
 * Created by PhpStorm.
 * User: chris
 * Date: 01/09/16
 * Time: 16:22
 */

namespace oat\taoQtiItem\model\portableElement\base\asset;


abstract class AbstractPortableElementAsset
{

    /**
     * @var string mimeType
     */
    protected $type;

    /**
     * @var string
     */
    protected $fileName;

    /**
     * @var string
     */
    protected $path;

    /**
     * @var resource
     */
    protected $stream;

}