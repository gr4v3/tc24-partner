var cordova = {
    plugin: {
        http: {
            get: function(url, data, headers, success, failure) {

                this.request({
                    method:'get',
                    url: url,
                    data: data,
                    headers: headers,
                    success: success,
                    failure: failure
                });

            },
            post: function(url, data, headers, success, failure) {

                this.request({
                    method:'post',
                    url: url,
                    data: data,
                    headers: headers,
                    success: success,
                    failure: failure
                });

            },
            request: function(params) {
                try {
                    var xmlhttp = new XMLHttpRequest();
                    xmlhttp.onreadystatechange = function() {
                        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
                            if (xmlhttp.status >= 200 && xmlhttp.status < 300) {
                                if (params.success instanceof Function)
                                    params.success(xmlhttp);

                            }
                            else if (xmlhttp.status >= 400 && xmlhttp.status < 500) {
                                if (params.failure instanceof Function)
                                    params.failure(xmlhttp);
                            }
                            else {
                                throw xmlhttp;
                            }
                        }
                    };
                    xmlhttp.open(params.method, params.url, true);
                    for(index in params.headers) {
                        xmlhttp.setRequestHeader(index, params.headers[index]);
                    }
                    if (params.method === 'post')
                        xmlhttp.send(params.data);
                    else
                        xmlhttp.send();

                } catch (e) {
                    console.log(e);
                }
            }
        }
    }
};

(function() {
    var event = document.createEvent('Event');
// Define that the event name is 'build'.
    event.initEvent('deviceready', true, true);
    document.dispatchEvent(event);
})();

document.addEventListener('camera', function(e) {
    /**
     *
     */
});