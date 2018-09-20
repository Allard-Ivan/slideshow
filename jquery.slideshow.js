;(function($) {
"use strict";


$.fn.cycle = function(options) {
    return this.each(function() {
        options = options || {};

        if (this.cycleTimeout) {
            clearTimeout(this.cycleTimeout);
        }

        this.cycleTimeout = 0;
        this.cyclePause = 0;

        var $cont = $(this);
        var $slides = $cont.children();
        var els = $slides.get();
        if (els.length < 2) {
            console.log('too few');
            return;
        }

        var opts = $.extend({}, $.fn.cycle.defaults, options);
        opts.before = opts.before ? [opts.before] : [];
        opts.after = opts.after ? [opts.after] : [];
        opts.after.unshift(function() {opts.busy = 0;});

        var cls = this.className;
        opts.width = parseInt((cls.match(/w:(\d+)/) || [])[1], 10) || opts.width;
        opts.height = parseInt((cls.match(/h:(\d+)/) || [])[1], 10) || opts.height;
        opts.timeout = parseInt((cls.match(/t:(\d+)/) || [])[1], 10) || opts.timeout;

        if ($cont.css('position') === 'static') {
            $cont.css('position', 'relative');
        }
        if (opts.width) {
            $cont.width(opts.width);
        }
        if (opts.height && opts.height !== 'auto') {
            $cont.height(opts.height);
        }
        var first = 0;
        $slides.css({position: 'absolute', top: 0}).each(function(i) {
            $(this).css('z-index', els.length - i);
        });
        $(els[first]).css('opacity', 1).show();

        if (opts.fit && opts.width) {
            $slides.width(opts.width);
        }
        if (opts.fit && opts.height && opts.height !== 'auto') {
            $slides.height(opts.height);
        }
        if (opts.pause) {
            $cont.hover(function() {this.cyclePause = 1;}, function() {this.cyclePause = 0;});
        }

        var txFn = $.fn.cycle.transitions[opts.fx];
        if (txFn) {
            txFn($cont, $slides, opts);
        }

        $slides.each(function() {
            var $el = $(this);
            this.cycleH = (opts.fit && opts.height) ? opts.height : $el.height;
            this.cycleW = (opts.fit && opts.width) ? opts.width : $el.width;
        });

        if (opts.cssFirst) {
            $slides[first].css(opts.cssFirst);
        }

        if (opts.timeout) {
            // speed == slow or fast
            if (opts.speed.constructor == String) {
                opts.speed = {slow: 600, fast: 200}[opts.speed] || 400;
            }
            if (!opts.sync) {
                opts.speed = opts.speed / 2;
            }
            // timeout minus speed must better than 250
            while ((opts.timeout - opts.speed)  < 250) {
                opts.timeout += opts.speed;
            }
        }
        opts.speedIn = opts.speed;
        opts.speedOut = opts.speed;
        
        opts.slideCount = els.length;
        opts.currSlide = first;
        opts.nextSlide = 1;

        var e0 = $slides[first];
        if (opts.before.length) {
            opts.before[0].apply(e0, [e0, opts, true]);
        }
        if (opts.after.length > 1) {
            opts.after[1].apply(e0, [e0, e0, opts, true]);
        }
        if (opts.click && !opts.next) {
            opts.next = opts.click;
        }
        if (opts.next) {
            $(opts.next).unbind('click.cycle').bind('click.cycle', function() {return advance(els, opts, opts.rev?-1:1);});
        }
        if (opts.prev) {
            $(opts.prev).unbind('click.cycle').bind('click.cycle', function() {return advance(els, opts, opts.rev?1:-1);});
        }
        if (opts.timeout) {
            this.cycleTimeout = setTimeout(function() {
                go(els, opts, !opts.rev);
            }, opts.timeout + (opts.delay || 0));
        }
    });
}

function go(els, opts, fwd) {
    if (opts.busy) {
        return;
    }
    var p = els[0].parentNode, curr = els[opts.currSlide], next = els[opts.nextSlide];
    if (p.cycleTimeout === 0) {
        return;
    }
    if (!p.cyclePause) {
        if (opts.before.length) {
            $.each(opts.before, function (i, o) { o.apply(next, [curr, next, opts, fwd]); });
        }
        var after = function() {
            $.each(opts.after, function(i, o) { o.apply(next, [curr, next, opts, fwd]) });
            queueNext(opts);
        };

        if (opts.nextSlide !== opts.currSlide) {
            opts.busy = 1;
            $.fn.cycle.custom(curr, next, opts, after);
        }
        var roll = (opts.nextSlide + 1) === els.length;
        opts.nextSlide = roll ? 0 : opts.nextSlide + 1;
        opts.currSlide = roll ? els.length - 1 : opts.nextSlide - 1;
    } else {
        queueNext(opts);
    }

    function queueNext(opts) {
        if (opts.timeout) {
            p.cycleTimeout = setTimeout(function() { go(els, opts, !opts.rev); }, opts.timeout);
        }
    }
}

function advance(els, opts, val) {
    var p = els[0].parentNode, timeout = p.cycleTimeout;
    if (timeout) {
        clearTimeout(timeout);
        p.cycleTimeout = 0;
    }
    opts.nextSlide = 
}

$.fn.cycle.transitions = {
    fade: function ($cont, $slides, opts) {
        $slides.not('eq(0)').hide();
        opts.cssBefore = { opacity: 0, display: 'block' };
        opts.cssAfter = { display: 'none' };
        opts.animOut = { opacity: 0 };
        opts.animIn = { opacity: 1 };
    }
};

})(jQuery);
