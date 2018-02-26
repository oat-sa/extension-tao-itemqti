<?php
/*  
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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *               
 * 
 */

namespace oat\taoQtiItem\model;

use League\Flysystem\AwsS3v3\AwsS3Adapter;
use oat\awsTools\AwsClient;
use oat\oatbox\service\ConfigurableService;

/**
 * Short description of class oat\taoQtiItem\model\QtiJsonItemCloudFrontReplacement
 *
 * @access public
 * @author Antoine Robin, <antoine@taotesting.com>
 * @package taoQTI
 */
class QtiJsonItemCloudFrontReplacement extends ConfigurableService
{

    const SERVICE_ID = 'taoQtiItem/cloudFrontReplacement';

    const CLOUDFRONT_PATTERN = 'cloudFrontPattern';
    const CLOUDFRONT_EXPIRATION = 'cloudFrontExpiration';
    const CLOUDFRONT_KEYPAIR = 'cloudFrontKeyPair';
    const CLOUDFRONT_KEYFILE = 'cloudFrontKeyFile';
    const CLOUDFRONT_KEYTMPFILE = 'tmpFile';
    const BUCKET = 'bucket';
    const PREFIX = 'prefix';


    public function hasCloudFrontAssets($content)
    {
        if($this->hasOption(self::CLOUDFRONT_PATTERN) && preg_match($this->getOption(self::CLOUDFRONT_PATTERN),$content) === 1){
            return true;
        }
        return false;
    }

    public function replaceCloudFrontAssets($content)
    {
        /** @var AwsClient $awsClient */
        $awsClient = $this->getServiceLocator()->get('generis/awsClient');

        if(!file_exists(self::CLOUDFRONT_KEYTMPFILE) && $this->hasOption(self::CLOUDFRONT_KEYFILE)){
            $s3Client = $awsClient->getS3Client();
            $s3Adapter = new AwsS3Adapter($s3Client, $this->getOption(self::BUCKET), $this->getOption(self::PREFIX));
            $response = $s3Adapter->read($this->getOption(self::CLOUDFRONT_KEYFILE));
            if($response !== false){
                file_put_contents($this->getOption(self::CLOUDFRONT_KEYTMPFILE), $response['contents']);
                chmod($this->getOption(self::CLOUDFRONT_KEYTMPFILE), 700);
            } else {
                return $content;
            }
        }

        $matches = [];
        preg_match_all($this->getOption(self::CLOUDFRONT_PATTERN), $content, $matches);

        if(!empty($matches[0])){
            $changed = preg_replace('#\\\/#','/', $matches[0]);
            foreach ($changed as $key => $match){
                $cloudFront = $awsClient->getCloudFrontClient();

                $resourceUrl = $match.'?user='.\common_session_SessionManager::getSession()->getUserLabel();
                $expiration = ($this->hasOption(self::CLOUDFRONT_EXPIRATION)) ? $this->getOption(self::CLOUDFRONT_EXPIRATION) : 3600;
                $expires = time() + $expiration;

                $signedUrlCannedPolicy = $cloudFront->getSignedUrl(array(
                    'private_key' => $this->getOption(self::CLOUDFRONT_KEYTMPFILE),
                    'key_pair_id' => $this->getOption(self::CLOUDFRONT_KEYPAIR),
                    'url'     => $resourceUrl,
                    'expires' => $expires,
                ));

                $url = str_replace('"', '', json_encode($signedUrlCannedPolicy));
                $content = str_replace($matches[0][$key], $url, $content);

            }
        }

        return $content;
    }
}
