/*!
 * TouchBox - v1.0.11
 *
 * @homepage https://github.com/maxzhang/touchbox
 * @author maxzhang<zhangdaiping@gmail.com> http://maxzhang.github.io
 */
(function(window) {

    /*--------------- 公共方法 ---------------*/

    var document = window.document,
        userAgent = window.navigator.userAgent.toLowerCase(),
        hasTouch = 'ontouchstart' in window,
        hasPointer = window.PointerEvent || window.MSPointerEvent, // IE10 is prefixed
        toString = Object.prototype.toString,
        slice = Array.prototype.slice,
        enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'];

    var os = {
        wp: (function() {
            if (userAgent.indexOf('windows phone ') !== -1) {
                return /\bwindows phone (?:os )?([0-9.]+)/;
            } else if (userAgent.indexOf('xblwp') !== -1) {
                return /\bxblwp([0-9.]+)/;
            } else if (userAgent.indexOf('zunewp') !== -1) {
                return /\bzunewp([0-9.]+)/;
            }
            return /\bwindows phone/;
        }()).test(userAgent),
        ios: (function() {
            if (/\bcpu(?: iphone)? os /.test(userAgent)) {
                return /\bcpu(?: iphone)? os ([0-9._]+)/;
            } else if (userAgent.indexOf('iph os ') !== -1) {
                return /\biph os ([0-9_]+)/;
            } else {
                return /\bios\b/;
            }
        }()).test(userAgent),
        android: (function() {
            if (userAgent.indexOf('android') !== -1) {
                return /\bandroid[ \/-]?([0-9.x]+)?/;
            } else if (userAgent.indexOf('adr') !== -1) {
                if (userAgent.indexOf('mqqbrowser') !== -1) {
                    return /\badr[ ]\(linux; u; ([0-9.]+)?/;
                } else {
                    return /\badr(?:[ ]([0-9.]+))?/;
                }
            }
            return /\bandroid/;
        }()).test(userAgent)
    };

    function prefixPointerEvent(pointerEvent) {
        return window.MSPointerEvent ?
            'MSPointer' + pointerEvent.charAt(9).toUpperCase() + pointerEvent.substr(10):
            pointerEvent;
    }

    var TOUCH_EVENTS = (function() {
        return {
            start: hasTouch ? 'touchstart' : (hasPointer ? prefixPointerEvent('pointerdown') : 'mousedown'),
            move: hasTouch ? 'touchmove' : (hasPointer ? prefixPointerEvent('pointermove') : 'mousemove'),
            end: hasTouch ? 'touchend' : (hasPointer ? prefixPointerEvent('pointerup') : 'mouseup'),
            cancel: hasTouch ? 'touchcancel' : (hasPointer ? prefixPointerEvent('pointercancel') : 'mousecancel'),
        };
    }());


    function isFunction(it) {
        return toString.call(it) === '[object Function]';
    }

    function isArray(it) {
        return toString.call(it) === '[object Array]';
    }

    function isUndefined(it) {
        return typeof it === 'undefined';
    }

    function isString(it) {
        return typeof it === 'string';
    }

    function noop() {}

    function each(c, cb) {
        if (c && cb) {
            if (isArray(c)) {
                for (var i = 0, l = c.length; i < l; i++) {
                    if (cb.call(null, c[i], i, c) === false) {
                        break;
                    }
                }
            } else {
                for (var o in c) {
                    if (cb.call(null, o, c[o]) === false) {
                        break;
                    }
                }
            }
        }
    }

    function extend(target, obj) {
        if (target && obj && typeof obj === 'object') {
            var i, j, k;

            for (i in obj) {
                target[i] = obj[i];
            }

            if (enumerables) {
                for (j = enumerables.length; j--;) {
                    k = enumerables[j];
                    if (obj.hasOwnProperty(k)) {
                        target[k] = obj[k];
                    }
                }
            }
        }
        return target;
    }

    var vendor = (function() {
        var dummyStyle = document.createElement('div').style,
            propPrefix = (function() {
                var vendors = 'webkitT,t,msT,MozT,OT'.split(','),
                    t,
                    i = 0,
                    l = vendors.length;

                for (; i < l; i++) {
                    t = vendors[i] + 'ransform';
                    if (t in dummyStyle) {
                        return vendors[i].substr(0, vendors[i].length - 1);
                    }
                }

                return false;
            }()),
            cssPrefix = propPrefix ? '-' + propPrefix.toLowerCase() + '-' : '',
            prefixStyle = function(style) {
                if (propPrefix === '') return style;
                style = style.charAt(0).toUpperCase() + style.substr(1);
                return propPrefix + style;
            },
            transform = prefixStyle('transform'),
            transition = prefixStyle('transition'),
            transitionProperty = prefixStyle('transitionProperty'),
            transitionDuration = prefixStyle('transitionDuration'),
            transformOrigin = prefixStyle('transformOrigin'),
            transitionTimingFunction = prefixStyle('transitionTimingFunction'),
            transitionDelay = prefixStyle('transitionDelay'),
            transitionEndEvent = (function() {
                if (propPrefix == 'webkit' || propPrefix === 'O') {
                    return propPrefix.toLowerCase() + 'TransitionEnd';
                }
                return 'transitionend';
            }()),
            animation = prefixStyle('animation'),
            animationName = prefixStyle('animationName'),
            animationDuration = prefixStyle('animationDuration'),
            animationTimingFunction = prefixStyle('animationTimingFunction'),
            animationDelay = prefixStyle('animationDelay');

        dummyStyle = null;

        return {
            propPrefix: propPrefix,
            cssPrefix: cssPrefix,
            transform: transform,
            transition: transition,
            transitionProperty: transitionProperty,
            transitionDuration: transitionDuration,
            transformOrigin: transformOrigin,
            transitionTimingFunction: transitionTimingFunction,
            transitionDelay: transitionDelay,
            transitionEndEvent: transitionEndEvent,
            animation: animation,
            animationName: animationName,
            animationDuration: animationDuration,
            animationTimingFunction: animationTimingFunction,
            animationDelay: animationDelay
        };
    }());

    function getTranslateY(el) {
        var transform = window.getComputedStyle(el)[vendor.transform],
            values;
        if (transform && (values = transform.match(/^matrix(3d)?(.*)$/i))) {
            if (values && values[2]) {
                return parseInt(values[2].replace(/ /g, '').split(',')[values[1] ? 13 : 5], 10);
            }
        }
        return 0;
    }

    function isPortrait() {
        return window.innerHeight > window.innerWidth;
    }

    function proxyOrientationChange(fn, scope) {
        return function(e) {
            var args = slice.call(arguments, 0);
            var wasPortrait = isPortrait();
            if (fn.lastOrientation !== wasPortrait) {
                fn.lastOrientation = wasPortrait;
                fn.apply(scope || window, args);
            }
        };
    }

    function listenTransition(target, duration, callbackFn) {
        var me = this,
            clear = function() {
                if (target.transitionTimer) clearTimeout(target.transitionTimer);
                target.transitionTimer = null;
                target.removeEventListener(vendor.transitionEndEvent, handler, false);
            },
            handler = function() {
                clear();
                if (callbackFn) callbackFn.call(me);
            };
        clear();
        target.addEventListener(vendor.transitionEndEvent, handler, false);
        target.transitionTimer = setTimeout(handler, duration + 50);
    }


    var EventEmitter = (function() {
        var toString = Object.prototype.toString,
            eventPropRe = /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate)$/;

        function isString(o) {
            return typeof o === 'string';
        }

        function isFunction(o) {
            return toString.call(o) === '[object Function]';
        }

        function isArray(o) {
            return toString.call(o) === '[object Array]';
        }

        function createSingle(e, en, fn, scope){
            return function(){
                e.removeListener(en, fn, scope);
                return fn.apply(scope, arguments);
            };
        }

        /**
         * @class EventEmitter
         *
         * 事件类，使用方法如下：
         *
         * <code>
         *  // 实例化一个事件类
         *  var ee = new EventEmitter();
         *
         *  // 添加事件类型
         *  ee.addEvents('event1');
         *
         *  // 添加事件监听
         *  ee.addListener('event1', function() {
         *      // 监听回调函数
         *  });
         *
         *  // 执行事件，调用事件监听回调函数
         *  ee.fireEvent('event1');
         * </code>
         */
        var EventEmitter = function(listeners, defaultScope) {
            this.events = {};
            this.defaultScope = defaultScope || window;

            if (listeners) {
                this.addListener(listeners);
            }
        };

        EventEmitter.prototype = {
            constructor: EventEmitter,

            /**
             * 声明事件类型，调用方式如下：
             *
             * <code>
             *  ee.addEvents('event1', 'event2');
             *
             *  // 或
             *
             *  ee.addEvents({
             *      'event1': true,
             *      'event2': true
             *  });
             * </code>
             *
             * @param {String} eventName 事件名称
             * @param {String...} eventName1...n (optional)
             */
            addEvents: function(o) {
                var args,
                    i,
                    events = this.events;

                if (isString(o)) {
                    args = arguments;
                    i = args.length;

                    while (i--) {
                        events[args[i]] = events[args[i]] || [];
                    }
                } else {
                    for (i in o) {
                        events[i] = events[i] || [];
                    }
                }
            },

            /**
             * 增加事件监听
             * @param {String} eventName 事件名称
             * @param {String} fireFn 事件监听回调函数
             * @param {String} scope (optional) 回调函数作用域
             * @param {Object} options (optional) 事件监听选项
             *  可选的选项参数包括：
             *      Boolean : single true表示只执行一次
             */
            addListener: function(eventName, fireFn, scope, options) {
                if (!isString(eventName)) {
                    var listener, eName;
                    scope = eventName.scope;
                    for (eName in eventName) {
                        if (eventPropRe.test(eName)) {
                            continue;
                        }
                        listener = eventName[eName];
                        if (isFunction(listener)) {
                            this.addListener(eName, listener, scope);
                        } else {
                            this.addListener(eName, listener.fn, listener.scope || scope);
                        }
                    }
                    return;
                }

                var events = this.events;
                eventName = eventName.toLowerCase();
                events[eventName] = events[eventName] || [];
                scope = scope || this.defaultScope;
                options = options || {};

                events[eventName].push({
                    single: options.single,
                    fireFn: fireFn,
                    listenerFn: this.createListener(eventName, fireFn, scope, options),
                    scope: scope
                });
            },

            /**
             * 移除事件监听
             * @param {String} eventName 事件名称
             * @param {String} fireFn 事件监听回调函数
             * @param {String} scope 回调函数作用域
             */
            removeListener: function(eventName, fireFn, scope) {
                eventName = eventName.toLowerCase();
                var listeners = this.events[eventName];
                if (isArray(listeners)) {
                    scope = scope || this.defaultScope;
                    for (var i = 0, len = listeners.length; i < len; i++) {
                        if (listeners[i].fireFn == fireFn && scope == listeners[i].scope) {
                            listeners.splice(i, 1);
                            return;
                        }
                    }
                }
            },

            /**
             * 清空某一个事件的所有监听
             * @param {String} eventName 事件名称
             */
            clearListeners: function(eventName) {
                this.events[eventName.toLowerCase()] = [];
            },

            /**
             * 清空所有事件的监听
             */
            purgeListeners: function() {
                for (var eventName in this.events) {
                    this.clearListeners(eventName);
                }
            },

            /**
             * 校验一个事件是否含有监听函数，返回true则表示此事件有监听
             * @param {String} eventName 事件名称
             * @return {Booolean}
             */
            hasListener: function(eventName) {
                var listeners = this.events[eventName.toLowerCase()];
                return isArray(listeners) && listeners.length > 0;
            },

            /**
             * 执行事件，调用事件监听回调函数
             * @param {String} eventName 事件名称
             */
            fireEvent: function(eventName) {
                var listeners = this.events[eventName.toLowerCase()];
                if (isArray(listeners)) {
                    var args = Array.prototype.slice.call(arguments, 1),
                        len = listeners.length,
                        i = 0,
                        l;
                    if (len > 0) {
                        for (; i < len; i++) {
                            l = listeners[i];
                            if (l) {
                                if (l.single === true) {
                                    i--;
                                }
                                if (l.listenerFn.apply(l.scope, args) === false) {
                                    return false;
                                }
                            }
                        }
                    }
                }
            },

            // private
            createListener: function(eventName, fireFn, scope, options) {
                var h = fireFn;
                options = options || {};
                if (options.single) {
                    h = createSingle(this, eventName, fireFn, scope);
                }
                return h;
            }
        };

        EventEmitter.prototype.on = EventEmitter.prototype.addListener;
        EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

        return EventEmitter;
    }());


    /*--------------- 公共方法 end ---------------*/


    var TouchBox = function(ct, options) {
        var defaultOptions = {
            itemSelector: '',
            active: 0,
            loop: false, // 循环切换，子视图大于3个，才允许开启
            animation: 'flow',
            duration: 400,
            lockScreen: 'off', // 横竖屏锁定，取值范围：'off'、'landscape'、'portrait'
            rotateBody: '',
            beforeSlide: null, // 已弃用，请使用事件接口 box.on('beforeslide') 代替
            onSlide: null, // 已弃用，请使用事件接口 box.on('slide') 代替
            onResize: null, // 已弃用，请使用事件接口 box.on('resize') 代替
            scope: this
        };

        if (ct && !options) {
            options = ct;
            ct = null;
        }
        if (ct) {
            ct = isString(ct) ? document.querySelector(ct) : ct;
            ct.parentNode.style.overflow = 'hidden';
        } else {
            ct = document.body;
        }
        ct.style.overflow = 'hidden';
        this.ct = ct;

        this.options = extend(defaultOptions, options);
        if (this.getLength() < 3) {
            this.options.loop = false; // 子视图大于3个，才允许开启
        }

        this.initEvents();
        this.onOrientationChange();
        this.resize();

        this.to(this.options.active, true);
    };

    TouchBox.prototype = {
        initEvents: function() {
            this.ct.addEventListener(TOUCH_EVENTS.start, this, false);
            this.onOrientationChangeProxy = proxyOrientationChange(this.onOrientationChange, this);
            window.addEventListener('orientationchange', this.onOrientationChangeProxy, false);
            window.addEventListener('resize', this.onOrientationChangeProxy, false);
            window.addEventListener('resize', this, false);

            this.ee = new EventEmitter(null, this.options.scope);
            if (this.options.beforeSlide) {
                this.ee.on('beforeslide', this.options.beforeSlide);
            }
            if (this.options.onSlide) {
                this.ee.on('slide', this.options.onSlide);
            }
            if (this.options.onResize) {
                this.ee.on('resize', this.options.onResize);
            }
        },

        on: function() {
            this.ee.on.apply(this.ee, arguments);
        },

        off: function() {
            this.ee.off.apply(this.ee, arguments);
        },

        getItems: function() {
            var itemSelector = this.options.itemSelector;
            return slice.call(itemSelector ? this.ct.querySelectorAll(itemSelector) : this.ct.children, 0);
        },

        getItem: function(index) {
            return this.getItems()[index];
        },

        getActive: function() {
            return this.getItems()[this.active];
        },

        getLength: function() {
            return this.getItems().length;
        },

        getLast: function() {
            return this.getLength() - 1;
        },

        getContext: function(index) {
            var last = this.getLast(),
                prev,
                next;
            if (isUndefined(index)) {
                index = this.active;
            }
            prev = index - 1;
            next = index + 1;
            if (prev < 0) {
                prev = this.options.loop ? last : -1;
            }
            if (next > last) {
                next = this.options.loop ? 0 : -1;
            }
            return {
                prev : prev,
                next: next,
                active: index
            };
        },

        resize: function(w, h) {
            w = w || window.innerWidth;
            h = h || window.innerHeight;
            this.ct.style.width = w + 'px';
            this.ct.style.height = h + 'px';
            each(slice.call(this.getItems(), 0), function(item) {
                item.style.width = w + 'px';
                item.style.height = h + 'px';
            });
            this.ee.fireEvent('resize', w, h);
        },

        onResize: function(e) {
            var w = window.innerWidth;
            var h = window.innerHeight;
            if (this.lastWidth != w || this.lastHeight != h) {
                this.lastWidth = w;
                this.lastHeight = h;
                this.resize(w, h);
            }
        },

        onOrientationChange: function(e) {
            var lockScreen = this.options.lockScreen;
            if (lockScreen != 'off') {
                var wasPortrait = isPortrait();
                var lockRotateEl = this.getLockRotateEl();
                if (lockScreen == 'landscape' && wasPortrait) {
                    lockRotateEl.style.display = '';
                } else if (lockScreen == 'portrait' && !wasPortrait) {
                    lockRotateEl.style.display = '';
                } else {
                    this.onResize();
                    lockRotateEl.style.display = 'none';
                }
            } else {
                this.onResize();
            }
        },

        getLockRotateEl: function() {
            if (!this.lockRotateEl) {
                var rotateBody = this.options.rotateBody;
                var cssText = 'display:none;position:fixed;left:0;top:0;bottom:0;right:0;z-index:9999998;width:100%;height:100%;';
                var div = document.createElement('div');
                div.id = 'touchBoxRotate';
                div.style.cssText = cssText;
                if (rotateBody) {
                    div.innerHTML = isFunction(rotateBody) ? rotateBody() : rotateBody;
                }
                document.body.appendChild(div);
                this.lockRotateEl = div;
            }
            return this.lockRotateEl;
        },

        getAnimation: function() {
            return TouchBox.animations[this.options.animation];
        },

        setItemShow: function(type, index, y, context) {
            if (index > -1) {
                var el = this.getItem(index);
                var animation = this.getAnimation();
                animation.touchStart.call(this, type, index, y, context);
                el.style[vendor.transitionTimingFunction] = 'ease-in-out';
                el.style[vendor.transitionDuration] = '0ms';
                //el.style.display = 'block';
            }
        },

        setItemHide: function(index, y) {
            if (index > -1) {
                var el = this.getItem(index);
                //el.style.display = 'none';
                el.style[vendor.transform] = 'translate3d(0,' + y + 'px,0)';
                el.style[vendor.transitionDuration] = '0ms';
            }
        },

        onTouchStart: function(e) {
            var me = this;
            if (me.sliding) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            clearTimeout(me.prepareNextViewTimer);

            me.ct.removeEventListener(TOUCH_EVENTS.move, me, false);
            me.ct.removeEventListener(TOUCH_EVENTS.end, me, false);
            me.ct.removeEventListener(TOUCH_EVENTS.cancel, me, false);
            me.ct.addEventListener(TOUCH_EVENTS.move, me, false);
            me.ct.addEventListener(TOUCH_EVENTS.end, me, false);
            me.ct.addEventListener(TOUCH_EVENTS.cancel, me, false);
            delete me.vertical;

            if (me.ee.fireEvent('touchstart', me.active) === false) {
                return;
            }

            var point = e.touches ? e.touches[0] : e,
                context = me.getContext(),
                height = me.ct.offsetHeight;

            if (context.prev > -1) {
                me.setItemShow('prev', context.prev, -height, context);
            }
            if (context.next > -1) {
                me.setItemShow('next', context.next, height, context);
            }
            me.setItemShow('active', context.active, 0, context);

            me.touchCoords = {};
            me.touchCoords.startX = point.pageX;
            me.touchCoords.startY = point.pageY;
            me.touchCoords.timeStamp = e.timeStamp;
        },

        onTouchMove: function(e) {
            var me = this;
            if (!me.touchCoords || me.sliding) {
                return;
            }

            var point = e.touches ? e.touches[0] : e;
            me.touchCoords.stopX = point.pageX;
            me.touchCoords.stopY = point.pageY;

            var offsetX = me.touchCoords.startX - me.touchCoords.stopX,
                offsetY = me.touchCoords.startY - me.touchCoords.stopY,
                absX = Math.abs(offsetX),
                absY = Math.abs(offsetY);

            if (!isUndefined(me.vertical)) {
                if (me.vertical && offsetY !== 0) {
                    e.preventDefault();
                    if (me.ee.fireEvent('touchmove', me.active, offsetY) === false) {
                        return;
                    }
                }
            } else {
                if (offsetY !== 0) {
                    /*
                     * 在移动设备上，当滚动条处于页面顶部时，页面依然可以继续向下滑，
                     * 如果快速连续的重复向下滑动动作，容易导致浏览器默认向下滑动动作与TouchBox向下滑动冲突，
                     * 向上滑动类似，
                     *
                     * 所以，不伦任何手势都阻止浏览器默认动作(preventDefault)
                     */
                     e.preventDefault();
                }
                if (absY > absX) {
                    me.vertical = true;
                    if (offsetY !== 0) {
                        e.preventDefault();
                        if (me.ee.fireEvent('touchmove', me.active, offsetY) === false) {
                            return;
                        }
                    }
                } else {
                    me.vertical = false;
                    delete me.touchCoords;
                    return;
                }
            }

            var context = me.getContext(),
                height = me.ct.offsetHeight,
                animation;

            if (absY < height) {
                animation = me.getAnimation();
                if (context.prev > -1) {
                    animation.touchMove.call(me, 'prev', context.prev, -height - offsetY, context);
                }
                if (me.options.loop || (offsetY < 0 && context.prev > -1) || (offsetY > 0 && context.next > -1)) {
                    animation.touchMove.call(me, 'active', context.active, -offsetY, context);
                }
                if (context.next > -1) {
                    animation.touchMove.call(me, 'next', context.next, height - offsetY, context);
                }
            }
        },

        onTouchEnd: function(e) {
            var me = this;
            me.ct.removeEventListener(TOUCH_EVENTS.move, me, false);
            me.ct.removeEventListener(TOUCH_EVENTS.end, me, false);
            me.ct.removeEventListener(TOUCH_EVENTS.cancel, me, false);

            var context = me.getContext(),
                height = me.ct.offsetHeight,
                offsetY, absY, transIndex;

            if (!me.touchCoords || me.sliding) {
                me.setItemHide(context.prev, -height);
                me.setItemHide(context.next, height);
                return;
            }

            offsetY = me.touchCoords.startY - me.touchCoords.stopY;
            absY = Math.abs(offsetY);

            // 在touchend时应当将前、后视图隐藏，否则可能导致一些未知的布局错误
            if (isNaN(absY) || absY === 0 || me.ee.fireEvent('touchend', me.active, offsetY) === false) {
                me.setItemHide(context.prev, -height);
                me.setItemHide(context.next, height);
                me.to(me.active, true, true);
            } else if (!isNaN(absY) && absY > 0) {
                if (absY > height) {
                    absY = height;
                }
                if (absY >= 80 || (e.timeStamp - me.touchCoords.timeStamp < 200)) {
                    if (me.touchCoords.startY > me.touchCoords.stopY && context.next > -1) {
                        transIndex = context.next;
                    } else if (me.touchCoords.startY < me.touchCoords.stopY && context.prev > -1) {
                        transIndex = context.prev;
                    } else {
                        transIndex = context.active;
                    }
                } else {
                    transIndex = context.active;
                }

                if (transIndex == context.active && getTranslateY(me.getItem(transIndex)) === 0) {
                    me.setItemHide(context.prev, -height);
                    me.setItemHide(context.next, height);
                } else {
                    me.setItemHide(me.touchCoords.startY > me.touchCoords.stopY ? context.prev : context.next, -height);
                    me.to(transIndex, false, true);
                }
            }
            delete me.touchCoords;
        },

        to: function(toIndex, silent, /* private */ isTouch) {
            var me = this;
            if (me.sliding) {
                return;
            }

            var active = me.active,
                last = me.getLast(),
                height = me.ct.offsetHeight,
                fromIndex,
                context = me.getContext(),
                isSlideDown,
                slideFn = function(isSlideDown) {
                    if (!isTouch) {
                        if (isSlideDown) {
                            me.setItemShow('prev', toIndex, -height, context);
                        } else {
                            me.setItemShow('next', toIndex, height, context);
                        }
                        if (fromIndex > -1) {
                            me.setItemShow('active', fromIndex, 0, context);
                        }
                    }
                    me.slide(fromIndex, toIndex, isSlideDown, silent);
                };

            if (toIndex > -1 && toIndex <= last && toIndex != active && me.ee.fireEvent('beforeslide', toIndex, active) !== false) {
                fromIndex = active;
                isSlideDown = last > 1 ? ((toIndex < active && active < last) || (toIndex == last - 1 && active == last) || (toIndex == last && active === 0)) : active > toIndex;
                slideFn(isSlideDown);
            } else {
                if (getTranslateY(me.getItem(active)) > 0) {
                    fromIndex = context.prev;
                    isSlideDown = false;
                } else {
                    fromIndex = context.next;
                    isSlideDown = true;
                }
                toIndex = active;
                slideFn(isSlideDown);
            }
        },

        slide: function(fromIndex, toIndex, isSlideDown, silent) {
            var me = this,
                offsetHeight = me.ct.offsetHeight,
                fromEl,
                toEl,
                translateY,
                baseDuration = me.options.duration,
                duration,
                oms = '0ms',
                animation = me.getAnimation();

            me.sliding = true;

            var clearHandler = function(el, fn) {
                el.removeEventListener(vendor.transitionEndEvent, fn, false);
            };
            var fromSlideHandler = function() {
                if (fromEl) {
                    clearHandler(fromEl, fromSlideHandler);
                    fromEl.style.position = 'absolute';
                    //fromEl.style.display = 'none';
                    fromEl.style[vendor.transitionDuration] = oms;
                }
            };
            var toSlideHandler = function() {
                clearTimeout(me.resetSlideTimeout);
                me.resetSlideTimeout = null;
                clearHandler(toEl, toSlideHandler);
                toEl.style.position = 'relative';
                toEl.style.zIndex = '12';
                toEl.style[vendor.transitionDuration] = oms;
                me.lastActive = me.active;
                me.active = toIndex;
                me.sliding = false;
                me.ee.fireEvent('slide', toIndex, me.lastActive);

                // 这里设置延迟是因为，防止与下一次touchstart事件冲突
                me.prepareNextViewTimer = setTimeout(function() {
                    // 提前准备下一视图
                    var context = me.getContext(),
                        offsetHeight = me.ct.offsetHeight;
                    if (context.prev > -1) {
                        me.setItemShow('prev', context.prev, -offsetHeight, context);
                    }
                    if (context.next > -1) {
                        me.setItemShow('next', context.next, offsetHeight, context);
                    }
                }, 100);
            };

            if (fromIndex > -1) {
                fromEl = me.getItem(fromIndex);
            }
            toEl = me.getItem(toIndex);
            translateY = getTranslateY(toEl);
            duration = silent ? 0 : animation.duration ? animation.duration.call(me, fromEl, toEl, fromIndex, toIndex, isSlideDown) : Math.round((Math.abs(translateY) / offsetHeight) * baseDuration);

            if (fromEl) {
                clearHandler(fromEl, fromSlideHandler);
                fromEl.style[vendor.transitionDuration] = duration + 'ms';
            }
            clearHandler(toEl, toSlideHandler);
            toEl.style[vendor.transitionDuration] = duration + 'ms';

            setTimeout(function() {
                if (!silent) {
                    if (fromEl) listenTransition(fromEl, duration, fromSlideHandler);
                    listenTransition(toEl, duration, toSlideHandler);
                }

                if (fromEl) {
                    animation.touchEnd.call(me, 'active', fromIndex, translateY > 0 ? -offsetHeight : offsetHeight, isSlideDown);
                }
                animation.touchEnd.call(me, translateY > 0 ? 'next' : 'prev', toIndex, 0, isSlideDown);

                if (silent) {
                    fromSlideHandler();
                    toSlideHandler();
                } else {
                    // 防止touch事件与click事件触发的slide动作冲突，导致sliding状态无法被重置
                    me.resetSlideTimeout = setTimeout(function() {
                        fromSlideHandler();
                        toSlideHandler();
                    }, duration + 400);
                }
            }, os.android ? 50 : 10);
        },

        prev: function() {
            var context = this.getContext();
            if (context.prev > -1) {
                this.to(context.prev);
                return true;
            }
            return false;
        },

        next: function() {
            var context = this.getContext();
            if (context.next > -1) {
                this.to(context.next);
                return true;
            }
            return false;
        },

        handleEvent: function(e) {
            switch (e.type) {
                case TOUCH_EVENTS.start:
                    this.onTouchStart(e);
                    break;
                case TOUCH_EVENTS.move:
                    this.onTouchMove(e);
                    break;
                case TOUCH_EVENTS.end:
                case TOUCH_EVENTS.cancel:
                    this.onTouchEnd(e);
                    break;
                case 'resize':
                    this.onResize(e);
                    break;
            }
        },

        destroy: function() {
            if (!this.destroyed) {
                this.destroyed = true;
                this.ct.removeEventListener(TOUCH_EVENTS.start, this, false);
                this.ct.removeEventListener(TOUCH_EVENTS.move, this, false);
                this.ct.removeEventListener(TOUCH_EVENTS.end, this, false);
                this.ct.removeEventListener(TOUCH_EVENTS.cancel, this, false);
                window.removeEventListener('orientationchange', this.onOrientationChangeProxy, false);
                window.removeEventListener('resize', this.onOrientationChangeProxy, false);
                window.removeEventListener('resize', this, false);
                if (this.lockRotateEl) {
                    this.lockRotateEl.parentNode.removeChild(this.lockRotateEl);
                    this.lockRotateEl = null;
                }
                this.ct = null;
            }
        }
    };

    TouchBox.animations = {
        'slide': {
            touchStart: function(type, index, y) {
                var el = this.getItem(index);
                if (type === 'prev' || type === 'next') {
                    el.style.position = 'absolute';
                    el.style.left = '0';
                    el.style.top = '0';
                    el.style.zIndex = '11';
                } else {
                    el.style.position = 'relative';
                    el.style.zIndex = '12';
                }
                el.style[vendor.transform] = 'translate3d(0px,' + y + 'px,0px)';
            },
            touchMove: function(type, index, y) {
                var el = this.getItem(index);
                if (!this.options.loop) {
                    if ((index === 0 && y > 0) || (index == this.getLast() && y < 0)) {
                        y /= 4;
                    }
                }
                el.style[vendor.transform] = 'translate3d(0px,' + y + 'px,0px)';
            },
            touchEnd: function(type, index, y) {
                var el = this.getItem(index);
                el.style[vendor.transform] = 'translate3d(0px,' + y + 'px,0px)';
            }
        },
        'flow': {
            touchStart: function(type, index, y) {
                var el = this.getItem(index);
                if (type === 'prev') {
                    el.style.position = 'absolute';
                    el.style.left = '0';
                    el.style.top = '0';
                    el.style.zIndex = '11';
                    el.style[vendor.transform] = 'translate3d(0px,' + (y / 4) + 'px,0px)';
                } else if (type === 'next') {
                    el.style.position = 'absolute';
                    el.style.left = '0';
                    el.style.top = '0';
                    el.style.zIndex = '13';
                    el.style[vendor.transform] = 'translate3d(0px,' + y + 'px,0px)';
                } else {
                    el.style.position = 'relative';
                    el.style.zIndex = '12';
                    el.style[vendor.transform] = 'translate3d(0px,' + y + 'px,0px)';
                }
            },
            touchMove: function(type, index, y, context) {
                var el = this.getItem(index);
                var translateY = getTranslateY(this.getItem(context.active));
                if (type === 'prev') {
                    el.style[vendor.transform] = 'translate3d(0px,' + (y / 4) + 'px,0px)';
                } else if (type === 'next') {
                    el.style[vendor.transform] = 'translate3d(0px,' + y + 'px,0px)';
                } else {
                    if (translateY > 0) {
                        if (!this.options.loop) {
                            if ((index === 0 && y > 0) || (index == this.getLast() && y < 0)) {
                                y /= 4;
                            }
                        }
                    } else {
                        y /= 4;
                    }
                    el.style[vendor.transform] = 'translate3d(0px,' + y + 'px,0px)';
                }
            },
            touchEnd: function(type, index, y, isSlideDown) {
                var el = this.getItem(index);
                if (!isSlideDown && type === 'active' && y < 0) {
                    el.style[vendor.transform] = 'translate3d(0px,' + (y / 4) + 'px,0px)';
                } else {
                    el.style[vendor.transform] = 'translate3d(0px,' + y + 'px,0px)';
                }
            },
            duration: function(fromEl, toEl, fromIndex, toIndex, isSlideDown) {
                var offsetHeight = this.ct.offsetHeight;
                var toY = getTranslateY(toEl);
                var fromY = 0;
                var y;
                if (fromEl) {
                    fromY = getTranslateY(fromEl);
                }
                if (toY < 0 && (this.options.loop || toIndex !== this.getLast())) {
                    y = offsetHeight - Math.abs(fromY);
                } else {
                    y = Math.abs(toY);
                }
                return Math.round((y / offsetHeight) * this.options.duration);
            }
        }
    };

    TouchBox.EventEmitter = EventEmitter;
    window.TouchBox = TouchBox;

}(window));