/* PLUGIN SLIDESHOW
************************************************************** */
(function($) {
    
    // Kiem tra plugin
    if( !window.csPLUGIN ) window.csPLUGIN = {};



    /* Slideshow
     * tDelay: control all relative function
    ================================================== */
    csPLUGIN.SLIDESHOW = {

        init : function() {

            // Number of slide > 0, it mean at least 2 slides
            if( this.cs.num > 1 ) {
                this.is.hoverAction = 0;

                this.focus();
                this.M.scroll.setup();
                this.hover();
                this.o.slideshow.isPlayPause && this.toggle();

                this.is.stop = 0; // for button stop
                this.go();
            }
        },

        go : function() {
            // console.log('go', is.stop, is.focus, is.into, is.hover, is.playing, is.fxRun, is.hoverAction, is.pauseActive);
            // console.log('go' +' '+ is.stop +' '+ is.focus +' '+ is.into +' '+ is.hover +' '+ is.playing +' '+ is.fxRun +' '+ is.hoverAction +' '+ is.pauseActive);
            // console.log(is.into, is.fxRun);

            // Choose action
            // va.nVideoOpen/va.nMapOpen use for video/map open
            // !o.isHoverPause && is.fxRun --> isHoverPause-off, sua loi khi chuyen qua slide khac, timer van chay
            // is.playing --> the hien timer co chay hay khong
            var that = this,
                is   = that.is;

            if( !is.stop ) {

                // if( is.pauseActive ) is.playing && SLIDESHOW.pause();
                if( is.pauseActive ) that.pause();

                else {
                    if( !is.focus || !is.into || is.hover || that.va.nVideoOpen || that.va.nMapOpen || (!that.o.slideshow.isHoverPause && is.fxRun) ) {
                        is.playing && that.pause();
                    }

                    else if( !is.fxRun ) {
                        is.hoverAction ? that.reset() : that.play();
                    }
                }
            }
        },



        /* APIs: update properties
        ---------------------------------------------- */
        update : function() {

            // Timer toggle markup
            var oo    = this.oo,
                o     = this.o,
                va    = this.va,
                is    = this.is,
                ti    = this.ti,
                TIMER = $.extend({}, csPLUGIN.TIMER, this),

                auto0 = oo.slideshow,
                auto1 = o.slideshow;

            if( auto0.timer != auto1.timer ) {
                clearInterval(ti.timer);
                this.RENDER.timer();
                !!va.tTimer0 && this.pause();      // no check if first auto SLIDESHOW
                this.play();
            }


            // Timer arc update properties
            is.timer && (va.timer == 'arc') && !!csPLUGIN.TIMER && TIMER.arcProp();


            // Slideshow toggle --> after timer update
            if( oo.isSlideshow != o.isSlideshow ) {

                if( o.isSlideshow ) this.init();
                else {
                    this.pause(1);

                    var winEvents = ' focus.code' + va.codekey
                                  + ' blur.code'  + va.codekey
                                  + ' scroll.code'+ va.codekey;
                    $(window).off(winEvents);
                    va.$cs.off('mouseenter.code mouseleave.code');
                }
            }

            // Hoverstop toggle
            (auto0.isHoverPause != auto1.isHoverPause) && this.hover();
        },





        /* Play - pause
           tDelay: important!
        ---------------------------------------------- */
        play : function() {

            // Bien khoi tao va shortcut
            var that  = this,
                va    = that.va,
                is    = that.is,
                ti    = that.ti,
                cs    = that.cs,
                o     = that.o,
                TIMER = $.extend({}, csPLUGIN.TIMER, that),

                // Next play function:
                fnNextPlay = function() {
                    clearTimeout(ti.play);

                    // 'that.reset()' duoc dat trong function --> tranh loi 'va.tDelay' khong nhan ra
                    ti.play = setTimeout(function() { that.reset() }, va.speed[cs.idCur] - 10);
                };


            is.playing = 1;
            va.tTimer0 = +new Date();
            is.timer && !!csPLUGIN.TIMER && TIMER[va.timer + 'Update']();


            // Setup di chuyen toi slide ke tiep
            clearTimeout(ti.play);
            ti.play = setTimeout(function() {

                // Bien shortcut va khoi tao ban dau
                var num      = cs.num,
                    isRandom = o.slideshow.isRandom && num > 2,

                    idCur    = (o.layout == 'dash') ? that.ds.nEnd : cs.idCur,
                    idNext   = isRandom ? that.M.raExcept(0, num-1, idCur)
                                        : (idCur >= num-1 ? 0 : idCur + 1),

                    $slNext  = va.$s.eq(idNext);



                // SLIDE da load xong --> di chuyen toi slide
                if( $slNext.data('is')['loaded'] ) {
                    if     ( isRandom )                    that.SLIDETO.run(idNext, 1);
                    else if( !o.isLoop && idCur == num-1 ) that.SLIDETO.run(0, 1);
                    else                                   that.EVENTS.next(1);

                    // Next play
                    fnNextPlay();
                }

                // SLIDE chua load xong --> cho` load xong
                else {
                    $slNext.data({'isPlayNext': 1});
                    cs.stop();
                }

            }, va.tDelay);
        },

        reset : function() {
            var va = this.va;

            // Reset lai gia tri cac bien
            if( va.tDelay != va.delay[this.cs.idCur] ) va.tDelay = va.delay[this.cs.idCur];

            if     ( va.timer == 'bar' && va.xTimer != 100 )  va.xTimer     = 100;
            else if( va.timer == 'number' && va.xTimer != 0 ) va.xTimer     = 0;
            else if( va.timer == 'arc' )                      va.arc.angCur = 0;
            
            // Tiep tuc tinh toan trong play()
            this.play();
        },

        pause : function(_isStop) {

            // Bien khoi tao va shortcut
            var that    = this,
                va      = that.va,
                is      = that.is,
                idCur   = that.cs.idCur,

                isTIMER = !!csPLUGIN.TIMER,
                TIMER   = $.extend({}, csPLUGIN.TIMER, that);


            // Chuyen doi thuoc tinh cua cac bien ngay luc dau
            is.playing = 0;
            is.hoverAction = 0;


            // Lay thuoc tinh cua timer
            if( _isStop ) {
                va.tDelay = va.delay[idCur];
                isTIMER && TIMER[va.timer + 'Setup'];
            }

            // pause: tDelay get
            else {

                var t0  = va.tDelay;
                va.tTimer1 = +new Date();
                va.tDelay  = va.delay[idCur] - (va.tTimer1 - va.tTimer0);

                if( va.delay[idCur] != t0 ) va.tDelay -= va.delay[idCur] - t0;
                if( va.tDelay < 0 )         { va.tDelay = 0; is.hoverAction = 1; }    // is.hoverAction = 1 -> !important to solve hover slideshow when fxrunning
            }

            
            // Dung hoan toan timer va loai bo timer play
            this.stop();
            clearTimeout(that.ti.play);
        },

        stop : function() {
            var va = this.va,
                ti = this.ti;


            switch(va.timer) {

                case 'bar' : 
                    va.xTimer = va.tDelay / va.delay[this.cs.idCur] * 100;

                    var tf = {}; tf[va.cssTf] = this.M.tlx(-va.xTimer, '%');

                    if( this.is.ts ) va.$timerItem.css(va.cssD0).css(tf);
                    else             va.$timerItem.stop(true).css(tf);
                    break;


                case 'arc' :
                    va.arc.angCur = 360 - (va.tDelay / va.delay[this.cs.idCur] * 360);
                    clearInterval(ti.timer);
                    break;


                case 'number' :
                    clearInterval(ti.timer);
                    break;
            };
        },





        /* Slideshow events
        ---------------------------------------------- */
        focus : function() {

            // Bien khoi tao va shortcut
            var that    = this,
                is      = that.is,
                codekey = '.code'+ that.va.codekey;

            // Setup bien ban dau
            is.focus = 1;

            // Events
            $(window).on('focus'+ codekey, function() { if( !is.focus ) { is.focus = 1; that.go(); } })
                     .on('blur'+  codekey, function() { if( is.focus )  { is.focus = 0; that.go(); } });
        },


        hover : function() {

            var that = this,
                $cs  = that.va.$cs;

            if( that.o.slideshow.isHoverPause ) {
                that.is.hover = 0;

                $cs .off('mouseenter.code mouseleave.code')
                    .on('mouseenter.code', function() { that.hover1() })
                    .on('mouseleave.code', function() { that.hover0() });
            }
            else $cs.off('mouseenter.code mouseleave.code');
        },

        hover0 : function() { this.is.hover = 0; this.go(); },
        hover1 : function() { this.is.hover = 1; this.go(); },


        toggle : function() {

            var that    = this,
                o       = that.o,
                va      = that.va,
                actived = o.ns + o.actived,
                evName  = va.ev.click;      // Khong co event TOUCH --> xung dot voi event CLICK trong IE10+


            // Events
            va.$playpause.off(evName);
            va.$playpause.on(evName, function(e) {

                // var isActived 
                if( va.$playpause.hasClass(actived) ) {
                    that.is.pauseActive = 0;
                    va.$playpause.removeClass(actived);

                } else {
                    that.is.pauseActive = 1;
                    va.$playpause.addClass(actived);
                }

                that.go();
                return false;
            });
        }
    };
})(jQuery);