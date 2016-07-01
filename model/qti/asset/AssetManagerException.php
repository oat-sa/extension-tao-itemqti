<?php
/**
 * Created by PhpStorm.
 * User: siwane
 * Date: 01/06/2016
 * Time: 09:47
 */

namespace oat\taoQtiItem\model\qti\asset;

class AssetManagerException extends \common_Exception implements \common_exception_UserReadableException
{
    public function getUserMessage()
    {
        return $this->message;
    }
}