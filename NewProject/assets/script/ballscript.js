// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        //球速度
        speed : cc.v2(0,0),
        //摩擦力（速度方向*f的值的大小，有大小有方向）
        accel : cc.v2(0,0),

        readyflag : true,//是否可点击发射的flag
        indicateflag : false,//是否生成发射方向指示的flag
        //鼠标放在球上的光环的Prefab
        haloPrefab: {
            default: null,
             type: cc.Prefab
        },
        //鼠标拖拽的方向指示的Prefab
        dotPrefab: {
            default: null,
             type: cc.Prefab
        },

        f : 0,//所受摩擦力f（大小）
    },

     //LIFE-CYCLE CALLBACKS: setInit


    //摩擦力和速度方向相同
    setAccel: function(){
       var another = Math.sqrt( Math.pow(this.speed.x,2) + Math.pow(this.speed.y,2) );
       this.accel = cc.v2( this.f * this.speed.x/another , this.f * this.speed.y / another);
    },
    //设置移动
    setMove : function(dt){
        var move = cc.moveBy(dt,cc.v2(this.speed.x/10,this.speed.y/10));
        return move;
    },


    //一系列事件
    mouseUp : function(event){
        if(this.readyflag == true){
            //全局坐标
            var ml = event.getLocation();
            //转换成局部坐标
            ml = this.node.parent.convertToNodeSpaceAR(ml)
            var ball = this.node;
            var x = ml.x - ball.x;
            var y = ml.y - ball.y;
            this.speed.x = -x/2;
            this.speed.y = -y/2;
            //this.setSpeed(cc.v2(-x/2,-y/2));
            this.readyflag = false;
            this.indicateflag = false;
            //var dot = this.node.getChildByName("dot");
            //dot.destroy();
            this.node.removeAllChildren();
            this.readyflag = false;
     }
    },
    mouseDown : function(event){
        if(this.readyflag === true){
        this.indicateflag = true;
        var dot1 = cc.instantiate(this.dotPrefab);
        var dot2 = cc.instantiate(this.dotPrefab);
        var dot3 = cc.instantiate(this.dotPrefab);
        this.node.addChild(dot1);
        this.node.addChild(dot2);
        this.node.addChild(dot3);
        var child = this.node.children;
        } 
    },
    mouseMove : function(event){
        if(this.indicateflag === true && this.readyflag === true){
            var ml = event.getLocation();
            ml = this.node.parent.convertToNodeSpaceAR(ml)
            var ball = this.node;
            var x = ml.x - ball.x;
            var y = ml.y - ball.y;
            var child = this.node.children;
            var h = -0.25;
            for (var i=0;i<child.length;i++){
                if(child[i].name ==="dot"){
                    child[i].setPosition(h*x,h*y);
                    h -= 0.25;
                }
            }
        }
    },
    mouseEnter : function(event){
        if(this.readyflag === true){
        var halo = cc.instantiate(this.haloPrefab);
        this.node.addChild(halo);
        halo.setPosition(0,-2);
        }
    },
    mouseLeave : function(event){
        //this.node.removeAllChildren();
        //var child = this.node.children;
        var halo = this.node.getChildByName("halo");
        if( halo != null ) halo.destroy();
    },
    
    onLoad(){
        cc.director.getCollisionManager().enabled=true;//碰撞检测开启
        cc.director.getPhysicsManager().enabled = true;//物理检测开启
        this.f = 50;
        this.speed.x = 0;
        this.speed.y = 0;
        this.readyflag = true;
        this.indicateflag = false;
        this.node.parent.on(cc.Node.EventType.MOUSE_MOVE,this.mouseMove, this);//一系列事件监听开启
        this.node.on(cc.Node.EventType.MOUSE_DOWN,this.mouseDown, this);
        this.node.on(cc.Node.EventType.MOUSE_LEAVE,this.mouseLeave, this);
        this.node.on(cc.Node.EventType.MOUSE_ENTER,this.mouseEnter, this);
        this.node.parent.on(cc.Node.EventType.MOUSE_UP,this.mouseUp, this);
    },

    onCollisionEnter(other,self){
        if(other.tag === 1){//碰撞到地形
            var f = other.getComponent("sandscript").f;//获取沙地阻力f
            this.f = f;
        }
    },
    onCollisionExit(other,self){
        if(other.tag === 1){//从该地形出来
            this.f = 50;
        }
    },
    //物理碰撞开始
    onBeginContact: function (contact, selfCollider, otherCollider) {
        var worldManifold = contact.getWorldManifold();
        var normal = worldManifold.normal;
        var x = (2*this.speed.y*normal.x*normal.y + this.speed.x*(Math.pow(normal.x,2)-Math.pow(normal.y,2)))/(Math.pow(normal.x,2)+Math.pow(normal.y,2));
        var y = (2*this.speed.x*normal.x*normal.y - this.speed.y*(Math.pow(normal.x,2)-Math.pow(normal.y,2)))/(Math.pow(normal.x,2)+Math.pow(normal.y,2)); 
        this.speed.x = -x;
        this.speed.y = -y;
    },

    start () {
    },

     update (dt) {
        var sp = Math.pow( this.speed.x, 2) + Math.pow( this.speed.y, 2) - Math.pow( this.accel.x*dt, 2) - Math.pow( this.accel.y*dt, 2);
        if( sp > 0 ){
            this.speed.x -= this.accel.x * dt;
            this.speed.y -= this.accel.y * dt;
            this.setAccel();
            this.move = this.setMove(dt);
            this.node.runAction(this.move);
        }
        else{
            this.speed = cc.v2(0,0);
            this.readyflag = true;
        }
    }

     
});
