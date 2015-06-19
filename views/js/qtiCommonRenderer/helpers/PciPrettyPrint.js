/**
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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */
define(['lodash'], function(_){
    'use strict';

    var _formatters = {
        boolean : function(value){
            return value ? 'true' : 'false';
        },
        integer : function(value){
            return value;
        },
        float : function(value){
            return value;
        },
        string : function(value){
            return (value === '') ? 'NULL' : ('"' + value + '"');
        },
        point : function(value){
            return '[' + value[0] + ', ' + value[1] + ']';
        },
        pair : function(value){
            return '[' + value[0] + ', ' + value[1] + ']';
        },
        directedPair : function(value){
            return '[' + value[0] + ', ' + value[1] + ']';
        },
        duration : function(value){
            return value;
        },
        file : function(value){
            return 'binary data';
        },
        uri : function(value){
            return value;
        },
        intOrIdentifier : function(value){
            return value;
        },
        identifier : function(value){
            return value;
        }
    }

    var _prettyPrintBase = function(value, withType){

        var print = '',
            base = value.base;

        withType = (typeof withType !== 'undefined') ? withType : true;

        if(base){

            _.forIn(_formatters, function(formatter, baseType){
                if(base[baseType] !== undefined){

                    print += (withType) ? '(' + baseType + ') ' : '';
                    print += formatter(base[baseType]);

                    return false;
                }
            });

            return print;
        }

    };

    var _prettyPrintList = function(value, withType){

        var print = '',
            list = value.list;

        withType = (typeof withType !== 'undefined') ? withType : true;

        if(list){

            _.forIn(_formatters, function(formatter, baseType){
                if(list[baseType] !== undefined){

                    print += (withType) ? '(' + baseType + ') ' : '';

                    print += '[';

                    _.each(list[baseType], function(value){
                        print += formatter(value) + ', ';
                    });

                    if(_.size(list[baseType])){
                        print = print.substring(0, print.length - 2);
                    }

                    print += ']';

                    return false;
                }
            });

            return print;
        }
    };

    return {
        printBase : _prettyPrintBase,
        printList : _prettyPrintList
    }
});
