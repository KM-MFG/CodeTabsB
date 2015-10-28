/* PLUGIN API MORE
************************************************************** */
(function($) {
    
    // Kiem tra plugin
    if( !window.csPLUGIN ) window.csPLUGIN = {};



    /* APIs: more function
    ================================================== */
    csPLUGIN.APImore = {

        // Kiem tra va convert thanh number cho index
        indexParse : function(index, isAddSlide) {
            var num = this.num;


            // Kiem tra co phai number
            if( /^\-?\d+/g.test(index) ) index = parseInt(index);

            // Kiem tra index, neu gia tri index khong hop le --> index se la id slide cuoi
            // Slide cuoi cua addSlide khac voi removeSlide
            if( !(typeof index == 'number' && (index >= 0 && index < num)) )
                index = isAddSlide ? num : num-1;

            return index;
        },



        /* Add new slide & remove slide with index
         * Slide va pagitem co cung chung func --> toi uu CODE later!!!
        ---------------------------------------------- */
        fnAddSlide : function(html, index) {

            // Bien khoi tao va shortcut ban dau
            var that = this,
                cs   = that,
                o    = that.o,
                va   = that.va,
                is   = that.is;


            // Kiem tra 'html' co bao gom nguyen SLIDE hay noi dung ben trong SLIDE --> khoi tao $sl du'ng ca'ch
            // 'html' co the la doi tuong jQuery
            var $div  = $(html),
                isDiv = $div.length == 1 && $div[0].tagName.toLowerCase() == 'div',
                $sl   = isDiv ? $div : $('<div></div>', { 'html': html });


            // Slide setup markup, va return slide da setup
            // va setup pagitem trong slide
            // Convert chi so index thanh number
            $sl   = that.RENDER.slide($sl);
            index = that.indexParse(index, 1);



            // SLIDE SETUP: append to code with index
            var isIDEnd = index == cs.num;
            if( isIDEnd ) { va.$canvas.append($sl) }
            else {
                // Them slide moi vao phia truoc slide index
                va.$s.eq(index).before($sl);

                // Varible $s reset thu tu
                va.$s = va.$canvas.children('.' + o.ns + o.slideName);
            }



            // PAGITEM SETUP
            if( is.pag ) {

                // Lay noi dung ben trong cua capitem va pagitem
                that.RENDER.capPagHTML($sl);

                // Them pagitem vao pagination
                var pagAdd = that.RENDER.pagitem($sl);

                // Add pagitem vao pagination
                if( isIDEnd ) va.$pagInner.append(pagAdd);
                else {
                    // Mac dinh them pagitem moi phia truoc pagitem index
                    va.$pagItem.eq(index).before(pagAdd);

                    // Varible va.$pagItem reset thu tuong
                    va.$pagItem = va.$pagInner.children('.' + o.ns + 'pagitem');
                }

                // Them event click vao pagitem
                that.EVENTS.pag();
            }


            // ID toggle class active --> Ho tro khi index trung voi idCur
            if( index == cs.idCur ) cs.idLast = cs.idCur + 1;


            // Kiem tra co phai load Nearby hay khong
            // Load nearby khong can chay. fx can thiet --> tam dung load
            if( o.load.isNearby ) cs.refresh();

            // Load binh thuong
            else {

                // Properties CODE & slide: resetup
                is.apiAdd = 1;              // De cac func khac biet update CODE bang apiAdd
                that.PROP.code();           // Setup prop truoc --> trong khi load image
                that.PROP.slide();

                // Cuoi cung LOAD begin
                $sl.data('is')['loadBy'] = 'apiAdd';
                that.LOAD.slideBegin($sl);
            }


            // Kiem tra 'code nested' --> khoi tao lai code trong slide
            that.NESTED.autoInit($sl);
        },

        getFromURL : function(url, index) {

            // Bien khoi tao ban dau
            var that     = this,
                settings = {
                    type    : 'GET',
                    cache   : false,
                    crossDomain : true,
                    success : function(data) { that.fnAddSlide(data, index); },
                    error   : function()     { that.is.e && console.warn('['+ csVAR.codeName +': ajax load failed] -> '+ url); }
                };

            // Setup ajax
            $.ajax(url, settings);
        },

        addSlide : function(obj, index) {

            // Bien shortcut va khoi tao bay dau
            var that       = this,
                fnAddSlide = function(html) { that.fnAddSlide(html, index); };


            // Neu 'obj' la string --> chuyen doi qua jquery selector hoac tai ajax
            if( typeof obj == 'string' && obj != '' ) fnAddSlide(obj);

            // Neu 'obj' la doi tuong {}
            else if( typeof obj == 'object' ) {
                
                // Add slide bang ajax --> load ajax truoc
                if( obj.ajax != undefined && typeof obj.ajax == 'string' ) that.getFromURL(obj.ajax, index);

                // Add slide bang doi tuong jquery
                else if( obj.selector != undefined && typeof obj.selector == 'object' ) fnAddSlide(obj.selector);
                
                // Add slide bang html
                else if( obj.html != undefined && typeof obj.html == 'string' ) fnAddSlide($(html));
            }
        },


        removeSlide : function(index) {
            var cs   = this,
                o    = this.o,
                va   = this.va,
                is   = this.is;


            // Dieu kien remove: phai co it nhat 1 slide
            if( cs.num > 1 ) {

                // Convert index thanh number
                index = this.indexParse(index, 0);
                var $slCur = va.$s.eq(index); 

                // Setup inCur: idCur cuoi, remove se lay bot --> idCur chuyen sang id phia truoc
                if( cs.idCur == cs.num-1 ) cs.idCur = cs.num-2;


                // Kiem tra code nested co trong slide hay khong --> remove event resize truoc
                this.NESTED.destroy($slCur);

                // Remove slide from CODE va setup lai var $s
                $slCur.remove();
                va.$s = va.$canvas.children('.'+ o.ns + o.slideName);


                // Remove pagitem form pagination va setup lai var $pagItem
                if( is.pag ) {
                    va.$pagItem.eq(index).remove();
                    va.$pagItem = va.$pag.find('.' + o.ns + 'pagitem');
                }

                // Lam moi cac thuoc tinh khac trong CODE
                is.apiRemove = 1;   // Bien de cac func khac nhan biet loai bo slide
                cs.prop();
                is.apiRemove = 0;
            }
        },



        /* Dang ki va loai bo swipe event
        ---------------------------------------------- */
        swipeEvent : function(status) {

               typeof status == 'string'
            && ('onBody onPag offBody offPag').indexOf(status) != -1
            && this.EVENTS.swipe(status);
        }
    };
})(jQuery);