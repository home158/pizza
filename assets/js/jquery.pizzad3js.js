/*
    紫惹斗數SVG排版程式
*/

(function($) {
    var PLUGIN_NAME = "pizzad3js";
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
            base.snap = d3.select('#'+base.options.svgId)
                .attr("width", width)   // 设定 SVG 宽度
                .attr("height", height)  // 设定 SVG 高度
                .attr("viewBox", "0 0 "+base.options.pageSize.width+" "+base.options.pageSize.height)  // 设定 viewBox (x, y, width, height)
                .attr("preserveAspectRatio", "xMaxYMax"); // 设定比例缩放方式

           

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

            let rectGroups = base.snap.selectAll(".rect-group")
                .data(base.locateMapping)
                .enter()
                .append("g")
                .attr("class", "rect-group")
                .attr("transform", (d,i) => {
                    let p = tmpLocate[d];
                    base.options.pizza[i].locateTopLeft = p; // 更新 pizza 位置

                    return `translate(${p.x}, ${p.y})`;
                })
                .each(function (d, i) {
                    base.rectGroupsArray[i] = d3.select(this); // 存儲 g 的 D3 選擇器
                });
            
            rectGroups.append("rect")
                .attr("width", base.pizzaRect.w)
                .attr("height", base.pizzaRect.h)
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .on("click", function () {
                    let currentColor = window.getComputedStyle(this).fill;
                    let isOrange = currentColor === "rgb(255, 165, 0)";
                    let newColor = isOrange ? "white" : "orange";
            
                    d3.select(this)
                        .transition().duration(200)
                        .attr("fill", newColor);
                });
                let rectCenterGroups = base.snap
                .append("g")
                .attr("class", "center-group")
                .attr("transform", (d,i) => {
                    return `translate(${tmpLocate[5].x}, ${tmpLocate[5].y})`;
                })
                .append("rect")
                .attr("width", base.pizzaRect.w*2)
                .attr("height", base.pizzaRect.h*2)
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", 2)

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
  
                text = d3.select("svg")
                .append("text")
                .attr("x", 100) // 設定 X 位置
                .attr("y", 100) // 設定 Y 位置
                .attr("visibility", "visible") // 設定可見性
                .attr("font-family", "GenShinGothicRegular") // 設定字體
                .text(o.data[0].trim()); // 設定文字內容（去除前後空格）
              
                $firstGrid = this.retvieveFirstRelativePosition(elem, o , text , true);
                o.grid[0].x = $firstGrid.x;
                o.grid[0].y = $firstGrid.y;
                r = this.relativeGrid2AbsolutePosition(elem, o.grid[0].x, o.grid[0].y, base.options.pizza[i].locateTopLeft);
                text.attr("x", r.x).attr("y", r.y);
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
                        text = d3.select("svg")
                        .append("text")
                        .attr("x", 100) // 設定 X 位置
                        .attr("y", 100) // 設定 Y 位置
                        .attr("visibility", "visible") // 設定可見性
                        .attr("font-family", "GenShinGothicRegular") // 設定字體
                        .text(o.data[next].trim()); // 設定文字內容（去除前後空格）
                      
                        $firstGrid = this.retvieveFirstRelativePosition(elem, o , text , true);
                        o.grid[next].x = $firstGrid.x;
                        r = this.relativeGrid2AbsolutePosition(elem, o.grid[next].x, o.grid[next].y, base.options.pizza[i].locateTopLeft);
                        text.attr("x", r.x).attr("y", r.y);
                    }else{
                        r = this.relativeGrid2AbsolutePosition(elem, o.grid[next].x, o.grid[next].y, base.options.pizza[i].locateTopLeft);
                        text = d3.select("svg")
                        .append("text")
                        .attr("x", r.x) // 設定 X 位置
                        .attr("y", r.y) // 設定 Y 位置
                        .attr("visibility", "visible") // 設定可見性
                        .attr("font-family", "GenShinGothicRegular") // 設定字體
                        .text(o.data[j].trim()); // 設定文字內容（去除前後空格）
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
                text = d3.select("svg")
                .append("text")
                .attr("x", 50)
                .attr("y", 50)
                .attr("writing-mode", "tb")
                .attr("visibility", "visible")
                .attr("font-family", "GenShinGothicRegular")
                .text(o.data[0]);
              
                
                if(step == "step4"){
                    text.attr("fill", "purple");
                }
                
                $firstGrid = this.retvieveFirstRelativePosition(elem, o , text);
                o.grid[0].x = $firstGrid.x;
                o.grid[0].y = $firstGrid.y;
                r = this.relativeGrid2AbsolutePosition(elem, o.grid[0].x, o.grid[0].y, base.options.pizza[i].locateTopLeft);
                text.attr("x", r.x).attr("y", r.y);
                if(o.symbol){
                    if(o.symbol[0] == "circle"){
                        // 在 SVG 中新增一個圓形
                        var c = d3.select("svg")
                        .append("circle")
                        .attr("cx", r.x + $firstGrid.w * 0.09)  // 設定圓心 X 座標
                        .attr("cy", r.y + $firstGrid.w * 2.45)  // 設定圓心 Y 座標
                        .attr("r", 10)                          // 設定圓半徑
                        .attr("fill", "none")                   // 無填充色
                        .attr("stroke", "#F00")                 // 紅色邊框
                        .attr("stroke-width", 1);               // 邊框寬度

                    }
                    if(o.symbol[0] == "triangle"){
                        
                        text.attr("fill","red");
                        var x = r.x-5;
                        var y = r.y-3;
                        var len = 13;
                        
                        var c = d3.select("svg")
                        .append("polygon")
                        .attr("points", `${x},${y} ${x + len / 2},${y - (len / 2) * 1.732} ${x + len},${y}`)
                        .attr("fill", "#F00")   // 設定填充顏色為紅色
                        .attr("stroke", "#F00"); // 設定邊框顏色為紅色
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
                        
                        if(step == "step4"){
                            text.attr("fill","purple");
                        }
                        
                        text = d3.select("svg")
                        .append("text")
                        .attr("x", r.x) // 設定 X 位置
                        .attr("y", r.y) // 設定 Y 位置
                        .attr("writing-mode", "tb") // 設定文字書寫方向
                        .attr("visibility", "visible") // 讓文字可見
                        .attr("font-family", "GenShinGothicRegular") // 設定字體
                        .text(o.data[j]); // 設定文字內容
                      
                    }
                    if(o.symbol){
                        if(o.symbol[j] == "circle"){
                            
                            var c = d3.select("svg")
                            .append("circle")
                            .attr("cx", r.x + $firstGrid.w * 0.09) // 設定圓心 X 座標
                            .attr("cy", r.y + $firstGrid.w * 2.45) // 設定圓心 Y 座標
                            .attr("r", 10)                         // 設定圓半徑
                            .attr("fill", "none")                   // 無填充色
                            .attr("stroke", "#F00")                 // 紅色邊框
                            .attr("stroke-width", 1);               // 邊框寬度
                        }
                        if(o.symbol[j] == "triangle"){
                            text.attr("fill","red");
                            var x = r.x-5;
                            var y = r.y-3;
                            var len = 13;
                            
                            var c = d3.select("svg")
                            .append("polygon")
                            .attr("points", `${x},${y} ${x + len / 2},${y - (len / 2) * 1.732} ${x + len},${y}`)
                            .attr("fill", "#F00")   // 設定填充顏色為紅色
                            .attr("stroke", "#F00"); // 設定邊框顏色為紅色
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
            base.snap.selectAll("text")
            .data(o.data)
            .enter()
            .append("text")
            .text(d => d)
            .attr("font-family", "GenShinGothicRegular")
            .attr("visibility", "visible")
            .attr("writing-mode", (d, i) => o.alignment[i]?.mode || "tb")
            .each(function (d, i) {
                
                let textElem = d3.select(this);
                let grid = that.retvieveRelativePosition(elem, o.alignment[i], textElem);

                o.grid[i].x = grid.x;
                o.grid[i].y = grid.y;
        
                let absolutePos = that.relativeGrid2AbsolutePosition(
                    elem, o.grid[i].x, o.grid[i].y, base.profile.locateTopLeft
                );
                textElem.attr("x", absolutePos.x)
                        .attr("y", absolutePos.y);
                let bbox = textElem.node().getBBox(); // 取得文字範圍
            })
            .on("click", function() {
                let currentWeight = d3.select(this).attr("font-weight"); // 取得當前字重
                d3.select(this).attr("font-weight", currentWeight === "bold" ? "normal" : "bold"); // 切換字重
            });
        
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
            var b = text.node().getBBox();
            textHeight = b.height;
            textWidth = b.width;
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
            var b = text.node().getBBox();
            textHeight = b.height;
            
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
        locateMapping : [12,8,4,0,1,2,3,7,11,15,14,13],
        rectGroupsArray : []
    });
})(jQuery);
