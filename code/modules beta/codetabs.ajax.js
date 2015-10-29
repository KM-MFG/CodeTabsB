/* PLUGIN AJAX
************************************************************** */
(function($) {
    
    // Kiem tra plugin
    if( !window.csPLUGIN ) window.csPLUGIN = {};



    /* Ajax
    ================================================== */
    csPLUGIN.AJAX = {

        // Kiem tra slide co phai load ajax hay khong
        check : function(opt, $sl) {

            // Bien shortcut va khoi tao ban dau
            var isData  = $sl.data('is');
            

            if( !!opt.media && typeof opt.media.ajax == 'string' ) {
                isData.ajax = 1;

                // Kiem tra slide co tu dong load neu khong co pagItem o tabs
                // if( this.o.isPag && this.o.pag.type == 'tab' && !!isData.pagEmpty ) isData.ajaxAutoLoad = 1;
            }
        },


        // Loai bo slide co load-ajax ra khoi danh sach load lien tiep luc dau
        removeAutoLoad : function(aLoad) {

            // Tao 1 mang moi, neu khong phai load ajax thi ID do' push vao mang moi
            var newLoad = [];
            for( i = 0; i < aLoad.length; i++ ) {

                // Bien is trong data slide
                var isData = this.va.$s.eq(i).data('is');

                // Neu khong co ajax hoac co co ajax roi ma khong co pagItem thi tu dong load
                // if( !isData.ajax || !!isData.pagEmpty ) newLoad.push(aLoad[i]);
                if( !isData.ajax ) newLoad.push(aLoad[i]);
            }

            // Tra ve mang sau khi loai bo id co load ajax
            return newLoad;
        },


        // Lay noi dung tu URL
        get : function($sl) {

            // Bien khoi tao ban dau
            var that   = this,
                url    = $sl.data('media')['ajax'],
                isData = $sl.data('is'),

                fnLoadEnd = function() {

                    // Luu gia tri load bang AJAX
                    isData.loadBy = 'ajax';

                    // Tiep tiep setup slide neu load xong
                    that.LOAD.slideBegin($sl);
                },

                settings  = {
                    type       : 'GET',
                    cache      : false,
                    beforeSend : function() {

                        // Bien nhan biet slide dang loading
                        isData.loading = 1;
                    },
                    success : function(data) {

                        // Chen them vao noi dung lay duoc vao slide
                        $sl.html( $sl.html() + data);

                        // Cap nhap lai loader
                        var $loader = $sl.find('.'+ that.o.ns + 'loader');
                        if( $loader.length ) $sl.data('$').slLoader = $loader;

                        // Bat dau setup noi dung lay duoc
                        fnLoadEnd();
                    },
                    error : function() {

                        // Set bien de co the load ajax lai
                        isData.loaded = 0;
                        fnLoadEnd();
                    }
                };

            // Setup ajax
            $.ajax(url, settings);
        }
    };
})(jQuery);