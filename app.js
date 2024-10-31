const config = require('./config');
const validator = require('is-my-date-valid')
const validate = validator({ format: 'YYYY-M-D' })

module.exports = {
	writeStream : Object,
	/* 算命者生辰 */
	lunarBirth : {
			name : '林意昕',
			AD : {
				y: 2021,
				m: 1,
				d: 21
			},
			type: 2, //	0:天盤 | 1:地盤 | 2:人盤
			y : {
				decimal : '戊',		//十天干
				duodecimal : '辰'	//十二地支
			},
			m : 7,					//月份, 0: 1月 | 1: 2月 | 2: 3月 | ...... | 11: 12月
			d : 17,
			h : '辰',
			gender : 0,				//性別, 0: 女 | 1: 男
			clockwise: null,		//true 順時針 | false 逆時針
			decade_start: null		//十年大運起始
	},
	lunar : Object,
	//定義pdf輸出參數
	pdfDocument :{
		size : 'A4',
		lineWidth : 1,
		margin:{
			x:30,
			y:30
		},
        fontSize : 12,
        lineHeight : 15
	},
	//文件輸出長寬 px 
	pageSize :{},
	gridPoditionMargin:{
		top: 5,
		right : 5,
		bottom: 5,
		left: 5
	},
	heavenlyStems : config.heavenlyStems,
	earthlyBranches : config.earthlyBranches,
	zodiac_cycle : config.zodiac_cycle,
	five_cycle_period: config.five_cycle_period,
	five_cycle: config.five_cycle,
	chinese_numerals: config.chinese_numerals,
	pizza : [],
	profile : {},
	doc: Object,

	locateMapping: [12,8,4,0,1,2,3,7,11,15,14,13],
	locateStart: {x:12,y:10},
	pizzaRect: {
		w: 204,
		h: 144
	},
	pdfFilename: 'node',
	master_star: config.master_star,
	slave_star: config.slave_star,
	storage_position: -1, //錄存所在宮位
	moon_star: config.moon_star,
	hour_star: config.hour_star,
	hour_1_position: -1, //文曲所在宮位
	energe_star: config.energe_star,
	energe_mapping_start: config.energe_mapping_start,
	branch_star: config.branch_star,
	buddha_position: -1, //華蓋所在宮位
	branch_2_position : -1, // 鳳閣所在宮位
	four_star: config.four_star,
	jupiter_star: config.jupiter_star,
	jupiter_0_position: -1,	// 歲建所在的宮位
	gem_star: config.gem_star,
	longevity_star: config.longevity_star,
	sixty_tone: config.sixty_tone,
	four_mapping: config.four_mapping,
	fontStyle: 'assets/fonts/GenShinGothic-Regular.ttf',//mingliu.ttf
	lineGap: -5,
	friend_position: -1, //交友宮所在宮位
	sick_position: -1, //疾厄宮所在宮位
	land_position: -1, //福德宮所在宮位
	phd_star: config.phd_star,	
	retrievePostData: function(jsonPersonData){
		var y = this.lunarBirth.AD.y;
		var m = this.lunarBirth.AD.m;
		var d = this.lunarBirth.AD.d;
		if(jsonPersonData.type){
			if(jsonPersonData.type >= 0 && jsonPersonData.type <= 2 ){
				this.lunarBirth.type = parseInt( jsonPersonData.type , 10); 
			}
		}

		if(jsonPersonData.y){
			if(jsonPersonData.y > 1900 && jsonPersonData.y < 2100 ){
				this.lunarBirth.AD.y = parseInt( jsonPersonData.y , 10);
			}
		}

		if(jsonPersonData.m){
			if(jsonPersonData.m >= 1 && jsonPersonData.m <= 12 ){
				this.lunarBirth.AD.m = parseInt( jsonPersonData.m , 10);
			}
		}
		if(jsonPersonData.d){
			if(jsonPersonData.d >= 1 && jsonPersonData.d <= 31 ){
				this.lunarBirth.AD.d = parseInt( jsonPersonData.d , 10);
			}
		}
		if(!validate(this.lunarBirth.AD.y+'-'+this.lunarBirth.AD.m+'-'+this.lunarBirth.AD.d)){
			this.lunarBirth.AD.y = y;
			this.lunarBirth.AD.m = m;
			this.lunarBirth.AD.d = d;
		}

		if(jsonPersonData.h){
			if(this.retrieveDuodecimalIndex(jsonPersonData.h) > -1){
				this.lunarBirth.h = jsonPersonData.h;
			}
		}

			
		if(jsonPersonData.gender){
			if(jsonPersonData.gender >= 0 && jsonPersonData.gender <= 1 ){
				this.lunarBirth.gender = parseInt( jsonPersonData.gender , 10);
			}
		}
			

		if(jsonPersonData.name)
			this.lunarBirth.name = jsonPersonData.name;
	},

	/* function */
	getProfile : function(jsonPersonData){
		this.retrievePostData(jsonPersonData);
		var LunarCalendar = require("lunar-calendar");
		this.lunar = LunarCalendar.solarToLunar(this.lunarBirth.AD.y,this.lunarBirth.AD.m,this.lunarBirth.AD.d);
		this.lunarBirth.y.decimal = this.lunar.GanZhiYear[0];
		this.lunarBirth.y.duodecimal = this.lunar.GanZhiYear[1];
		

		this.lunarBirth.d = this.lunar.lunarDay 
		//那年沒有閏月;
		if(this.lunar.lunarLeapMonth == 0){
			this.lunarBirth.m = this.lunar.lunarMonth - 1;
		}else{
			//生月在閏月
			if(this.lunar.lunarLeapMonth == (this.lunar.lunarMonth - 1) ){
				if(this.lunar.lunarDay <= 15){
					this.lunarBirth.m = this.lunar.lunarMonth - 2;
				}else{
					this.lunarBirth.m = this.lunar.lunarMonth - 1;
				}
			}
			if(this.lunar.lunarLeapMonth < (this.lunar.lunarMonth - 1)) {
				this.lunarBirth.m = this.lunar.lunarMonth - 2;
			}
			if(this.lunar.lunarLeapMonth >= (this.lunar.lunarMonth)){
				this.lunarBirth.m = this.lunar.lunarMonth - 1;
			}
		}
		this.saveProfileDataToHistory();
		this.elements();

		this.profile_calculate();


		
		this.setp1_calculate();

		this.setp2_calculate();

		this.setp3_calculate();
		
		this.setp4_calculate();

		this.setp5_calculate();
		this.setp6_calculate();
		this.setp7_calculate();
		this.setp8_calculate();
		this.setp9_calculate();
		this.setp10_calculate();
		this.setp11_calculate();
		this.setp12_calculate();
		this.setp13_calculate();
		this.setp14_calculate();
		this.setp15_calculate();
		this.setp16_calculate();
		this.setp17_calculate();
		this.setp18_calculate();
		this.setp19_calculate();
		this.setp20_calculate();
		this.setp21_calculate();
		this.setp22_calculate();
		this.setp23_calculate();
		this.setp24_calculate();
		this.setp25_calculate();
		this.setp26_calculate();
		this.setp27_calculate();
		this.setp28_calculate();
		this.setp29_calculate();
		this.setp30_calculate();

		this.svgLayout();
	    var res = {
	     		profile: this.profile,
	     		pageSize: this.pageSize,
		    	pizza: this.pizza,
		    	pdfDocument: this.pdfDocument,
				gridPoditionMargin: this.gridPoditionMargin,
				lunarBirth: this.lunarBirth
		    };
        return res;
	},
	saveProfileDataToHistory: function(){
		var fs = require('fs');
		var historyJSON = {};
		/*
		try {
		  var data = fs.readFileSync('profile_history.json', 'utf8')
		  historyJSON = JSON.parse(data);
		} catch (err) {
		  console.error(err)
		}
		*/
		let r = Math.random().toString(36).substring(7);
		
		historyJSON[r] = this.lunarBirth;
		/*
		fs.writeFile("profile_history.json", JSON.stringify(historyJSON), function (err) {
			if (err) throw err;
		});
		*/

	},
    svgLayout: function(){
        var pdf = require('pdfkit');
        /*
         *  phototype.size() 取得文件px大小
        */
	    pdf.prototype.size = function() {
	      return {
	        width: this.page.width,
	        height: this.page.height
	      };
	    };
		this.doc = new pdf({
				size: this.pdfDocument.size,
				layout : 'landscape',
				margin: 0
			});	    
	    this.pageSize = this.doc.size();
	},	
	init : function(){
		var LunarCalendar = require("lunar-calendar");
		this.lunar = LunarCalendar.solarToLunar(this.lunarBirth.AD.y,this.lunarBirth.AD.m,this.lunarBirth.AD.d);
		this.lunarBirth.y.decimal = this.lunar.GanZhiYear[0];
		this.lunarBirth.y.duodecimal = this.lunar.GanZhiYear[1];
		this.lunarBirth.d = this.lunar.lunarDay 
		//那年沒有閏月;
		if(this.lunar.lunarLeapMonth == 0){
			this.lunarBirth.m = this.lunar.lunarMonth - 1;
		}else{
			//生月在閏月
			if(this.lunar.lunarLeapMonth == (this.lunar.lunarMonth - 1) ){
				if(this.lunar.lunarDay <= 15){
					this.lunarBirth.m = this.lunar.lunarMonth - 2;
				}else{
					this.lunarBirth.m = this.lunar.lunarMonth - 1;
				}
			}
			if(this.lunar.lunarLeapMonth < (this.lunar.lunarMonth - 1)) {
				this.lunarBirth.m = this.lunar.lunarMonth - 2;
			}
			if(this.lunar.lunarLeapMonth >= (this.lunar.lunarMonth)){
				this.lunarBirth.m = this.lunar.lunarMonth - 1;
			}
		}

		this.elements();
		this.profile_calculate();
		this.pdfLayout();
		this.setp1_calculate();
		this.setp2_calculate();
		this.setp3_calculate();
		this.setp4_calculate();
		this.setp5_calculate();
		this.setp6_calculate();
		this.setp7_calculate();
		this.setp8_calculate();
		this.setp9_calculate();
		this.setp10_calculate();
		this.setp11_calculate();
		this.setp12_calculate();
		this.setp13_calculate();
		this.setp14_calculate();
		this.setp15_calculate();
		this.setp16_calculate();
		this.setp17_calculate();
		this.setp18_calculate();
		this.setp19_calculate();
		this.setp20_calculate();
		this.setp21_calculate();
		this.setp22_calculate();
		this.setp23_calculate();
		this.setp24_calculate();
		this.setp25_calculate();
		this.setp26_calculate();
		this.setp27_calculate();
		this.setp28_calculate();
		this.setp29_calculate();
		this.setp30_calculate();

		this.textProfileLayout();
		this.textVerticalLayout('step1','left');
		this.textHorizontalLayout('step3');
		this.textVerticalLayout('step4','left');
		this.textVerticalLayout('magnitude0','left');
		this.textVerticalLayout('magnitude1','right');
		this.textVerticalLayout('magnitude2','right');
		
		this.pdfEnd();
	},
	/*
	*	五行起寅首
	*	參考P.52
	*
	*/
	setp1_calculate: function(){
		var str_decimal	=  this.lunarBirth.y.decimal;
		var int_Duodecimal_start = 2; //起寅首
		//根據P.52轉換公式
		var int_decimal_position = this.retrieveDecimalIndex(str_decimal) % 5;
		var x1 = ( int_decimal_position + 1 )*2 % 10;	
		var x = this.heavenlyStems[x1];

		this.pizza[0].step1.data[0] = x + this.earthlyBranches[int_Duodecimal_start];

		
		var i;
		for( i = 1; i < 12; i++ ){
			this.pizza[i].step1.data[0] = this.heavenlyStems[(x1 + i) % 10] + this.earthlyBranches[(int_Duodecimal_start + i) % 12];
		}	
	},
	/*
	*	定命身宮 14 + 月份 - 生辰 除 12 取餘數
	*
	*
	*/
	setp2_calculate: function(){
		//身宮
		var b_index = ( 14 + this.lunarBirth.m + this.retrieveDuodecimalIndex(this.lunarBirth.h) ) % 12;
		var b = this.earthlyBranches[b_index];
		

		//命宮
		var a_index = ( 14 + this.lunarBirth.m - this.retrieveDuodecimalIndex(this.lunarBirth.h) ) % 12;
		var a = this.earthlyBranches[a_index];

		//找出身宮位置
		for( i = 0 ; i < 12 ; i++){
			//生辰在子與午，身宮與命宮相同
			if( this.lunarBirth.h == this.earthlyBranches[0] || this.lunarBirth.h == this.earthlyBranches[6] ) {
				if( a == this.pizza[i].step1.data[0][1]){
					this.pizza[i].step1.data.push('身宮');
					//身宮grid
					this.profile.life.pizza = i;
					//身宮地支
					this.profile.life.duodecimal = a;
				}
			}else{
				if( b == this.pizza[i].step1.data[0][1]){
					this.pizza[i].step1.data.push('身宮');
					//身宮grid
					this.profile.life.pizza = i;
					//身宮地支
					this.profile.life.duodecimal = b;
				}					
			}
		}		
		
		//找出命宮位置
		var zodiac_start, zodiac_next, i;
		switch(this.lunarBirth.type){
			case 0:
				this.profile.data.push('天盤');

				for( i = 0 ; i < 12 ; i++){
					if( a == this.pizza[i].step1.data[0][1]){
						zodiac_start = i;
						this.pizza[i].step1.data.push( this.zodiac_cycle[0] );	//命宮
						//命宮地支
						this.profile.zodiac.duodecimal = a;
						//命宮grid
						this.profile.zodiac.pizza = zodiac_start;
					}
				}
			break;
			case 1:
				this.profile.data.push('地盤');
				zodiac_start = this.profile.life.pizza;
				this.pizza[zodiac_start].step1.data.push( this.zodiac_cycle[0] );	//命宮
				//命宮地支
				this.profile.zodiac.duodecimal = this.pizza[zodiac_start].step1.data[0][1];
				//命宮grid
				this.profile.zodiac.pizza = zodiac_start;
			break;
			case 2:
				this.profile.data.push('人盤');
				for( i = 0 ; i < 12 ; i++){
					if( a == this.pizza[i].step1.data[0][1]){
						zodiac_start = i;
						//命宮地支
						this.profile.zodiac.duodecimal = a;
						//命宮grid
						this.profile.zodiac.pizza = zodiac_start;
					}
				}
				//天盤其他11宮由命宮順時針放
				for( i = 1; i < 12; i++){
					zodiac_start += 1;
					zodiac_next = zodiac_start % 12;
					//福德宮所在宮位
					if(i == 2){
						this.land_position = zodiac_next;
					}
				}
				
				//以天盤的福德宮當命宮
				zodiac_start = this.land_position;
				this.pizza[zodiac_start].step1.data.push( this.zodiac_cycle[0] );	//命宮
				//命宮地支
				this.profile.zodiac.duodecimal = this.pizza[zodiac_start].step1.data[0][1];
				//命宮grid
				this.profile.zodiac.pizza = zodiac_start;

				
			break;
		}
		this.profile.grid.push({x:-1,y:-1});
		this.profile.alignment.push({x:-3,y:'bottom',mode:'tb'});


		//其他11宮由命宮順時針放
		for( i = 1; i < 12; i++){
			zodiac_start += 1;
			zodiac_next = zodiac_start % 12;
			this.pizza[zodiac_next].step1.data.push( this.zodiac_cycle[i] );
			//交友宮所在宮位
			if(i == 5){
				this.friend_position = zodiac_next;
			}
			//疾厄宮所在宮位
			if(i == 7){
				this.sick_position = zodiac_next;
			}
		}


	},
	/*
	*	定五行局 定命宮十年大運
	*
	*
	*/
	setp3_calculate: function(){
		var padLeft = require('pad-left');
		var padRight = require('pad-right');
		var i,
		zodiacIndex = this.profile.zodiac.pizza;
    	//five_cycle[天干%5 , Math.floor(命宮地支/2)]
		var int_decimal_position = this.retrieveDecimalIndex( this.lunarBirth.y.decimal ) % 5;

		var int_duodecimal_position = Math.floor( this.retrieveDuodecimalIndex( this.profile.zodiac.duodecimal ) / 2 );
		
		//十年大運起始
    	var decade_start = this.five_cycle_period[int_decimal_position][int_duodecimal_position];


		//起五行局
		this.lunarBirth.decade_start = decade_start;
		
    	//寫入局數資料
    	
		this.profile.data.push(this.five_cycle[decade_start]);
		this.profile.grid.push({x:-1,y:-1});
		this.profile.alignment.push({x:-7,y:'bottom',mode:'tb'});

    	//console.log(decade_start);
		if(this.lunarBirth.clockwise == true){
			//十年大運順時針
			for( i = 0 ; i < 12 ; i++){
				decade_end = decade_start + 9;
				this.pizza[zodiacIndex].step3.data.push( decade_start + ' - ' + decade_end);
				decade_start = decade_end + 1 

				zodiacIndex += 1;
				zodiacIndex = zodiacIndex % 12;
			}
		}else{
			//十年大運逆時針
			for( i = 12 ; i > 0 ; i--){
				zodiacIndex += 12;
				zodiacIndex = zodiacIndex % 12;
				//console.log(zodiacIndex);
				
				
				decade_end = decade_start + 9;

				this.pizza[zodiacIndex].step3.data.push( padLeft(decade_start, 3, ' ') + ' - ' + padRight(decade_end, 3, ' '));
				decade_start = decade_end + 1 
				
				 
				zodiacIndex -= 1;
				
			}
		}
	},
	/*
	*
	*	起紫微星
	*
	*/
	setp4_calculate: function(){
		var decade_start = this.lunarBirth.decade_start ;
		var ziwei = [0];	//紫微對照表
		var i,j;
		ziwei[decade_start] = 2;
		
		for( i = 1 ; i <= 31 ; i ++){
			if(i < decade_start){
				//木和土局為單數，所以先順後逆方法計算。
				if(decade_start % 2 == 1){
					if(i % 2 == 1){
						ziwei[i] = ziwei[decade_start] + (decade_start-i+1) - 1;
					}else{
						ziwei[i] = ziwei[decade_start] - (decade_start-i+1) + 1;
					}
				}else{
					//水、金、火局為雙數，所以先逆後順方法計算。
					if(i % 2 == 0){
						ziwei[i] = ziwei[decade_start] + (decade_start-i+1) - 1;
					}else{
						ziwei[i] = ziwei[decade_start] - (decade_start-i+1) + 1;
					}
				}
			}
			if(i > decade_start){
				if(i % decade_start == 0){
					ziwei[i] = 2 + Math.floor( i / decade_start ) - 1;
				}else{
					ziwei[i] = ziwei[i % decade_start] + Math.floor( i / decade_start );

				}
			}
			ziwei[i] = Math.abs( ziwei[i] + 12 ) % 12;
		}
		for( i = 0 ; i < 12 ; i++){

			if( ziwei[this.lunarBirth.d] == this.retrieveDuodecimalIndex(this.pizza[i].step1.data[0][1]) ){
				this.profile.ziwei.pizza = i;
				this.pizza[i].step4.data.push(this.master_star.cate_1[0]);
				
			}
		}

		//紫微星系
		var m = this.profile.ziwei.pizza , //紫微星位置
			n, //天府星位置
			cate_1, cate_2;
		for( i = 1 ; i < 12 ; i++){
			m = ( m - 1 + 12 ) % 12 ;
			cate_1 = this.master_star.cate_1[i];
			if(cate_1 != null ){
				this.pizza[m].step4.data.push(cate_1);
			}
		}

		//天府星系
		m = this.profile.ziwei.pizza; //紫微星位置
		//對角線位置
		n = (12 - m) % 12 ;

		this.pizza[n].step4.data.push(this.master_star.cate_2[0]);
		for( i = 1 ; i < 12 ; i++){
			n = ( n + 1 ) % 12 ;
			cate_2 = this.master_star.cate_2[i];
			if(cate_2 != null ){
				this.pizza[n].step4.data.push(cate_2);
			}			
		}
	},
	/*
	*	年干諸星
	*
	*/
	setp5_calculate: function(){
		var slave_star = this.slave_star , row,
			m , n , p;

		//火星 鈴星
		var energe_mapping_start = this.energe_mapping_start;
		var energe_star = this.energe_star;
			m = this.retrieveDuodecimalIndex(this.lunarBirth.h);
		for( i = 0 ; i < energe_star.length ; i++){
			row = energe_star[i];
			p = this.retrieveDuodecimalIndex(this.lunarBirth.y.duodecimal);
			row.start = energe_mapping_start[p][i];
			if(row.clockwise == true){
				n = m + row.start;
			}else{
				n = row.start - m;
			}
			n = (n + 12 - 2) % 12;
			name = row.name;

			if(row.magnitude == 0){
				this.pizza[n].magnitude0.data.push(name);
			}else{
				this.pizza[n].magnitude1.data.push(name);
			}
		}

			
		m = this.retrieveDecimalIndex(this.lunarBirth.y.decimal);
		for( i = 0 ; i < slave_star.length ; i++){
			row = slave_star[i];
			n = row.mapping[m];
			name = row.name;
			n = Math.abs(n + 12 - 2) % 12;

			if(row.magnitude == 0){
				this.pizza[n].magnitude0.data.push(name);
			}else{
				this.pizza[n].magnitude1.data.push(name);
			}
			//禄存
			if(i == 0){
				this.storage_position = n;
			}
		}

		var moon_star = this.moon_star;
		for( i = 0 ; i < moon_star.length ; i++){
			row = moon_star[i];
			if(row.clockwise == true){
				n = this.lunarBirth.m + row.start;
			}else{
				n = row.start - this.lunarBirth.m;
			}
			n = Math.abs(n + 12 - 2) % 12;
			name = row.name;

			if(row.magnitude == 0){
				this.pizza[n].magnitude0.data.push(name);
			}else{
				this.pizza[n].magnitude1.data.push(name);
			}
		}
		var hour_star = this.hour_star;
		m = this.retrieveDuodecimalIndex(this.lunarBirth.h);
		for( i = 0 ; i < hour_star.length ; i++){
			row = hour_star[i];
			if(row.clockwise == true){
				n = m + row.start;
			}else{
				n = row.start - m;
			}
			n = Math.abs(n + 12 - 2) % 12;
			name = row.name;

			if(row.magnitude == 0){
				this.pizza[n].magnitude0.data.push(name);
			}else{
				this.pizza[n].magnitude1.data.push(name);
			}
			//文曲所在宮位
			if(i == 1){
				this.hour_1_position = n;
			}
		}

		var branch_star = this.branch_star;
		m = this.retrieveDuodecimalIndex(this.lunarBirth.y.duodecimal);

		for( i = 0 ; i < branch_star.length ; i++){
			row = branch_star[i];
			if(row.shift){
				a = m + row.shift;
				a = Math.abs( a + 12 ) % 12;
				n = Math.floor( a / 3 ) * row.step + row.start;
			}else{
				n = row.step * m + row.start;
			}
			n = Math.abs( n + 12 * m  -2) % 12;
			name = row.name;
			if(row.magnitude == 0){
				this.pizza[n].magnitude0.data.push(name);
			}else{
				this.pizza[n].magnitude1.data.push(name);
			}

			//華蓋的宮位
			if(i == 7){
				this.buddha_position = n;
			}

			//鳳閣的宮位，年解與鳳閣同宮
			if(i == 2){
				this.branch_2_position = n;
			}
		}

		//天才
		m = this.retrieveDuodecimalIndex(this.lunarBirth.y.duodecimal);
		n = this.profile.zodiac.pizza + m;
		n = Math.abs( n + 12) % 12;
		this.pizza[n].magnitude1.data.push('天才');

		//天壽
		
		m = this.retrieveDuodecimalIndex(this.lunarBirth.y.duodecimal);
		n = this.profile.life.pizza + m;
		n = Math.abs( n + 12) % 12;
		this.pizza[n].magnitude1.data.push('天壽');
		
	},
	/*
	*
	*
	*
	*/
	setp6_calculate: function(){
		var i , n , magnitude0 , magnitude1;
		for(i = 0 ; i < 12 ; i++){
			magnitude0 = this.pizza[i].magnitude0;
			magnitude1 = this.pizza[i].magnitude1;
			//左輔位置
			if( magnitude0.data.indexOf(this.moon_star[0].name) != -1){
				n = i+this.lunarBirth.d - 1;
				n = Math.abs( n + 12) % 12;
				this.pizza[n].magnitude1.data.push('三台');
			}
			//右弼位置
			if( magnitude0.data.indexOf(this.moon_star[1].name) != -1){
				n = i - this.lunarBirth.d + 1;
				n = Math.abs( n + 36) % 12;
				this.pizza[n].magnitude1.data.push('八座');
			}
			//文昌位置
			if( magnitude0.data.indexOf(this.hour_star[0].name) != -1){
				n = i+this.lunarBirth.d - 2;
				n = Math.abs( n + 12) % 12;
				this.pizza[n].magnitude1.data.push('恩光');
			}
			//文曲位置
			if( magnitude0.data.indexOf(this.hour_star[1].name) != -1){
				n = i+this.lunarBirth.d - 2;
				n = Math.abs( n + 12) % 12;
				this.pizza[n].magnitude1.data.push('天貴');
			}
		}
	},
	/*
	*	四化
	*
	*
	*/
	setp7_calculate: function(){
		var i , j, m , n , p ,magnitude0 , magnitude1 , row;

			m = this.retrieveDecimalIndex(this.lunarBirth.y.decimal);
		var four_mapping = this.four_mapping;
		var four_star = this.four_star;
		for(i = 0 ; i < four_mapping.length ; i++){
			row = four_star[m];
			for(j = 0 ; j < 12 ; j++){
				p = this.pizza[j].step4.data.indexOf( row[i] );
				if( p != -1){
					this.pizza[j].step4.data[p] =  row[i] + four_mapping[i];
				}
			}
			for(j = 0 ; j < 12 ; j++){
				p = this.pizza[j].magnitude0.data.indexOf( row[i] );				
				if( p != -1){
					this.pizza[j].magnitude0.data[p] = row[i] + four_mapping[i];
				}
			}
			
		}

	},
	/*
	*	太歲十二神
	*
	*/
	setp8_calculate: function(){
		var m, n, i;
		m = this.retrieveDuodecimalIndex( this.lunarBirth.y.duodecimal );
		for(i = 0 ; i < this.jupiter_star.length ; i++){
			n = Math.abs( m + i - 2) % 12;
			this.pizza[n].magnitude2.data.push(this.jupiter_star[i]);
			//歲建所在的宮位，下一個宮位為天空
			if(i == 0){

				this.jupiter_0_position = n; //歲建所在的宮位
			}
		}
	},
	/*
	* 	將星十二神
	*
	*/
	setp9_calculate: function(){
		var m, n, i;

		m = this.retrieveDuodecimalIndex( this.lunarBirth.y.duodecimal );
		n = m % 4;

			switch(n){
				case 0:
				case 3:
					n += 10;
				break;
				case 1:
					n += 6;
				break;
				case 2:
					n += 2;
				break;
			}
		n = Math.abs( n ) % 12;
		for(i = 0 ; i < this.gem_star.length ; i++){

			x = Math.abs( n + i ) % 12;

			this.pizza[x].magnitude2.data.push(this.gem_star[i]);
		}
	},
	/*
	*	長生十二神
	*
	*/
	setp10_calculate: function(){
		switch(this.lunarBirth.decade_start){
			case 2:
			case 5:
				n = 6;
			break;
			case 3:
				n = 9;
			break;
			case 4:
				n = 3;
			break;
			case 6:
				n = 0;
			break;
		}

		if(this.profile.data[0] == '陽男' || this.profile.data[0] == '陰女'){
			for(i = 0 ; i < this.longevity_star.length ; i++){
				x = Math.abs( n + i ) % 12;
				this.pizza[x].step3.data.push(this.longevity_star[i]);
			}
		}else{
			for(i = 0 ; i < this.longevity_star.length ; i++){
				x = Math.abs( n - i + 12) % 12;
				this.pizza[x].step3.data.push(this.longevity_star[i]);
			}
		}
	},
	/*
	*	天空，歲建下一個宮位即是天空
	*
	*/
	setp11_calculate: function(){
		var n = (this.jupiter_0_position + 1) % 12;
		this.pizza[n].magnitude1.data.push('天空');
	},
	/*
	*	天哭;天虛
	*	index 4 順時針數到地支年為天哭
	*	index 4 逆時針數到地支年為天虛
	*/
	setp12_calculate: function(){
		var n , m;
		m = this.retrieveDuodecimalIndex( this.lunarBirth.y.duodecimal );
		n = Math.abs(4 + m) % 12;
		this.pizza[n].magnitude1.data.push('天虛');
		n = Math.abs(12 + 4 - m) % 12;
		this.pizza[n].magnitude1.data.push('天哭');

	},
	/*
	*	蜚廉
	*
	*/
	setp13_calculate: function(){
		var mapping = [6,7,8,3,4,5,0,1,2,9,10,11];
		var m = this.retrieveDuodecimalIndex( this.lunarBirth.y.duodecimal );
		var n = mapping[m];
		this.pizza[n].magnitude1.data.push('蜚廉');

	},
	/*
	*	天德
	*
	*/
	setp14_calculate: function(){
		var n , m;
		m = this.retrieveDuodecimalIndex( this.lunarBirth.y.duodecimal );
		n = Math.abs(7 + m) % 12;
		this.pizza[n].magnitude1.data.push('天德');
	},
	/*
	*	月德
	*
	*/
	setp15_calculate: function(){
		var n , m;
		m = this.retrieveDuodecimalIndex( this.lunarBirth.y.duodecimal );
		n = Math.abs(3 + m) % 12;
		this.pizza[n].magnitude1.data.push('月德');

	},
	/*
	*	破碎
	*
	*/
	setp16_calculate: function(){
		var n , m;
		m = this.retrieveDuodecimalIndex( this.lunarBirth.y.duodecimal );
		n = Math.abs( 12 + 3 + ( m % 3 ) * ( -4 ) ) % 12;
		this.pizza[n].magnitude1.data.push('破碎');
	},
	/*
	*	解神
	*
	*/
	setp17_calculate: function(){
		var n;
		n = Math.abs( Math.floor(this.lunarBirth.m / 2 ) * 2 + 6 ) % 12;
		this.pizza[n].magnitude1.data.push('解神');
	},
	/*
	*	年解 與 鳳閣 同宮
	*
	*
	*/
	setp18_calculate: function(){
		var n = this.branch_2_position;
		this.pizza[n].magnitude1.data.push('年解');
	},
	/*
	*	天巫
	*
	*
	*/
	setp19_calculate: function(){
		var mapping = [3,6,0,9];
		var m = this.lunarBirth.m % 4;
		var n = mapping[m];
		this.pizza[n].magnitude1.data.push('天巫');
	},
	/*
	*	天月
	*
	*
	*/
	setp20_calculate: function(){
		var mapping = [8,3,2,0,5,1,9,5,0,4,8,0];
		var m = this.lunarBirth.m;
		var n = mapping[m];
		this.pizza[n].magnitude1.data.push('天月');
	},
	/*
	*	陰煞
	*
	*
	*/
	setp21_calculate: function(){
		var m = this.lunarBirth.m;
		var n = Math.abs( 12 + ( m % 6 ) * (-2) ) % 12;
		this.pizza[n].magnitude1.data.push('陰煞');
	},
	/*
	*	天官
	*
	*
	*/
	setp22_calculate: function(){
		var m , n;
		var mapping = [5,2,3,0,1,7,9,7,8,4];

		m = this.retrieveDecimalIndex( this.lunarBirth.y.decimal );
		n = mapping[m];
		this.pizza[n].magnitude1.data.push('天官');
	},
	/*
	*	天福
	*
	*
	*/
	setp23_calculate: function(){
		var m , n;
		var mapping = [7,6,10,9,1,0,4,3,4,3];

		m = this.retrieveDecimalIndex( this.lunarBirth.y.decimal );
		n = mapping[m];
		this.pizza[n].magnitude1.data.push('天福');
	},
	/*
	*	台輔 封誥
	*
	*
	*/
	setp24_calculate: function(){
		var m , n;
		n = Math.abs(this.hour_1_position + 2) % 12;
		this.pizza[n].magnitude1.data.push('台輔');

		n = Math.abs(12 + this.hour_1_position - 2 ) % 12;
		this.pizza[n].magnitude1.data.push('封誥');
	},
	/*
	*	六十納音
	*
	*/
	setp25_calculate: function(){
		var n, s, g , w, f , r ;
		s = this.retrieveDecimalIndex( this.lunarBirth.y.decimal );
		g = this.retrieveDuodecimalIndex( this.lunarBirth.y.duodecimal );
		w = s - g;
		if(w < 0 ){
			w = w + 12;
		}
		f = Math.floor(w / 2);
		r = f * 10 + s;
		
		n = Math.floor(r / 2);
		this.profile.data.push( this.sixty_tone[n] );
		this.profile.grid.push({x:-1,y:-1});
		this.profile.alignment.push({x:-3,y:'top',mode:'tb'});

	},
	/*
	*	截空
	*
	*/
	setp26_calculate: function(){
		var s,n;
		s = this.retrieveDecimalIndex( this.lunarBirth.y.decimal );
		var m = [6,4,2,0,10,6,4,2,0,10];
		var n = m[s];
		this.pizza[n].magnitude1.data.push('截空');
		this.pizza[n+1].magnitude1.data.push('截空');

		
	},
	/*
	*	大耗
	*
	*/
	setp27_calculate: function(){
		var g;
		g = this.retrieveDuodecimalIndex( this.lunarBirth.y.duodecimal );
		var m = [5,4,7,6,9,8,11,10,1,0,3,2];
		var n = m[g];
		this.pizza[n].magnitude1.data.push('大耗');

	},
	/*
	*	天殤(傷)天使
	*
	*/
	setp28_calculate: function(){
		if(this.lunarBirth.gender == 0 ){
			if(this.lunarBirth.clockwise == true){
				//陰女
				this.pizza[this.friend_position].magnitude1.data.push('天殤');
				this.pizza[this.sick_position].magnitude1.data.push('天使');				
			}else{
				//陽女
				this.pizza[this.sick_position].magnitude1.data.push('天殤');
				this.pizza[this.friend_position].magnitude1.data.push('天使');				
			}
		}else{
			if(this.lunarBirth.clockwise == true){
				//陽男
				this.pizza[this.friend_position].magnitude1.data.push('天殤');
				this.pizza[this.sick_position].magnitude1.data.push('天使');				
			}else{
				//陰男
				this.pizza[this.sick_position].magnitude1.data.push('天殤');
				this.pizza[this.friend_position].magnitude1.data.push('天使');
			}
		}
	},
	/*
	*	博士十二神
	*
	*/
	setp29_calculate: function(){
		var m = this.storage_position;
		var phd_star = this.phd_star;
		if(this.lunarBirth.clockwise == true){
			for(i = 0 ; i < this.phd_star.length ; i++){
				n = Math.abs( m + i ) % 12;
				this.pizza[n].magnitude2.data.push(this.phd_star[i]);
			}
		}else{
			for(i = 0 ; i < this.phd_star.length ; i++){
				n = Math.abs( m - i + 12 ) % 12;
				this.pizza[n].magnitude2.data.push(this.phd_star[i]);
			}
		}
	},
	/*
	*  劫殺
	*
	*/
	setp30_calculate: function(){
		var m = this.buddha_position;
		var n = Math.abs( m + 1 ) % 12;
		this.pizza[n].magnitude1.data.push('劫殺');				

	},	
	textVerticalLayout: function(step , alignment){
		var i, r, text, j, elem, next, 
			alignment = alignment || 'right';


		for( i = 0; i < 12; i++ ){
			elem = this.pizza[i][step];

			//計算第一個grid位置
			text = elem.data[0];
			$firstGrid = this.retvieveFirstRelativePosition(elem.alignment , text , false , elem.data);

			elem.grid[0].x = $firstGrid.x;
			elem.grid[0].y = $firstGrid.y;


			next = 0;
			for( j = 0; j < elem.data.length; j++){
				next += 1;
				r = this.relativeGrid2AbsolutePosition( elem.grid[j].x, elem.grid[j].y, this.pizza[i].locateTopLeft);
				text = elem.data[j];
				this.doc
					.font(this.fontStyle)
				    .fontSize(this.pdfDocument.fontSize)
				    .text(text,r.x,r.y,{width:this.pdfDocument.fontSize,lineGap:this.lineGap});
				if(!elem.grid[next]){
					//下一個寫入的位置
					if( next < elem.data.length){
						elem.grid[next] = elem.grid[j];
						//下一格水平向左排
						if(alignment == 'left'){
							elem.grid[next].x -= this.pdfDocument.fontSize;
						}else{
							elem.grid[next].x += this.pdfDocument.fontSize;
						}
					}
				}
				if(text.length == 3){
					this.circle(r , {x:6.5,y:35});
				}				
			}
		}
	},    
	pdfLayout: function(){
        var pdf = require('pdfkit');
        /*
         *  phototype.size() 取得文件px大小
        */
	    pdf.prototype.size = function() {
	      return {
	        width: this.page.width,
	        height: this.page.height
	      };
	    };

		var blobStream = require('blob-stream');
		
        var fs = require('fs');
		this.doc = new pdf({
				size: this.pdfDocument.size,
				layout : 'landscape',
				margin: 0
			});

		this.writeStream = fs.createWriteStream(this.pdfFilename);
		this.doc.pipe(this.writeStream);
		this.pageSize = this.doc.size();

 		this.rectangle();
	},
	pdfEnd: function(){
		this.doc.end();
	},

	/*
	*	用來畫出12方格圖，並將每格初始坐標寫入暫存
	*
	*/
    rectangle: function(){
		var tmpLocate = [];
		tmpLocate[0] = this.pdfDocument.margin;

		var i, c, j, p;
		//定義線寬
		this.doc.lineWidth( this.pdfDocument.lineWidth );

		//減去margin算出每格大小
		var w = this.pageSize.width  - (this.pdfDocument.margin.x * 2);
		var h = this.pageSize.height - (this.pdfDocument.margin.y * 2);
		this.pizzaRect.w = Math.floor( w / 4 );
		this.pizzaRect.h = Math.floor( h / 4 );


		for( i = 1; i < 16; i ++ ){
			p = {
				x: ( i % 4 ) * this.pizzaRect.w + this.pdfDocument.margin.x,
				y: Math.floor( i / 4 ) * this.pizzaRect.h + this.pdfDocument.margin.y
			};
			tmpLocate[i] = p;
		}
		//
		this.profile.locateTopLeft = {
			x: this.pizzaRect.w + this.pdfDocument.margin.x,
			y: this.pizzaRect.h + this.pdfDocument.margin.y
		};

		for( j = 0; j < this.locateMapping.length; j ++ ){
			c = this.locateMapping[j];
			p = tmpLocate[c];
			this.pizza[j].locateTopLeft = p;
			
			this.doc.rect(p.x, p.y, this.pizzaRect.w, this.pizzaRect.h).stroke();
		}
    	/*
    	this.doc.rect(1, 1, 100, 100)
    		.stroke();
		*/
    },	
	textProfileLayout: function(){
		var elem;
		
		elem = this.profile;
		for( j = 0; j < elem.data.length; j++){

			column = elem.data[j].length;
			text = elem.data[j];

			grid = this.retvieveRelativePosition(elem.alignment[j] , text);
			elem.grid[j].x = grid.x;
			elem.grid[j].y = grid.y;

			r = this.relativeGrid2AbsolutePosition( elem.grid[j].x, elem.grid[j].y, elem.locateTopLeft);
			this.doc
				.font(this.fontStyle)
				.fontSize(this.pdfDocument.fontSize);
			if(elem.alignment[j].mode == 'tb'){
				this.doc.text(text,r.x,r.y,{width:this.pdfDocument.fontSize,lineGap:this.lineGap});
			}else{
				this.doc.text(text,r.x,r.y,{lineGap:this.lineGap});
			}
			/*
			var textHeight = this.doc
				.font(this.fontStyle)
				.fontSize(this.pdfDocument.fontSize)
				.heightOfString(text,{width:this.pdfDocument.fontSize,lineGap:this.lineGap});
			var textWidth = this.doc
				.font(this.fontStyle)
				.fontSize(this.pdfDocument.fontSize)
				.widthOfString(text,{lineGap:this.lineGap});
			

			this.doc.rect(r.x, r.y, textWidth, textHeight).stroke();
			*/
		}

	},
	/*
	*	水平寫入文字的位置
	* 	@step 處理文子檔
	*	@alignment 對齊起始點，up 或 down
	*/
	textHorizontalLayout: function(step, alignment){
		var i, r, text, j, elem, next, 
			alignment = alignment || 'down';
		for( i = 0; i < 12; i++ ){
			elem = this.pizza[i][step];

			//計算第一個grid位置的y位置
			text = elem.data[0];
			$firstGrid = this.retvieveFirstRelativePosition(elem.alignment , text , true , elem.data);
			elem.grid[0].y = $firstGrid.y;

			next = 0;
			for( j = 0; j < elem.data.length; j++){
				text = elem.data[next];
				$firstGrid = this.retvieveFirstRelativePosition(elem.alignment , text , true , elem.data);
				elem.grid[next].x = $firstGrid.x;


				next += 1;
    			r = this.relativeGrid2AbsolutePosition( elem.grid[j].x, elem.grid[j].y, this.pizza[i].locateTopLeft);
	    		text = elem.data[j];
				this.doc
					.font(this.fontStyle)
				    .fontSize(this.pdfDocument.fontSize)
				    .text(text,r.x,r.y);

				//下一個寫入的位置
				if( next < elem.data.length){
					elem.grid[next] = elem.grid[j];
					//下一格水平向左排
					if(alignment == 'down'){
						elem.grid[next].y -= this.pdfDocument.fontSize;
					}else{
						elem.grid[next].y += this.pdfDocument.fontSize;
					}
				}
			}
		}
	},
	circle: function(r , fix){
		this.doc.circle(r.x + fix.x, r.y + fix.y , 7)
		   .lineWidth(1)
		   .stroke("red", "#900");
	},
    retvieveRelativePosition: function(alignment , text){
		if(alignment.mode == 'tb'){
			var textHeight = this.doc
				.font(this.fontStyle)
				.fontSize(this.pdfDocument.fontSize)
				.heightOfString(text,{width:this.pdfDocument.fontSize,lineGap:this.lineGap});
		}else{
			var textHeight = this.doc
				.font(this.fontStyle)
				.fontSize(this.pdfDocument.fontSize)
				.heightOfString(text,{lineGap:this.lineGap});
		}


    	if(Number.isInteger(alignment.x)){
	    	if(alignment.x < 0){
	    		var absX = this.pizzaRect.w * 2 - this.gridPoditionMargin.right + alignment.x * this.pdfDocument.fontSize;
	    	}else{
	    		var absX = this.gridPoditionMargin.left + alignment.x * this.pdfDocument.fontSize;
	    	}
    	}else{
    		if(alignment.x == 'right'){
    			var absX = this.pizzaRect.w * 2 - this.gridPoditionMargin.bottom - this.pdfDocument.fontSize;
    		}
    		if(alignment.x == 'left'){
    			var absX = this.gridPoditionMargin.left;
    		}
    	}
    	if(Number.isInteger(alignment.y)){
	    	if(alignment.y < 0){
	    		var absY = this.pizzaRect.h * 2 - this.gridPoditionMargin.bottom + alignment.y * this.pdfDocument.lineHeight;
	    	}else{
	    		var absY = this.gridPoditionMargin.top + alignment.y * this.pdfDocument.lineHeight;
	    	}
    	}else{
	    	if(alignment.y == 'top'){
	    		var absY = this.gridPoditionMargin.top;
	    	}
	    	if(alignment.y == 'bottom'){
	    		var absY = this.pizzaRect.h * 2 - this.gridPoditionMargin.bottom - textHeight;
	    	}
	    }
        var r = {
            x: absX,
            y: absY
        };
        return r;    	
    },	
    /*
    *	網格轉換成絕對位置
    *   
    *
    */
    relativeGrid2AbsolutePosition: function(grid_X, grid_Y, pizzaLocate){
    	var abs_x = grid_X + pizzaLocate.x;
    	var abs_y = grid_Y + pizzaLocate.y;
    	var r = {
    		x: abs_x,
    		y: abs_y
    	};
    	return r;
    },
    /*
    *	character 一個fontSize 有幾個字元
    *
    */
    retvieveFirstRelativePosition: function(alignment , text , horizon , data){
    	if(text == undefined){
	        var r = {
	            x: 0,
	            y: 0
	        };
	        return r;
		}



    	horizon = horizon || false;
		var textWidth = this.doc
			.font(this.fontStyle)
			.fontSize(this.pdfDocument.fontSize)
			.widthOfString(text,{lineGap:this.lineGap});
		if(horizon == true){
			text = "水";
		}    	
		var textHeight = this.doc
			.font(this.fontStyle)
			.fontSize(this.pdfDocument.fontSize)
			.heightOfString(text,{width:this.pdfDocument.fontSize,lineGap:this.lineGap});




        if(alignment.x == 'left'){
            var absX = this.gridPoditionMargin.left ;
        }
        if(alignment.x == 'center'){
            if(horizon){
        		//水平
            	var absX = ( this.pizzaRect.w / 2)  - ( textWidth / 2 ) ;
            }else{
            	//垂直
            	var absX = ( this.pizzaRect.w / 2) + ( (data.length / 2 - 1) * this.pdfDocument.fontSize   );
            }
        }
        if(alignment.x == 'right'){
            var absX = this.pizzaRect.w - this.gridPoditionMargin.right  - this.pdfDocument.fontSize;
        }

        if(alignment.y == 'top'){
            var absY = this.gridPoditionMargin.top;
        }
        if(alignment.y == 'center'){
            var absY = ( this.pizzaRect.h / 2)  - ( textHeight / 2 );
        }
        if(alignment.y == 'bottom'){
            if(horizon){
            	var absY = this.pizzaRect.h - this.gridPoditionMargin.bottom - textHeight ;
        	}else{
            	var absY = this.pizzaRect.h - this.gridPoditionMargin.bottom  - textHeight;
        	}
        }


        //var abs_x = grid_X * 12 + pizzaLocate.x + this.gridPoditionMargin.x;
        //var abs_y = grid_Y * 12 + pizzaLocate.y + this.gridPoditionMargin.y;
        var r = {
            x: absX,
            y: absY
        };
        return r;
    },    
    retrieveDecimalIndex: function(decimal){
		return this.heavenlyStems.indexOf(decimal);
	},
 	retrieveDuodecimalIndex: function(duodecimal){
		return this.earthlyBranches.indexOf(duodecimal);
	},
	elements: function(){
		this.profile.locateTopLeft = null;
		this.profile.life = {};						//身宮
		this.profile.zodiac = {};					//命宮
		this.profile.ziwei = {};					//紫微主星
		this.profile.grid = [{x:0,y:0}];
        this.profile.data = [];

		this.profile.alignment = [];

		//元素初始化
		var i;
		for( i = 0; i < 12; i++ ){
			this.pizza[i] = {};

			//step1
			this.pizza[i].step1 = {};
			this.pizza[i].step1.grid = [{x:15,y:9}];
			this.pizza[i].step1.data = [];
			this.pizza[i].step1.alignment = {x:'right',y:'bottom'};

			//step2
			this.pizza[i].step2 = {};
			this.pizza[i].step2.grid = [];
			this.pizza[i].step2.data = [];
			this.pizza[i].step2.alignment = {x:'right',y:'bottom'};

			//setp3
			this.pizza[i].step3 = {};
			this.pizza[i].step3.grid = [{x:6,y:10}];
			this.pizza[i].step3.data = [];
			this.pizza[i].step3.alignment = {x:'center',y:'bottom'};
			//setp4
			this.pizza[i].step4 = {};
			this.pizza[i].step4.grid = [{x:8,y:0}];
			this.pizza[i].step4.data = [];
			this.pizza[i].step4.alignment = {x:'center',y:'top'};

			//magnitude0
			this.pizza[i].magnitude0 = {};
			this.pizza[i].magnitude0.grid = [{x:15,y:2}];
			this.pizza[i].magnitude0.data = [];
			this.pizza[i].magnitude0.alignment = {x:'right',y:'center'};

			//magnitude1
			this.pizza[i].magnitude1 = {};
			this.pizza[i].magnitude1.grid = [{x:0,y:2}];
			this.pizza[i].magnitude1.data = [];
			this.pizza[i].magnitude1.alignment = {x:'left',y:'center'};

			//magnitude2
			this.pizza[i].magnitude2 = {};
			this.pizza[i].magnitude2.grid = [{x:0,y:2}];
			this.pizza[i].magnitude2.data = [];
			this.pizza[i].magnitude2.alignment = {x:'left',y:'bottom'};

			//this.pizza[i].step1.grid = [{x:15,y:9}];
			//this.pizza[i].step1.data = [];


			this.pizza[i].locateTopLeft = null;
		}
	},
	/*
	*	定陰陽
	*	(天干index + gender)不分男女，如果奇數則順行，偶數則逆行
	*
	*/
	profile_calculate: function(){
		var sprintf = require('sprintf');

		var decimalIndex = this.retrieveDecimalIndex(this.lunarBirth.y.decimal);
		var m = (decimalIndex  ) % 2;
		if(m == 0){
			
			switch(this.lunarBirth.gender){
				case 0:
					this.profile.data.push( "陽女" );
					this.lunarBirth.clockwise = false;
				break;
				case 1:
					this.profile.data.push( "陽男" );
					this.lunarBirth.clockwise = true;
				break;
			}
		}else{
			switch(this.lunarBirth.gender){
				case 0:
					this.profile.data.push( "陰女" );
					this.lunarBirth.clockwise = true;
				break;
				case 1:
					this.profile.data.push( "陰男" );
					this.lunarBirth.clockwise = false;
				break;
			}
		}
		this.profile.grid.push({x:-1,y:-1});
		this.profile.alignment.push({x:-5,y:'bottom',mode:'tb'});

		//寫入生辰資料
		var y = this.lunarBirth.y.decimal + this.lunarBirth.y.duodecimal;
		var m = this.lunar.lunarMonthName;
		var d = this.lunar.lunarDayName;
		var h = this.lunarBirth.h;
		var str = sprintf(config.profile_lunar_birth, y , m , d , h );

		this.pdfFilename = str+'.pdf';
		this.profile.data.push( str );
		this.profile.grid.push({x:-1,y:-1});
		this.profile.alignment.push({x:'right',y:'top',mode:'tb'});

		//寫入求命者姓名、國曆生日
		this.profile.data.push( sprintf(config.profile_birth, this.lunarBirth.name , this.lunarBirth.AD.y , this.lunarBirth.AD.m , this.lunarBirth.AD.d ) );
		this.profile.grid.push({x:-1,y:-1});
		this.profile.alignment.push({x:3,y:'top',mode:'mb'});

		//寫入老爹網址
		this.profile.data.push( config.base_url );
		this.profile.grid.push({x:-1,y:-1});
		this.profile.alignment.push({x:1,y:-1,mode:'mb'});

		//slogan
		this.profile.data.push( config.slogan );
		this.profile.grid.push({x:-1,y:-1});
		this.profile.alignment.push({x:1,y:-2,mode:'mb'});

	}	
};
//module.exports.init();
//console.log(config);
