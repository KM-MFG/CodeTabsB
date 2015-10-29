/* PLUGIN COOKIE
************************************************************** */
(function($) {
    
    // Kiem tra plugin
    if( !window.csPLUGIN ) window.csPLUGIN = {};



    /* Cookie
    ================================================== */
    csPLUGIN.COOKIE = {

        write : function() {

            // Bien shortcut va khoi tao ban dau
            var date = new Date(),
                name = 'code'+ this.va.codeID + this.o.cookie.name + window.location.host;

            // Cong them so ngay luu tru va convert theo gio GTM chuan
            date.setTime( date.getTime() + (this.o.cookie.days*24*60*60*1000) );
            var expires = '; expires='+ date.toGMTString();

            // Ghi hoac update cookie gia tri moi
            document.cookie = name +'='+ this.cs.idCur + expires +'; path=/';
        },
        

        read : function() {

            var aCookie = document.cookie.replace(/\s+/g, '').split(';'),
                name    = 'code'+ this.va.codeID + this.o.cookie.name + window.location.host +'=',
                idCur   = null;

            // Kiem tra tat ca cookie
            for( i = 0; i < aCookie.length; i++ ) {
                if( aCookie[i].indexOf(name) == 0 ) idCur = this.M.pInt( aCookie[i].substr(name.length) );
            }

            // Setup idCur neu cookie co luu tru gia tri trong qua khu
            if( idCur != null ) this.cs.idCur = this.o.idBegin = idCur;
        }
    };
})(jQuery);