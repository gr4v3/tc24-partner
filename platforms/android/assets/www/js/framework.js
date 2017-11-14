/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var framework = {
    storage: window.localStorage,
    endpoint:'https://api-dev.travelcentral24.com',
    view: 'view/',
    // Application Constructor
    initialize: function(callBack) {
        this.onInit = callBack;
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        var that = this;
        this.template('root', function(html) {
            document.body.innerHTML = html;
            var pages = document.getElementsByClassName('page')
            for(var index = 0; index < pages.length; index++) {
                pages[index].style.width = window.innerWidth + 'px';
            }
            if (that.onInit instanceof Function)
                that.onInit(that);
        });
    },
    page: function(name, params) {
        var page = document.getElementById(name);
        if (page) {
            var pages = document.getElementsByClassName('page');
            for(var index = 0; index < pages.length; index++) {
                pages[index].style.display = 'none';
            }
            this.template(name, function(html) {
                page.innerHTML = html;
                page.style.display = 'block';
                page.scrollIntoView();
                var form = page.querySelector('form');
                if (form) {
                    form.onsubmit = function() {
                        new Request(this).send(params);
                        return false;
                    };
                }
                document.dispatchEvent(new Event(name));
            });

        }

    },
    template:function(name, callBack) {
        var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    if (callBack instanceof Function)
                        callBack(xhttp.responseText);
                }
            };
            xhttp.open("GET", this.view + name + '.html', true);
            xhttp.send();
    }
};
HTMLElement.prototype.serialize = function(){
    var obj = {};
    var elements = this.querySelectorAll( "input, select, textarea" );
    for( var i = 0; i < elements.length; ++i ) {
        var element = elements[i];
        var name = element.name;
        var value = element.value;

        if( name ) {
            obj[ name ] = value;
        }
    }
    return JSON.stringify( obj );
}
var Request = function(form) {
    this.params = function(params) {
        var required = {
            method: form.method,
            data: form.serialize(),
            headers:{
                'content-type': 'application/json',
            },
            success:function(){},
            failure:function(){},
            url: framework.endpoint + form.action.replace(window.location.origin, '')
        };
        Object.assign(required, params);
        return required;
    };
    this.send = function(params) {
        var params = this.params(params);
        try {

            switch (params.method) {
                case 'get':
                    cordova.plugin.http.get(
                        params.url,
                        params.data,
                        params.headers,
                        params.success,
                        params.failure
                    );
                    break;
                case 'post':
                    cordova.plugin.http.post(
                        params.url,
                        params.data,
                        params.headers,
                        params.success,
                        params.failure
                    );
                    break;
            }

        } catch (e) {
            console.log(e);
        }
    };
};
var Auth = function() {
    this.current = function(success) {
        var that = this;
        var token = framework.storage.getItem('token');
        if (token === null)
            this.login();
        else {
            var form = document.createElement('form');
            form.action = '/tc24/users/current';
            form.method = 'get';
            new Request(form).send({
                headers: {token: token},
                success: function() {
                    if (success instanceof Function)
                        success();
                },
                failure:that.login
            });
        }
    };
    this.login = function(success, failure) {
        framework.page('login', {
            success: function(response) {
                framework.storage.setItem('token', response.getResponseHeader('token'));
                framework.page('camera');
            }
        });
    };
    this.logout = function(success, failure) {

        var storage = window.localStorage;
        storage.removeItem('token');
        framework.page('login');

    };
};
framework.initialize(function() {
    new Auth().current(function() {
        framework.page('camera');
    });
});

