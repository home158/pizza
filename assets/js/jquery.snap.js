/*
    紫惹斗數SVG排版程式
*/

(function($) {
    var PLUGIN_NAME = "snap";
    $.fn[PLUGIN_NAME] = function(methodOrOptions) {
        if (typeof methodOrOptions == "string") {
            var publicMethods = $.fn[PLUGIN_NAME].publicMethods[methodOrOptions];
            if (publicMethods) {
                var args = Array.prototype.slice.call(arguments, 1);
                return this.each(function() {
                    publicMethods(this, args);
                });
            } else {
                $.error("Method '" + methodOrOptions + "' doesn't exist for " + PLUGIN_NAME + " plugin.");
                return true;
            }
        }
        methodOrOptions = methodOrOptions || {};
        return this.each(function() {
            var Internal = $.data(this, PLUGIN_NAME);
            if (Internal) {
                $.error("Plugin '" + PLUGIN_NAME + "' can't be triggered twice. Please use other methods to re-render grid.");
            } else {
                var o = {
                    options: $.extend(true, {}, $.fn[PLUGIN_NAME].defaults, methodOrOptions)
                };
            var p = $.extend(true , {} , $.fn[PLUGIN_NAME].base , o);
            $.data(this, PLUGIN_NAME, p );
            }
            $.fn[PLUGIN_NAME].internalMethods.init(this);
        });        
    };
    $.fn[PLUGIN_NAME].internalMethods = {
        /**
         *  Initialises the plugin.
         *
        **/
        init : function( elem ){
            var that = this;
                base = that.getData( elem );
            /**********************************************/
            this.render(elem);
            
            var width = $('#'+base.options.svgId).parent().width();
            var height = width * base.options.pageSize.height / base.options.pageSize.width;
            base.snap = Snap('#'+base.options.svgId).attr({
                width: width,
                height: height,
                viewBox:"0 0 "+base.options.pageSize.width+" "+base.options.pageSize.height,
                preserveAspectRatio:"xMaxYMax"
            });
            this.rectangle(elem);
            this.textProfileLayout(elem);
            this.textVerticalLayout(elem, 'step1', 'left');
            this.textHorizontalLayout(elem, 'step3','up');
            this.textVerticalLayout(elem, 'step4', 'left');
            this.textVerticalLayout(elem, 'magnitude0','left');
            this.textVerticalLayout(elem, 'magnitude1','right');
            this.textVerticalLayout(elem, 'magnitude2','right');
        },
        render: function(elem,options){
            var that = this;
                base = that.getData( elem );
            /**********************************************/
            if(options){
                base.options = $.extend(true , {} , base.options , options);
            }
            //base.options.render.height = Math.ceil( base.options.render.width * base.options.pageSize.height / base.options.pageSize.width ); 
            //base.options.render.width = base.options.pageSize.width;
            //base.options.render.height = base.options.pageSize.height;
        },
        update : function( elem , options){
            var that = this,
                base = that.getData( elem );
            /**********************************************/
            if(options){
                base.options = options;
            }
            this.init(elem);
        },             
        /*
        *   畫出12宮的格子
        *
        */
        rectangle: function(elem,options){
            var that = this;
                base = that.getData( elem );
            /**********************************************/
            var tmpLocate = [];
            tmpLocate[0] = base.options.pdfDocument.margin;
            var i, c, j, p;
            //減去margin算出每格大小
            var w =  base.options.pageSize.width  - (base.options.pdfDocument.margin.x * 2);
            var h =  base.options.pageSize.height - (base.options.pdfDocument.margin.y * 2);
            base.pizzaRect.w = Math.floor( w / 4 );
            base.pizzaRect.h = Math.floor( h / 4 );
            for( i = 1; i < 16; i ++ ){
                p = {
                    x: ( i % 4 ) * base.pizzaRect.w + base.options.pdfDocument.margin.x,
                    y: Math.floor( i / 4 ) * base.pizzaRect.h + base.options.pdfDocument.margin.y
                };
                tmpLocate[i] = p;
            }
            base.profile.locateTopLeft = {
                x: base.pizzaRect.w + base.options.pdfDocument.margin.x,
                y: base.pizzaRect.h + base.options.pdfDocument.margin.y
            };
            for( j = 0; j < base.locateMapping.length; j ++ ){
                c = base.locateMapping[j];
                p = tmpLocate[c];
                base.options.pizza[j].locateTopLeft = p;
                base.snap.rect(p.x, p.y, base.pizzaRect.w, base.pizzaRect.h)
                    .attr({
                        fill: "none",
                        stroke: "#000",
                        strokeWidth: 1
                    });
            }
            /*
            var a = base.snap.text(base.options.pdfDocument.fontSize / 2, 0, "沒有聽或不肯").attr({
                    style: "writing-mode:tb;"
                });

            var boxdata = a.getBBox();
            base.snap.line(boxdata.x, boxdata.y, boxdata.x2, boxdata.y2).attr({
                        fill: "none",
                        stroke: "#000",
                        strokeWidth: 1
                    });
            */
        },
        /*
        *   水平寫入文字的位置
        *   @step 處理文子檔
        *   @alignment 對齊起始點，up 或 down
        */
        textHorizontalLayout: function(elem, step, alignment){
            var that = this;
                base = that.getData( elem );
            /**********************************************/
            //計算第一個grid位置
           
            var i, r, text, j, o, next, 
                alignment = alignment || 'down';
            for( i = 0; i < 12; i++ ){
                o = base.options.pizza[i][step];

                //計算第一個grid位置
                text = base.snap.text(100, 100, o.data[0].trim()).attr({
                    visibility: 'visible',
                    'font-family': 'GenShinGothicRegular'
                });   
                $firstGrid = this.retvieveFirstRelativePosition(elem, o , text , true);
                o.grid[0].x = $firstGrid.x;
                o.grid[0].y = $firstGrid.y;
                r = this.relativeGrid2AbsolutePosition(elem, o.grid[0].x, o.grid[0].y, base.options.pizza[i].locateTopLeft);
                text.attr(r);
                for( j = 1; j < o.data.length; j++){
                    next = j;
                    //下一個坐標
                    if(!o.grid[next]){
                        //下一個寫入的位置
                        if( next < o.data.length){
                            o.grid[next] = o.grid[j-1];
                            //下一格水平向上或下排
                            if(alignment == 'down'){
                                o.grid[next].y += $firstGrid.h;
                            }else{
                                o.grid[next].y -= $firstGrid.h;
                            }
                        }
                    }
                    if(o.alignment.x == 'center'){
                        text = base.snap.text(100, 100, o.data[next].trim()).attr({
                            visibility: 'visible',
                            'font-family': 'GenShinGothicRegular'
                        });  
                        $firstGrid = this.retvieveFirstRelativePosition(elem, o , text , true);
                        o.grid[next].x = $firstGrid.x;
                        r = this.relativeGrid2AbsolutePosition(elem, o.grid[next].x, o.grid[next].y, base.options.pizza[i].locateTopLeft);
                        text.attr(r);
                    }else{
                        r = this.relativeGrid2AbsolutePosition(elem, o.grid[next].x, o.grid[next].y, base.options.pizza[i].locateTopLeft);
                        text = base.snap.text(r.x, r.y, o.data[j].trim()).attr({
                            visibility: 'visible',
                            'font-family': 'GenShinGothicRegular'
                        });
                    }
                }
            }
        },        
        textVerticalLayout: function(elem, step , alignment){
            var that = this;
                base = that.getData( elem );
            /**********************************************/
             var i, r, text, j, o, next, 
                alignment = alignment || 'right';
            for( i = 0; i < 12; i++ ){
                o = base.options.pizza[i][step];
                //計算第一個grid位置
                text = base.snap.text(50, 50, o.data[0]).attr({
                    style: "writing-mode:tb;",
                    visibility: 'visible',
                    'font-family': 'GenShinGothicRegular'
                });
                if(step == "step4"){
                    text.attr({fill:"purple"});
                }
                $firstGrid = this.retvieveFirstRelativePosition(elem, o , text);
                o.grid[0].x = $firstGrid.x;
                o.grid[0].y = $firstGrid.y;
                r = this.relativeGrid2AbsolutePosition(elem, o.grid[0].x, o.grid[0].y, base.options.pizza[i].locateTopLeft);
                text.attr(r);
                if(o.symbol){
                    if(o.symbol[0] == "circle"){
                        var c = base.snap.circle(r.x + $firstGrid.w * 0.09, r.y + $firstGrid.w *2.45, 10)
                                    .attr({
                                        fill: "none",
                                        stroke: "#F00",
                                        strokeWidth: 1
                                    });
                    }
                    if(o.symbol[0] == "triangle"){
                        text.attr({fill:"red"});
                            var x = r.x-5;
                            var y = r.y-3;
                            var len = 13;
                       var c = base.snap.polygon(x,y,x+len/2,y-len/2*1.732,x+len,y)
                                    .attr({
                                        fill: "#F00",
                                        stroke: "#F00"
                                    });
                    }
                }
                
                for( j = 1; j < o.data.length; j++){
                    next = j;
                    //下一個坐標
                    if(!o.grid[next]){
                        //下一個寫入的位置
                        if( next < o.data.length){
                            o.grid[next] = o.grid[j-1];
                            //下一格水平向左排
                            if(alignment == 'left'){
                                o.grid[next].x -= $firstGrid.w;
                            }else{
                                o.grid[next].x += $firstGrid.w;
                            }
                        }
                        r = this.relativeGrid2AbsolutePosition(elem, o.grid[next].x, o.grid[next].y, base.options.pizza[i].locateTopLeft);
                        text = base.snap.text(r.x, r.y, o.data[j]).attr({
                            style: "writing-mode:tb;",
                            visibility: 'visible',
                            'font-family': 'GenShinGothicRegular'
                        });
                        if(step == "step4"){
                            text.attr({fill:"purple"});
                        }

                    }
                    if(o.symbol){
                        if(o.symbol[j] == "circle"){
                            var c = base.snap.circle(r.x + $firstGrid.w * 0.09, r.y + $firstGrid.w *2.45, 10)
                                    .attr({
                                        fill: "none",
                                        stroke: "#F00",
                                        strokeWidth: 1
                                    });
                        }
                        if(o.symbol[j] == "triangle"){
                            text.attr({fill:"red"});
                            var x = r.x-5;
                            var y = r.y-3;
                            var len = 13;
                            var c = base.snap.polygon(x,y,x+len/2,y-len/2*1.732,x+len,y)
                                    .attr({
                                        fill: "#F00",
                                        stroke: "#F00"
                                    });
                        }
                    }
                }
            }
        },
        textProfileLayout: function(elem){
            var that = this;
                base = that.getData( elem );
            /**********************************************/
            var o;
            o = base.options.profile;
            for( j = 0; j < o.data.length; j++){
                
                var text = base.snap.text(50, 50, o.data[j]).attr({
                    style: 'writing-mode:'+o.alignment[j].mode || 'tb' +';',
                    visibility: 'visible',
                    'font-family': 'GenShinGothicRegular'
                });
                grid = this.retvieveRelativePosition(elem, o.alignment[j] , text);
                //console.log(grid);
                o.grid[j].x = grid.x;
                o.grid[j].y = grid.y;
                r = this.relativeGrid2AbsolutePosition(elem,  o.grid[j].x, o.grid[j].y, base.profile.locateTopLeft);
                text.attr(r);
            }
        },
        retvieveFirstRelativePosition: function(elem , o , text , horizon){
            if(text == undefined){
                var r = {
                    x: 0,
                    y: 0,
                    w: 0,
                    h: 0
                };
                return r;
            }
            horizon = horizon || false;
            var b = text.getBBox();
            textHeight = b.h;
            textWidth = b.w;
            if(o.alignment.x == 'left'){
                var absX = base.options.gridPoditionMargin.left ;
            }
            if(o.alignment.x == 'center'){
                if(horizon){
                    //水平
                    var absX = ( base.pizzaRect.w / 2)  - ( textWidth / 2 ) - ( base.options.pdfDocument.fontSize / 2 );
                }else{
                    /*
                    if(o.data.length > 1){
                        var absX = ( base.pizzaRect.w / 2) + o.data.length * o.data.length / 2;
                    }else{
                        var absX = ( base.pizzaRect.w / 2) - ( base.options.pdfDocument.fontSize / 2 );
                    }
                    */
                    //垂直
                    var absX = ( base.pizzaRect.w / 2) + ( (o.data.length / 2 - 1) * base.options.pdfDocument.fontSize   );
                }
            }
            if(o.alignment.x == 'right'){
                var absX = base.pizzaRect.w - base.options.gridPoditionMargin.right - textWidth;
            }

            if(o.alignment.y == 'top'){
                var absY = base.options.gridPoditionMargin.top;
            }
            if(o.alignment.y == 'center'){
                var absY = ( base.pizzaRect.h / 2)  - ( textHeight / 2 ) - base.options.pdfDocument.fontSize *0.16 ;
            }
            if(o.alignment.y == 'bottom'){
                if(horizon){
                    var absY = base.pizzaRect.h - base.options.gridPoditionMargin.bottom;
                }else{
                    var absY = base.pizzaRect.h - base.options.gridPoditionMargin.bottom  - textHeight;
                }
            }
            //var abs_x = grid_X * 12 + pizzaLocate.x + this.gridPoditionMargin.x;
            //var abs_y = grid_Y * 12 + pizzaLocate.y + this.gridPoditionMargin.y;
            var r = {
                x: absX + base.options.pdfDocument.fontSize / 2,
                y: absY,
                w: textWidth,
                h: textHeight
            };
            return r;            
        },
        /*
        *   網格轉換成絕對位置
        *   
        *
        */
        relativeGrid2AbsolutePosition: function(elem, grid_X, grid_Y, pizzaLocate){
            var that = this;
                base = that.getData( elem );
            /**********************************************/
            var abs_x = grid_X + pizzaLocate.x;
            var abs_y = grid_Y + pizzaLocate.y;
            var r = {
                x: abs_x,
                y: abs_y
            };
            return r;
        },        
        retvieveRelativePosition: function(elem, alignment , text){
            var that = this;
                base = that.getData( elem );
            /**********************************************/
            var b = text.getBBox();
            textHeight = b.h;
            /*
            base.snap.line(b.x, b.y, b.x2, b.y2).attr({
                        fill: "none",
                        stroke: "#000",
                        strokeWidth: 1
                    });
            */

            if(typeof (alignment.x) == 'number'){
                if(alignment.x < 0){
                    var absX = base.pizzaRect.w * 2 - base.options.gridPoditionMargin.right + alignment.x * base.options.pdfDocument.fontSize;
                }else{
                    var absX = base.options.gridPoditionMargin.left + alignment.x * base.options.pdfDocument.fontSize;
                }
            }else{
                if(alignment.x == 'right'){
                    var absX = base.pizzaRect.w * 2 - base.options.gridPoditionMargin.bottom - base.options.pdfDocument.fontSize;
                }
                if(alignment.x == 'left'){
                    if(alignment.mode == 'mb'){
                        var absX = base.options.gridPoditionMargin.left;
                    }else{
                        var absX = base.options.gridPoditionMargin.left + base.options.pdfDocument.fontSize / 2;
                    }
                }
            }
            if(typeof (alignment.y) == 'number'){
                if(alignment.y < 0){
                    var absY = base.pizzaRect.h * 2 - base.options.gridPoditionMargin.bottom + alignment.y * base.options.pdfDocument.lineHeight;
                }else{
                    var absY = base.options.gridPoditionMargin.top + alignment.y * base.options.pdfDocument.lineHeight;
                }
            }else{
                if(alignment.y == 'top'){
                    if(alignment.mode == 'mb'){
                        var absY = base.options.gridPoditionMargin.top + base.options.pdfDocument.lineHeight;
                    }else{
                       var absY = base.options.gridPoditionMargin.top;
                    }
                }
                if(alignment.y == 'bottom'){
                    if(alignment.mode == 'mb'){
                        var absY = base.pizzaRect.h * 2 - base.options.gridPoditionMargin.bottom -5;
                    }else{
                        var absY = base.pizzaRect.h * 2 - base.options.gridPoditionMargin.bottom - textHeight;
                    }
                }
            }
            var r = {
                x: absX,
                y: absY
            };
            return r; 
        },
        /**
         *  Returns the data for relevant for this plugin
         *
        **/
        getData: function( elem ){
            return $.data(elem, PLUGIN_NAME) || {};
        }
     };
    $.fn[PLUGIN_NAME].publicMethods = {
        update : function(elem,args){
            $.fn[PLUGIN_NAME].internalMethods.update(elem,args[0]);
        }
    };
    $.fn[PLUGIN_NAME].defaults = $.extend( true, {}, {
        io:null,
        socket:{},
        lang:{},
        pizza: []
    });
    $.fn[PLUGIN_NAME].base = $.extend({}, {
        snap : null,
        pizzaRect: {},
        profile: {},
        locateMapping : [12,8,4,0,1,2,3,7,11,15,14,13]
    });
})(jQuery);
