/* PLUGIN TIMER
************************************************************** */
(function($) {
    
    // Kiem tra plugin
    if( !window.csPLUGIN ) window.csPLUGIN = {};




    /* Timer for slideshow
    ================================================== */
    csPLUGIN.TIMER = {

        /* Timer render markup
        ---------------------------------------------- */
        render : function() {

            // Bien shortcut va khoi tao dau tien
            var o  = this.o,
                va = this.va,
                is = this.is;


            // Timer: remove last timer
            !!va.$timer && va.$timer.remove();
            if( is.timer ) {

                // Timer: search DOM
                var className  = o.ns + o.timerName,                     // Class name
                    classType  = className + '-' + va.timer,             // Class type
                    divdiv     = '<div></div>',
                    $timerHTML = this.RENDER.searchDOM('.'+ className);


                // Timer: them vao markup
                if( $timerHTML.length ) va.$timer = $timerHTML.addClass(classType);
                else {
                    va.$timer = $(divdiv, {'class' : className +' '+classType});

                    // Add timer vao markup
                    this.RENDER.into(o.markup.timerInto, va.$timer);
                }



                // Timer bar
                if( va.timer == 'bar' ) {
                    va.$timerItem = $(divdiv, {'class' : className +'item'});
                    va.$timer.append(va.$timerItem);

                    // Properties init
                    this.barSetup();
                }

                // Timer arc
                else if( va.timer == 'arc' ) {
                    va.$timerItem = $('<canvas></canvas>');
                    va.$timer.append(va.$timerItem);

                    // Setup init
                    this.arcProp();
                }

                // Timer number
                else if( va.timer == 'number' ) {
                    va.$timerItem = $('<span></span>', {'class' : className +'item', 'data-num': 0, 'text': 0 });
                    va.$timer.append(va.$timerItem);
                }
            }
        },




        /* Timer setup
        ---------------------------------------------- */
        barSetup : function() {

            var va = this.va,
                tf = {};

            // Lay gia tri transform ban dau
            tf[va.cssTf] = this.M.tlx(-100, '%');

            // Setup transform va transition cho timer BAR
            if( this.is.ts ) {
                var ts = {};
                ts = this.M.ts(va.cssTf, 0, 'linear');
                va.$timerItem.css(ts).css(tf);
                // va.$timerItem.css(tf);
                // setTimeout(function() { va.$timerItem.css(ts) }, 100);
            }
            else va.$timerItem.css(tf);
        },


        arcSetup : function() {},


        numberSetup : function() {
            this.va.$timerItem.attr('data-num', 0).text(0);
        },

        noneSetup : function() {},




        /* Timer update properties
        ---------------------------------------------- */
        barUpdate : function() {

            // Bien khoi tao va shortcut
            var that = this,
                va   = that.va,
                is   = that.is,

                // Function lap lai
                fnTimerLoop = function() {

                    var tf = {}; tf[va.cssTf] = that.M.tlx(-va.xTimer, '%');
                    if( is.ts ) {

                        va.$timerItem.hide().show();   // Fixed IE: refresh obj
                        va.$timerItem.css(va.cssD0).css(tf);
                    }
                    else va.$timerItem.css(tf);
                },

                fnTimerBegin = function() {

                    var tf = {}; tf[va.cssTf] = that.M.tlx(0);
                    if( is.ts ) {

                        var ts = {}; ts[va.cssD] = va.tDelay + 'ms';

                        /* Fixed IE:
                            + Lam moi lai timer
                            + Cai dat timer de fixed trong IE 10+ khong chiu di chuyen luc ban dau */
                        va.$timerItem.hide().show();
                        va.$timerItem.css(ts);
                        setTimeout(function() { va.$timerItem.css(tf) }, 50);
                    }
                    else va.$timerItem.animate(tf, {duration: va.tDelay, easing: 'linear'});
                };


            fnTimerLoop();                      // Timer: remove transition
            setTimeout(fnTimerBegin, 20);       // Timer: set transition, need delay > 50
        },


        arcUpdate : function() {

            var va = this.va,
                ti = this.ti,

                angPlus = Math.ceil( va.arc.speed*360 / va.delay[this.cs.idCur] ),
                fnArcDraw = function() {

                // Bien shortcut va khoi tao ban dau
                var ctx    = va.tContext,
                    ARC    = va.arc,
                    inFill = Math.ceil((ARC.radius - ARC.weight) / 2);

                // Clear canvas first
                ctx.clearRect(-ARC.width/2, -ARC.height/2, ARC.width, ARC.height);
                
                // OUT circle
                ctx.beginPath();
                ctx.arc(0, 0, ARC.oRadius, 0, ARC.pi*360, false);
                ctx.lineWidth   = ARC.oWeight;
                ctx.strokeStyle = ARC.oStroke;
                ctx.fillStyle   = ARC.oFill;
                
                ctx.stroke();
                ctx.fill();
                // ctx.closePath();

                // IN FILL circle
                ctx.beginPath();
                ctx.arc(0, 0, inFill + 1, 0, ARC.pi * Math.ceil(ARC.angCur*10)/10, false);
                ctx.lineWidth   = inFill * 2 + 2;
                ctx.strokeStyle = ARC.fill;
                ctx.stroke();


                // IN STROKE circle
                ctx.beginPath();
                ctx.arc(0, 0, ARC.radius, 0, ARC.pi * ARC.angCur, false);
                ctx.lineWidth   = ARC.weight;
                ctx.strokeStyle = ARC.stroke;
                ctx.stroke();

                // csReqAnimFrame(fnArcDraw);


                // Update VONG TRON HIEN TAI
                va.arc.angCur += angPlus;
                if( va.arc.angCur > 370 ) clearInterval(ti.timer);
            };

            // Fx update VE LAI DUA TREN VONG TRON HIEN TAI
            fnArcDraw();
            clearInterval(ti.timer);
            ti.timer = setInterval(fnArcDraw, va.arc.speed);


            // Fx update VONG TRON HIEN TAI
            // clearInterval(ti.timer);
            // ti.timer = setInterval(function() {

            //     va.arc.angCur += 360/delay[cs.idCur]*va.arc.speed;
            //     if( va.arc.angCur > 360 ) clearInterval(ti.timer);
                
            // }, va.arc.speed);
        },



        numberUpdate : function() {
            var that     = this,
                va       = that.va,
                tRefresh = 100;         // Thoi gian update update len DOM

            var fnCore = function() {
                va.tDelay -= tRefresh;

                // Luu tru xTimer --> Chi update len DOM khi xTimer thay doi
                va.xTimer0 = va.xTimer;

                // Setup xTimer hien tai
                va.xTimer = 100 - (va.tDelay / va.delay[that.cs.idCur] * 100);
                va.xTimer = Math.round(va.xTimer);
                if( va.xTimer > 100 ) va.xTimer = 0;

                // Update DOM
                (va.xTimer0 != va.xTimer) && va.$timerItem.attr('data-num', va.xTimer).text(va.xTimer);
            };

            clearInterval(that.ti.timer);
            that.ti.timer = setInterval(fnCore, tRefresh);
        },

        noneUpdate : function() {},




        /* Timer arc setup properties
        ---------------------------------------------- */
        arcProp : function() {

            var va = this.va,
                o  = this.o,

                // Arc setup properties
                _arcOther = {
                    angCur : (!!va.arc && !!va.arc.angCur) ? va.arc.angCur : 0,     // Angle Current, get angle last if update by api
                    pi     : Math.PI/180,
                    width  : (o.arc.width == null)  ? va.$timer.width()  : o.arc.width,
                    height : (o.arc.height == null) ? va.$timer.height() : o.arc.height,
                    speed  : ~~(1000/o.arc.fps)
                };

            // API update: all properties extend to va.arc
            va.arc = $.extend(o.arc, _arcOther);

            // Arc size
            va.$timerItem.attr({'width' : va.arc.width, 'height' : va.arc.height});
            

            // Arc: style draw
            va.tContext = va.$timerItem[0].getContext('2d');
            var arcSet = function() {
                var c = va.tContext;
                c.setTransform(1,0,0,1,0,0);
                c.translate(va.arc.width/2, va.arc.height/2);
                c.rotate(-va.arc.pi*(90-va.arc.rotate));

                c.strokeStyle = va.arc.stroke;
                c.fillStyle   = va.arc.fill;
                c.lineWidth   = va.arc.weight;
            };
            arcSet();

            // window.csReqAnimFrame = (function() {
            //     return  window.requestAnimationFrame ||
            //             window.webkitRequestAnimationFrame ||
            //             window.mozRequestAnimationFrame ||
            //             function(callback) { return setTimeout(callback, va.arc.speed) };
            // })();
        }
    };
})(jQuery);