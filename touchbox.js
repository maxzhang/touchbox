/*!
 * TouchBox - v1.0.0
 * 
 * @homepage https://github.com/maxzhang/touchbox
 * @author maxzhang<zhangdaiping@gmail.com> http://maxzhang.github.io
 */
(function(window) {
    
    /*--------------- 公共方法 ---------------*/
    
    var document = window.document,
        userAgent = window.navigator.userAgent.toLowerCase(),
        msPointerEnabled = window.navigator.msPointerEnabled,
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
    
    var isSmartPhone = os.wp || os.ios || os.android;
    
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
    
    var TOUCH_EVENTS = (function() {
        var pointerPrefix = vendor.propPrefix === 't' ? 'pointer' : (vendor.propPrefix.substring(0, vendor.propPrefix.length - 1) + 'Pointer');
        return {
            start: isSmartPhone ? (msPointerEnabled ? pointerPrefix + 'Down' : 'touchstart') : 'mousedown',
            move: isSmartPhone ? (msPointerEnabled ? pointerPrefix + 'Move' : 'touchmove') : 'mousemove',
            end: isSmartPhone ? (msPointerEnabled ? pointerPrefix + 'Up' : 'touchend') : 'mouseup',
            cancel: isSmartPhone ? (msPointerEnabled ? pointerPrefix + 'Cancel' : 'touchcancel') : 'mousecancel'
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
    
    /*--------------- 公共方法 end ---------------*/
    
    
    var TouchBox = function(ct, options) {
        var defaultOptions = {
            itemSelector: '',
            active: 0,
            loop: false,
            animation: 'flow',
            duration: 350,
            lockScreen: 'off', // 横竖屏锁定，取值范围：'off'、'landscape'、'portrait'
            rotateBody: '',
            beforeSlide: noop,
            onSlide: noop,
            onResize: noop,
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
        },
        
        getItems: function() {
            var itemSelector = this.options.itemSelector;
            return slice.call(itemSelector ? this.ct.querySelectorAll(itemSelector) : this.ct.children, 0);
        },
        
        getItem: function(index) {
            return this.getItems()[index];
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
            if (this.options.onResize) {
                this.options.onResize.call(this.options.scope, w, h);
            }
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
                el.style.display = 'block';
            }
        },
        
        setItemHide: function(index, y) {
            if (index > -1) {
                var el = this.getItem(index);
                el.style.display = 'none';
                el.style[vendor.transform] = 'translate3d(' + y + 'px,0px,0px)';
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
            
            me.ct.removeEventListener(TOUCH_EVENTS.move, me, false);
            me.ct.removeEventListener(TOUCH_EVENTS.end, me, false);
            me.ct.removeEventListener(TOUCH_EVENTS.cancel, me, false);
            me.ct.addEventListener(TOUCH_EVENTS.move, me, false);
            me.ct.addEventListener(TOUCH_EVENTS.end, me, false);
            me.ct.addEventListener(TOUCH_EVENTS.cancel, me, false);
            delete me.vertical;
            
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

            if (isUndefined(me.vertical)) {
                if (offsetY !== 0) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            } else {
                if (absY > absX) {
                    me.vertical = true;
                    if (offsetY !== 0) {
                        e.preventDefault();
                        e.stopPropagation();
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
            
            if (!me.touchCoords || me.sliding) {
                return;
            }
            
            var context = me.getContext(),
                height = me.ct.offsetHeight,
                absY = Math.abs(me.touchCoords.startY - me.touchCoords.stopY),
                transIndex;

            if (!isNaN(absY) && absY > 0) {
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
                    me.setItemHide(context.next, -height);
                } else {
                    me.setItemHide(me.touchCoords.startY > me.touchCoords.stopY ? context.prev : context.next, -height);
                    me.to(transIndex, false, true);
                }
                delete me.touchCoords;
            }
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
            
            if (toIndex > -1 && toIndex <= last && toIndex != active && this.options.beforeSlide.call(this.options.scope, toIndex, active) !== false) {
                fromIndex = active;
                isSlideDown = (toIndex < active && active < last) || (toIndex == last - 1 && active == last) || (toIndex == last && active === 0);
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
                    fromEl.style.display = 'none';
                    fromEl.style[vendor.transitionDuration] = oms;
                }
            };
            var toSlideHandler = function() {
                clearTimeout(me.resetSlideTimeout);
                me.resetSlideTimeout = null;
                clearHandler(toEl, toSlideHandler);
                toEl.style.position = 'relative';
                toEl.style[vendor.transitionDuration] = oms;
                me.lastActive = me.active;
                me.active = toIndex;
                me.sliding = false;
                me.options.onSlide.call(me.options.scope, toIndex, me.lastActive);
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

        handleEvent: function(e) {
            switch (e.type) {
                case TOUCH_EVENTS.start:
                    this.onTouchStart(e);
                    break;
                case TOUCH_EVENTS.move:
                    this.onTouchMove(e);
                    break;
                case TOUCH_EVENTS.end:
                    this.onTouchEnd(e);
                    break;
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
    
    window.TouchBox = TouchBox;
    
}(window));