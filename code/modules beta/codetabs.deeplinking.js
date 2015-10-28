/* PLUGIN DEEPLINKING
************************************************************** */
(function($) {
    
    // Kiem tra plugin
    if( !window.csPLUGIN ) window.csPLUGIN = {};



    /* Deep-linking
    ================================================== */
    csPLUGIN.DEEPLINKING = {

        // Kiem tra HASH tren dia chi trang web
        check : function(isIDReturn) {

            var va        = this.va,
                is        = this.is,
                oDeeplink = this.o.deeplinking,

                // Lua chon prefix Custom va prefix Mac dinh --> uu tien prefix Custom
                prefix0   = oDeeplink.prefixDefault[0] + va.codeID + oDeeplink.prefixDefault[1],
                codeName  = oDeeplink.prefix != null ? oDeeplink.prefix : prefix0,

                reStr     = codeName +'\\d+',
                re        = new RegExp(reStr, 'g'),
                hash      = window.location.hash,
                linkCheck = hash.match(re),
                idReturn;


            // Kiem tra va tra ve id-text cua last slide tren hash
            var idTextOnHash = function() {
                if( is.aIDtext ) {
                    for( i = 0; i < va.aIDtext.length; i++ ) {

                        var idCur = va.aIDtext[i];
                        if( idCur != undefined && hash.indexOf(idCur.toString()) != -1 ) return i;
                    }
                }
                return null;
            };


            // Tra lai ket qua ID nhan duoc tu hash
            if( isIDReturn ) {

                // Uu tien doc id-text truoc
                idReturn = idTextOnHash();
                if( idReturn != null ) return idReturn;

                // Neu khong co id-text thi tiep tuc kiem tra theo dang 'codeID_slideID'
                if( linkCheck != null ) {

                    idReturn = this.M.pInt( linkCheck[0].substr(codeName.length) );

                    // Dat lai idBegin neu nho hon idReturn < num
                    if( idReturn < this.cs.num ) return idReturn;
                }
                // Tra lai gia tri null neu khong hop le
                return null;
            }



            // Kiem tra va tra lai gia tri Hash moi' thay the cho hash hien tai
            // 1. Truoc tien kiem tra hashLast co ton tai tren HASH hay khong
            // 2. Setup de lay hashCur
            // 3. Thay the hashLast bang hashCur hoac khong co hashLast thi them hashCur vao HASH
            else {

                var hashCur = null, hashLast = null;


                /* PHAN 1: LAY HASHLAST */
                /* ---------------------------------------------------------- */
                // Lay id tren hash co trung voi id-text cua cac slide hay khong
                idReturn = idTextOnHash();
                if( idReturn != null ) hashLast = va.aIDtext[idReturn];

                // Neu khong co hashLast id-text thi tiep tuc tim kiem dang 'codeID_slideID'
                if( hashLast == null && linkCheck != null ) hashLast = linkCheck[0];




                /* PHAN 2: LAY HASHCUR */
                /* ---------------------------------------------------------- */
                var idTextCur = va.aIDtext[this.cs.idCur];
                if( is.aIDtext && idTextCur != undefined ) hashCur = idTextCur;
                if( hashCur == null )                      hashCur = codeName + this.cs.idCur;




                /* PHAN 3: CHUYEN DOI GIUA HASHCUR VA HASHLAST */
                /* ---------------------------------------------------------- */
                // Neu hashLast ton tai thi thay the hashLast bang hashCur
                if( hashLast != null ) {
                    var strRest = hash.split(hashLast);
                    hash = strRest[0] + hashCur + strRest[1];
                }
                // Neu hashLast khong ton tai thi cong hashCur vao HASH hien tai 
                else {
                    // Neu khong co hash --> cong them dau '#'
                    // Neu co hash --> cong vao tiep theo
                    // Them dau '-' cho multi hash --> de doc hon
                    if( hash === '' )           hash = '#'+ hashCur;
                    else if( /\-$/.test(hash) ) hash += hashCur;
                    else                        hash += '-'+ hashCur;
                }

                // Cuoi cung tra lai gia tri Hash
                return hash;
            }
        },



        // Doc id tu link trang page --> di toi slide do
        read : function() {
            var idCur = this.check(1);
            if( idCur != null ) {

                // Set lai idCur theo url
                this.cs.idCur = this.o.idBegin = idCur;

                // Update gia tri trong properties: reset lai idCenterMap, loadWay...
                this.PROP.setup();
            }
        },


        // Toggle link on browser
        write : function() {

            // Lay gia tri Hash moi tu dia chi trang web
            var that      = this,
                ti        = that.ti,
                hashNew   = that.check(0),
                hashReset = function() {

                    clearTimeout(ti.hashReset);
                    ti.hashReset = setTimeout(function() { csVAR.stopHashChange = 0 }, 100);
                };


            // Thay doi hash hien tai
            clearTimeout(ti.hashChange);
            ti.hashChange = setTimeout(function() {

                // Ngan hanh dong event 'hashchange' --> tranh lap lai
                csVAR.stopHashChange = 1;

                // Su dung api 'history.pushState' cap nhat hash --> khong di chuyen toi DOM
                // Neu khong api --> su dung cach thuong
                if( history.pushState ) history.pushState(null, null, hashNew);
                else                    window.location.hash = hashNew;

                // Phuc hoi lai event hashchange
                hashReset();
            }, that.va.speed[that.cs.idCur]);
        },



        // Event khi hashChange
        events : function() {
            var that = this;

            // Loai bo event roi dang ki lai --> ho tro update
            $(window).off(that.va.ev.hash);
            that.o.isDeeplinking && $(window).on(that.va.ev.hash, function(e) {

                // Ngan browser load lai trang
                e.preventDefault();
                if( !csVAR.stopHashChange ) {

                    // Kiem tra hash change co phai la 'CODE' hien tai
                    // --> neu phai thi di toi id cua slide
                    var idCur = that.check(1);
                    if( idCur != null ) that.SLIDETO.run(idCur, 1, 0, 1);
                }
            });
        }
    };
})(jQuery);