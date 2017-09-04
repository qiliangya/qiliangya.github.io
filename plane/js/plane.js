
function Game(){
	this.init = function(){
		var that = this;
		this.score = 0;//分数
		this.bulletPower = 1;//子弹威力
		this.map = document.createElement('div');
		this.map.className = 'map';
		this.bg = new Bg();
		this.map.appendChild(this.bg.block);
		this.bg.bgMove();
		this.diff = 1;//游戏难度
		this.startTime = new Date().getTime();	//获取游戏开始时间
		this.selfPlane = new MyPlane();
		this.map.appendChild(this.selfPlane.block);
		document.body.appendChild(this.map);
		this.selfPlane.move();
		var num = 0;
		this.gameTimer = setInterval(function(){
			that.cFoe(that.selfPlane);
			num++;
			if(num>(10*that.diff)){
				that.buff = new Buff();
				that.map.appendChild(that.buff.block);
				that.buff.buffMove(that.buff.block,that);
				num=0;
			}
		},1000/that.diff);
	}
};
Game.prototype = {
	constructor:Game,
	cFoe:function(oPlane){
		var that = this;
		var oFoe = new this.Foe(that);
		that.map.appendChild(oFoe.block);
		oFoe.timer=setInterval(function(){
			var aFoebullet = document.getElementsByClassName('foebullets');
			if(oFoe.block.offsetTop >= that.map.offsetHeight-oFoe.block.offsetHeight){
				clearInterval(oFoe.timer);
				that.map.removeChild(oFoe.block);
			}
			if((that.coll(oPlane.block,oFoe.block))&&!oPlane.god){	//飞机与敌机撞击
				that.endGame();
			}
			for(var i = 0;i<aFoebullet.length;i++){		//被敌人子弹打中
				if(that.coll(aFoebullet[i],oPlane.block)&&!oPlane.god){
					clearInterval(aFoebullet[i].timer);
					that.endGame();
				}
			}
			if(oFoe.block.bulletNum && selectRandom(1,50)==1 && oFoe.life){		//如果该敌机还有子弹，那么有1/10的概率可能会发射
				var foebullet = new FoeBullets();	//创建敌机子弹实例
				foebullet.block.style.top = oFoe.block.offsetTop+oFoe.block.offsetHeight + 'px';
				foebullet.block.style.left = oFoe.block.offsetLeft+ oFoe.w/2 + 'px';
				that.map.appendChild(foebullet.block);
				that.foeBullet(foebullet);
				oFoe.block.bulletNum--;
			}
			that.pz(oFoe);
			oFoe.block.style.top = oFoe.block.offsetTop+oFoe.speed + 'px';
		},30);
	},
	foeBullet:function(obj){
		var that = this;
		obj.timer = setInterval(function(){
			if(obj.block.offsetTop>=that.map.offsetHeight){
				clearInterval(obj.timer);
				that.map.removeChild(obj.block);
			}
			obj.block.style.top = obj.block.offsetTop + 5 + 'px';
		},30);
	},
	coll:function(obj,obj1){
        var t1 = obj.offsetTop;  
        var l1 = obj.offsetLeft;  
        var r1 = obj.offsetLeft + obj.offsetWidth;  
        var b1 = obj.offsetTop + obj.offsetHeight;  
        var t2 = obj1.offsetTop;  
        var l2 = obj1.offsetLeft;  
        var r2 = obj1.offsetLeft + obj1.offsetWidth;  
        var b2 = obj1.offsetTop + obj1.offsetHeight;  
        if(b1<t2 || l1>r2 || t1>b2 || r1<l2){// 表示没碰上  
			return false;
        }else{  
            return true;  
        }
	},
	endGame:function(){		//游戏结束 判断是否还有命数
		window.location.reload();
		alert('bye');
		
	},
	pz:function(obj){	//判断子弹是否打中敌机
		this.allBullets = document.getElementsByClassName('bullets');
		if(this.boss){
			for(var i=0;i<this.allBullets.length;i++){
				if(this.allBullets[i].offsetTop<=this.boss.block.offsetHeight+this.map.offsetTop){
					clearInterval(this.allBullets[i].timer);
					document.body.removeChild(this.allBullets[i]);
					this.boss.blood-=this.bulletPower;
					if(this.boss.blood>0){
						var bossBlood= document.getElementById('blood');	//当前血量
						var bossallBlood = document.getElementById('bossBlood');//Boss总血量
						bossBlood.style.width = (this.boss.blood/this.boss.allblood)*bossallBlood.offsetWidth + 'px';
					}else{
						this.score += 1000000;
						alert('恭喜你，你赢了,你的分数为'+this.score);
						this.endGame();
					}
				}	
			}
		}else{
			for(var i = 0;i<this.allBullets.length;i++){
				var t1 = obj.block.offsetTop;  
	            var l1 = obj.block.offsetLeft;  
	            var r1 = obj.block.offsetLeft + obj.block.offsetWidth;  
	            var b1 = obj.block.offsetTop + obj.block.offsetHeight;
	            var t2 = this.allBullets[i].offsetTop-this.map.offsetTop;  
	            var l2 = this.allBullets[i].offsetLeft-this.map.offsetLeft;  
	            var r2 = this.allBullets[i].offsetLeft-this.map.offsetLeft + this.allBullets[i].offsetWidth;  
	            var b2 = this.allBullets[i].offsetTop-this.map.offsetTop + this.allBullets[i].offsetHeight;  
	            if(b1<t2 || l1>r2 || t1>b2 || r1<l2){// 表示没碰上   
	            	
	            }else{
	            	clearInterval(this.allBullets[i].timer);
	            	document.body.removeChild(this.allBullets[i]);
	            	obj.blood-=this.bulletPower;
	            	if(obj.blood>0){
	            	}else{
	            		obj.life = false;
	            		this.map.removeChild(obj.block);
	            		this.score += obj.score;
	            		document.getElementsByTagName('strong')[0].innerHTML=this.score;
	            	}
	            }  
			}
		}
		
	},
	Foe:function(that){//敌人类
		var iLevel = document.getElementsByTagName('i')[0];
		var oHelp = document.getElementsByTagName('em')[0];
		var nowTime = Math.floor((new Date().getTime()-that.startTime)/1000);//游戏进行的时间
		this.block = document.createElement('div');
		if(nowTime>30&&nowTime<=80){		//难度增加
			that.diff=2;
			oHelp.innerHTML = '注意！敌人血量翻倍，速度增加!';
		}else if(nowTime>80&&nowTime<=120){
			that.diff=3;
			oHelp.innerHTML = '迎接噩梦吧！敌人血量*3，速度大幅增加!';
		}else if(nowTime>170 && nowTime<=180){
			var tip = document.getElementById('head');
			tip.style.display = 'block';
		}else if(nowTime>180){
			clearInterval(that.gameTimer);	//当存活了250秒的时候，出现boos
			that.boss = new Boss(that);
			that.map.appendChild(that.boss.block);
		}
		iLevel.innerHTML = that.diff;
		var hard = that.diff*50;	//难度
		this.block.num=selectRandom(1,hard);
		if(this.block.num>=1&&this.block.num<hard*.5){
			this.block.className='foe1';
			this.speed=selectRandom(2,4);//敌机速度
			this.blood = that.diff;//敌机的血量
			this.score = 2;
			this.block.bulletNum = 1;
			this.w = 30;
		}else if(this.block.num>=hard*.5&&this.block.num<hard*.7){
			this.block.className = 'foe2';
			this.speed=selectRandom(2,3);//敌机速度
			this.blood = 8*that.diff;//敌机的血量
			this.score = 5;
			this.block.bulletNum = 3;
			this.w = 60;
		}else if(this.block.num>=hard*.7&&this.block.num<hard*.9){
			this.block.className = 'foe3';
			this.speed=2//敌机速度
			this.blood = 14*that.diff;//敌机的血量
			this.score = 10;
			this.block.bulletNum = 5;
			this.w = 100;
		}else if(this.block.num>=hard*.9){
			this.block.className = 'foe4';
			this.speed=1//敌机速度
			this.blood = 35*that.diff;//敌机的血量
			this.score = 30;
			this.block.bulletNum = 8;
			this.w = 150;
		};
		this.life = true;		//判断敌机是否存活
		this.x =selectRandom(0,that.map.offsetWidth-this.w);
		this.block.style.left = this.x+'px';
	}
}
function Bg(){
	this.block = document.createElement('ul');
	this.block.innerHTML = '<li class="bg"></li><li class="bg"></li>'
	this.speed = 1;
};
Bg.prototype = {
	constructor:Bg,
	bgMove:function(){
		var that = this;
		setInterval(function(){
			if(that.block.offsetTop >=0){
				that.block.style.top = '-500px';
			}
			if(that.boss){
				that.pz();
			}
			that.block.style.top = that.block.offsetTop+that.speed + 'px';
		},50);
	}
};
function Boss(obj){
	this.block = document.createElement('div');
	this.block.className = 'boss';
	this.allblood = 10000;
	this.blood = 10000;//boos当前血量
	this.shut(obj);
}
Boss.prototype = {
	constructor:Boss,
	shut:function(obj){
		var that = this;
		this.timer = setInterval(function(){
			var num = selectRandom(10,30);
			for(var i=0;i<num;i++){
				var bossbullet = new BossBullet();
				bossbullet.block.style.top = that.block.offsetHeight + 'px';
				bossbullet.block.style.left = that.block.offsetWidth/2 + 'px';
				obj.map.appendChild(bossbullet.block);
				bossbullet.selfMove(obj);
			}
		},1000);
	}
};
function BossBullet(){		//Boss的子弹
	this.block = document.createElement('div');
	this.block.className = 'bossbullets';
	this.speedX = selectRandom(0,5);	//令boos的子弹散射出来
	this.speedY = selectRandom(2,5);	
	var num = selectRandom(1,100);		//给boos子弹X轴一个1/2的概率进行反向
	if(num>1&&num<=50){
		this.speedX = -this.speedX;
	}
}
BossBullet.prototype = {
	constructor:BossBullet,
	selfMove:function(obj){	//obj为最大的主类
			var that = this;
			this.block.timer = setInterval(function(){
			if(that.block.offsetTop>=obj.map.offsetHeight || that.block.offsetLeft<=0 || that.block.offsetLeft>=obj.map.offsetWidth){
				clearInterval(that.block.timer);
				obj.map.removeChild(that.block);
			}
			that.selfPz(obj);
			that.block.style.top = that.block.offsetTop + that.speedY + 'px';
			that.block.style.left = that.block.offsetLeft + that.speedX + 'px';
		},30);
	},
	selfPz:function(obj){
		var aBossBullets = document.getElementsByClassName('bossbullets');
		for(var i=0;i<aBossBullets.length;i++){
			if(pz(aBossBullets[i],obj.selfPlane.block,20)&&!obj.selfPlane.god){//如果和boss子弹撞上 则bye
				obj.endGame();
			}
		}
	}
}
function MyPlane(){
	this.block = document.createElement('div');
	this.block.className = 'selfPlane';
	this.level = 1;//飞机等级
	this.life  = 3;	//飞机生命
	this.godNum = 1;//无敌buff数量
	this.god = false;//无敌buff
	this.godStop = true;//无敌间隙
	this.speed = 5;//飞机运动速度
	this.bullets = [];//所有子弹实例
	this.timer = null;//清空定时器
	this.bstop = true;//保证只能有一个定时器运行
	this.moveCode = {left:false,top:false,right:false,bottom:false};	//飞机移动按键
}
MyPlane.prototype = {
	constructor:MyPlane,
	sendBullets:function(){//发射子弹
		var that = this;
		var bullet = new Bullets(that);//创建子弹实例
		bullet.block.style.top = that.block.offsetTop+that.block.parentNode.offsetTop + 'px';
		bullet.block.style.left = that.block.offsetLeft+that.block.parentNode.offsetLeft+ that.block.offsetWidth/2-bullet.block.w/2 + 'px';
		document.body.appendChild(bullet.block);
		bullet.block.timer = setInterval(function(){//子弹运动
			if(bullet.block.offsetTop<that.block.parentNode.offsetTop){//当子弹什么都没打中 即将出地图的时候 移除掉
				document.body.removeChild(bullet.block);
				clearInterval(bullet.block.timer);
			}
			bullet.block.style.top = bullet.block.offsetTop - bullet.speed + 'px';
		},30);
	},
	becameGod:function(){	//使用无敌buff
		var that = this;
		var nowBg  =  null;
		var bNum = document.getElementsByTagName('b')[0];
		if(this.godNum&&this.godStop){
			that.godNum--;
			bNum.innerHTML = that.godNum;
			that.god = true;
			this.godStop = false;	//保证一次只能用一个
			nowBg = that.block.style.background;
			this.clearAllFoe();
			that.block.style.background = 'url(img/god.png)';
			setTimeout(function(){	//3秒无敌
				that.god = false;
				that.godStop = true;
				that.block.style.background = nowBg;
			},3000);
		}
	},
	clearAllFoe(){
		var map = document.getElementsByClassName('map')[0];
		var a1 = map.getElementsByClassName('foe1');
		var a2 = map.getElementsByClassName('foe2');
		var a3 = map.getElementsByClassName('foe3');
		var a4 = map.getElementsByClassName('foe4');
		var arr = [a1,a2,a3,a4];
		for(var i = 0;i<arr.length;i++){
			for(var j=0;j<arr[i].length;j++){
				clearInterval(arr[i][j].timer);
				map.removeChild(arr[i][j]);
			}
		}
	},
	move:function(){
		var that = this;
		function toMove(){	//飞机移动，不能出框
			if(that.bstop){
				that.bstop = false;
				that.timer = setInterval(function(){
					if(that.moveCode.left){
						if(that.block.offsetLeft<=0){
							that.block.style.left = 0 +'px';
						}else{
							that.block.style.left = that.block.offsetLeft-that.speed+'px';
						}
					}
					if(that.moveCode.top){
						if(that.block.offsetTop<=0){
							that.block.style.top = 0 +'px';
						}else{
							that.block.style.top = that.block.offsetTop-that.speed+'px';
						}
					}
					if(that.moveCode.right){
						if(that.block.offsetLeft>=that.block.parentNode.offsetWidth-that.block.offsetWidth){
							that.block.style.left = that.block.parentNode.offsetWidth-that.block.offsetWidth +'px';
						}else{
							that.block.style.left = that.block.offsetLeft+that.speed+'px';
						}
					}
					if(that.moveCode.bottom){
						if(that.block.offsetTop>=that.block.parentNode.offsetHeight-that.block.offsetHeight){
							that.block.style.top = that.block.parentNode.offsetHeight-that.block.offsetHeight +'px';
						}else{
							that.block.style.top = that.block.offsetTop+that.speed+'px';
						}
					}
				},30);
			}
		}
		var timer = null;
		var bStop = true;
		document.onkeydown = function(ev){
			var ev = ev || window.event;
			switch(ev.keyCode){
				case 75:{that.becameGod();break};
				case 65:{that.moveCode.left=true;toMove();break;};
				case 87:{that.moveCode.top=true;toMove();break;};
				case 68:{that.moveCode.right=true;toMove();break;};
				case 83:{that.moveCode.bottom=true;toMove();break;};
				case 74:{if(bStop){that.sendBullets()};break}
			}
			if(ev.keyCode == 74 && bStop){
				bStop=false;
				timer = setInterval(function(){
					that.sendBullets();
				},300);
			}
		}
		document.onkeyup = function(ev){
			var ev = ev || window.event;
			if(ev.keyCode==74){clearInterval(timer);bStop=true;}
			if(ev.keyCode==65){that.moveCode.left=false;}
			if(ev.keyCode==87){that.moveCode.top=false;}
			if(ev.keyCode==68){that.moveCode.right=false;}
			if(ev.keyCode==83){that.moveCode.bottom=false;}
			for(var i in that.moveCode){
				if(that.moveCode[i]==true){
					return false;
				}
			}
			clearInterval(that.timer);
			that.bstop = true;
		}
	}
};
function Bullets(obj){//子弹类
	this.speed = 5;
	this.block = document.createElement('div');
	this.block.className = 'bullets';
	this.block.style.width = 10*obj.level + 'px';
	this.block.w = 10*obj.level;
}
function FoeBullets(){
	this.block = document.createElement('div');
	this.block.className = 'foebullets';
	this.block.w = 10;
}
function Buff(){//buff增益类
	this.block = document.createElement('div');
	this.x = 3;
	this.y = 2;
	this.block.className = 'buff'+selectRandom(1,2);
}
Buff.prototype = {
	constructor:Buff,
	buffMove:function(obj,oparent){
		var that = this;
		this.timer=setInterval(function(){
			var x=obj.offsetLeft+that.x;
			var y=obj.offsetTop+that.y;
			if(coll(oparent.selfPlane.block,that.block)){	//获得buff
				clearInterval(that.timer);
				oparent.map.removeChild(that.block);
				if(obj.className=='buff1'){
					if(oparent.selfPlane.level<5){
						oparent.selfPlane.level++;
						oparent.bulletPower++;
					}
					if(oparent.selfPlane.level==3){
						oparent.selfPlane.block.style.background = 'url(img/plane2.png)';
					}else if(oparent.selfPlane.level==5){
						oparent.selfPlane.block.style.background = 'url(img/plane3.png)';
					}
				}else{
					clearInterval(that.timer);
					oparent.selfPlane.godNum++;
					var bNum = document.getElementsByTagName('b')[0];
					bNum.innerHTML = oparent.selfPlane.godNum;
				}
			}
			if(x>=oparent.map.offsetWidth-obj.offsetWidth){
				x=oparent.map.offsetWidth-obj.offsetWidth;
				that.x=-that.x;
			}else if(x<=0){
				x=0;
				that.x=-that.x;
			}
			if(y>=oparent.map.offsetHeight-obj.offsetHeight){
				y=oparent.map.offsetHeight-obj.offsetHeight
				that.y=-that.y;
			}else if(y<=0){
				y=0;
				that.y=-that.y
			}
			obj.style.left=x+'px';
			obj.style.top=y+'px';
		},20);//改变移动速度
	}
}
window.onload = function(){
	var Go = new Game();
	Go.init();
}