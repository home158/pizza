// config/ziwei.js
module.exports = {
	//個人資料
    profile_lunar_birth: "%s年%s%s日%s時",
    profile_birth: "%s 國曆 %s 年 %s 月 %s 日",
    slogan: '許願老爹．紫微算命',
	base_url: "http://www.iwishdaddy.com",
	chinese_numerals : [
		'一','二','三','四','五','六','七','八','九','十',
		'十一','十二','十三','十四','十五','十六','十七','十八','十九','廿十',
		'廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十',
		'三十一'
	],
	//天干
	heavenlyStems: ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
	//地支
	earthlyBranches: ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'],
	//時辰
	hour_cycle: ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'],
    //             0   1    2    3    4    5    6    7    8    9    10   11
    zodiac_cycle: ['命宮','父母','福德','田宅','事業','交友','遷移','疾厄','財帛','子女','夫妻','兄弟'],
    five_cycle: ["NIL","NIL","水二局","木三局","金四局","土五局","火六局"],
    //five_cycle[天干%5 , Math.floor(命宮地支/2)]
    five_cycle_period: [
        [2,6,3,5,4,6],
        [6,5,4,3,2,5],
        [5,3,2,4,6,3],
        [3,4,6,2,5,4],
        [4,2,5,6,3,2]
    ],
    master_star:{
        cate_1 : ["紫微","天機",null,"太陽","武曲","天同",null,null,"廉貞",null,null,null],
        cate_2 : ["天府","太陰","貪狼","巨門","天相","天梁","七殺",null,null,null,"破軍",null]
    },
    symbol_star:{
        circle : ['祿','權','科','忌'],
        triangle : ['擎羊','陀羅','火星','鈴星']
    },
    //magnitude : 0: 甲級星 | 1: 乙級星
    slave_star:[
        {name: '禄存' , mapping : [ 2, 3, 5, 6, 5, 6, 8, 9,11, 0] , magnitude : 0},
        {name: '擎羊' , mapping : [ 3, 4, 6, 7, 6, 7, 9,10, 0, 1] , magnitude : 0},
        {name: '陀羅' , mapping : [ 1, 2, 4, 5, 4, 5, 7, 8,10,11] , magnitude : 0}, 
        //{name: '天魁' , mapping : [ 1, 0,11,11, 1, 0, 1, 6, 3, 3] , magnitude : 0},
        {name: '天魁' , mapping : [ 1, 0,11,11, 1, 0, 2, 2, 3, 3] , magnitude : 0},
        //{name: '天鉞' , mapping : [ 7, 8, 9, 9, 7, 8, 7, 2, 5, 5] , magnitude : 0},
        {name: '天鉞' , mapping : [ 7, 8, 9, 9, 7, 8, 6, 6, 5, 5] , magnitude : 0},
        {name: '天厨' , mapping : [ 5, 6, 0, 5, 6, 8, 2, 6, 9,11] , magnitude : 1}
    ],
    
    moon_star:[
        {name: '左輔' , start : 4 , clockwise: true   , magnitude : 0},
        {name: '右弼' , start : 10, clockwise: false  , magnitude : 0},
        {name: '天刑' , start : 9 , clockwise: true   , magnitude : 1},
        {name: '天姚' , start : 1 , clockwise: true   , magnitude : 1}
    ],
    hour_star:[
        {name: '文昌' , start : 10, clockwise: false  , magnitude : 0},
        {name: '文曲' , start : 4 , clockwise: true   , magnitude : 0},
        {name: '地刼' , start : 11, clockwise: true   , magnitude : 1},
        {name: '地空' , start : 11, clockwise: false  , magnitude : 1}
    ],
    energe_mapping_start : [
        [ 2,10],
        [ 3,10],
        [ 1, 3],

        [ 9,10],
        [ 2,10],
        [ 3,10],

        [ 1, 3],
        [ 9,10],
        [ 2,10],

        [ 3,10],
        [ 1, 3],
        [ 9,10]
    ],
    energe_star: [
        {name: '火星' ,start:null, clockwise: true  , magnitude : 0 },
        {name: '鈴星' ,start:null, clockwise: true  , magnitude : 0 }
    ],
    
    branch_star: [
        {name: '天馬' ,start:2, magnitude : 0, step : -3},
        {name: '龍池' ,start:4, magnitude : 1, step : 1},
        {name: '鳳閣' ,start:10, magnitude : 1, step : -1},
        {name: '紅鸞' ,start:3, magnitude : 1, step : -1},
        {name: '天喜' ,start:9, magnitude : 1, step : -1},

        {name: '孤辰' ,start:2, magnitude : 1 , step : 3 , shift : 1 },
        {name: '寡宿' ,start:10,magnitude : 1 , step : 3 , shift : 1 },

        {name: '華蓋' ,start:4, magnitude : 1 , step : -3},
        {name: '咸池' ,start:9, magnitude : 1 , step : -3}
    ],
    four_mapping:['祿','權','科','忌'],
    four_star: [
        ['廉貞','破軍','武曲','太陽'],
        ['天機','天梁','紫微','太陰'],
        ['天同','天機','文昌','廉貞'], 
        ['太陰','天同','天機','巨門'],
        ['貪狼','太陰','太陽','天機'], 

        ['武曲','貪狼','天梁','文曲'],
        ['太陽','武曲','天府','天同'],  
        ['巨門','太陽','文曲','文昌'], 
        ['天梁','紫微','天府','武曲'],
        ['破軍','巨門','太陰','貪狼']
    ],
    jupiter_star: ['歲建','晦氣','喪門','貫索','官符','小秏',
                   '歲破','龍德','白虎','天德','吊客','病符'],
    gem_star: ['將星','攀鞍','歲驛','息神','華蓋','劫煞',
               '災煞','天煞','指背','咸池','月煞','亡神'],
    
    longevity_star: ['長生','沐浴','冠帶','臨宮','帝旺','衰',
                     '病','死','墓','絕','胎','養'],

	phd_star: ['博士','力士','青龍','小耗','將軍','奏書',
			   '飛廉','喜神','病符','大耗','伏兵','官府'],

    //禄存 擎羊 陀羅 天魁 天鉞 天厨

	//紫微星所在位置
	master: [
		[],
		[],
		[ 1,2,
		  2,3,
		  3,4,
		  4,5,
		  5,6,
		  6,7,
		  7,8,
		  8,9,
		  9,10,
		  10,11,
		  11,0,
		  0,1,
		  1,2,
		  2,3,
		  3,4
		],
		[ 4,1,2,
		  5,2,3,
		  6,3,4,
		  7,4,5,
		  8,5,6,
		  9,6,7,
		  10,7,8,
		  11,8,9,
		  0,9,10,
		  1,10,11
		],
		[ 11,4,1,2,
		   0,5,2,3,
		   1,6,3,4,
		   2,7,4,5,
		   3,8,5,6,
		   4,9,6,7,
		   5,10,7,8,
		   6,11],
		[6,11,4,1,2,
		 7,0,5,2,3,
		 8,1,6,3,4,
		 9,2,7,4,5,
		 10,3,8,5,6,
		 11,4,9,6,7],
		[9,6,11,4,1,2,
		 10,7,0,5,2,3,
		 11,8,1,6,3,4,
		 0,9,2,7,4,5,
		 1,10,3,8,5,6
		]
	],
    sixty_tone: [
    "海中金",
    "爐中火",
    "大林木",
    "路旁土",
    "劍鋒金",
    "山頭火",
    "澗下水",
    "城頭土",
    "白蠟金",
    "楊柳木",
    "泉中水",
    "屋上土",
    "霹靂火",
    "松柏木",
    "長流水",
    "砂石金",
    "山下火",
    "平地木",
    "壁上土",
    "金薄金",
    "覆燈火",
    "天河水",
    "大驛土",
    "釵環金",
    "桑柘木",
    "大溪水",
    "沙中土",
    "天上火",
    "石榴木",
    "大海水"
    ]    
};