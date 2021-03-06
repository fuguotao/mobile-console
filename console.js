(function () {
    var CSS_PATH = 'https://rawgithub.com/wtfil/mobile-console/master/console.css',
        element;

    function createElement(cls, content, name) {
        var elem = document.createElement(name || 'div');
        if (content) {
            elem.innerHTML = content;
        }
        elem.classList.add('mobile-console__' + cls);
        return elem;
    }

    function scrollToBottom() {
        element.scrollTop = element.scrollHeight;
    }

    function escapeHTML(html) {
        return String(html)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    function inspect(obj, key, enumerable) {
        var content = createElement('log'),
            top = createElement('top'),
            node = createElement('node', '', 'span'),
            elemsCreated = false,
            keyNode, text, props;
        
        if (arguments.length === 2) {
            enumerable = true;
        }

        if (key) {
            keyNode = createElement(enumerable ? 'enumerable-key' : 'not-enumerable-key', key + ':', 'span');
            top.appendChild(keyNode);
        }

        content.appendChild(top);
        top.appendChild(node);
        if (typeof obj === 'number') {
            node.innerHTML = obj;
            node.classList.add('number');
        } else if (typeof obj === 'string') {
            node.innerHTML = '"' + escapeHTML(obj) + '"';
            node.classList.add('string');
        } else if (obj === undefined) {
            node.innerHTML = 'undefined';
            node.classList.add('null');
        } else if (obj === null) {
            node.innerHTML = 'null';
            node.classList.add('null');
        } else if (obj === false || obj === true) {
            node.innerHTML = '' + obj;
        } else if (obj instanceof Function) {
            text = obj.toString();
            if (text.indexOf('[native code]') !== -1) {
                node.innerHTML = text;
            } else {
                node.innerHTML = text.split(/(\{)/).slice(0, 2).join('');
            }
        } else {

            node.innerHTML = obj.constructor.name || obj.constructor.toString().replace(/\[|\]|object\s/g, '');
            content.classList.add('inspect');
            if (Array.isArray(obj)) {
                node.innerHTML = '[' + obj.length + ']';
            }

            props = createElement('props');

            top.addEventListener('click', function () {
                var keys = [],
                    basicKeys, elem, key;

                if (content.classList.contains('inspect')) {
                    if (!elemsCreated) {

                        for (key in obj) {
                            keys.push(key);
                        }

                        Object.getOwnPropertyNames(obj)
                            .concat(keys)
                            .filter(function (key, index, arr) {
                                return arr.indexOf(key) === index;
                            })
                            .sort()
                            .concat('__proto__')
                            .forEach(function (key) {
                                var enumerable = Object.getOwnPropertyDescriptor(obj, key);
                                enumerable = enumerable ? enumerable.enumerable : false;

                                elem = inspect(obj[key], key, enumerable);
                                props.appendChild(elem);
                            });
                        elemsCreated = true;
                    }
                    content.classList.remove('inspect');
                    content.classList.add('opened');
                    props.classList.add('visible');
                } else {
                    content.classList.add('inspect');
                    content.classList.remove('opened');
                    props.classList.remove('visible');
                }
            }, false);

            content.appendChild(props);
        }

        return content;
    }

    function createConsoleBlock() {
        element = createElement('holder');
        document.body.appendChild(element);
    }

    function addStyles() {
        style = document.createElement('link');
        style.setAttribute('rel', 'stylesheet');
        style.setAttribute('type', 'text/css');
        style.setAttribute('href', CSS_PATH);
        document.querySelector('head').appendChild(style);
    }


    if(/android|webos|iphone|ipad|ipod|blackberry|window\sphone/i.test(navigator.userAgent)) {
        window.addEventListener('load', function () {
            addStyles();
            console.error = console.log = function (message) {
                if (!element) {
                    createConsoleBlock();
                }
                element.appendChild(inspect(message));
                scrollToBottom();
            };
        }, false);
    }
}());
