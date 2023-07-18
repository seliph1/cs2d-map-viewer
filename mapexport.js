//--------------------------------------------------------------------------------
// Map and Tileset Constructor
//--------------------------------------------------------------------------------

const ENTITY_TYPE=[];
ENTITY_TYPE[0]="Info_T";
ENTITY_TYPE[1]="Info_CT";
ENTITY_TYPE[2]="Info_VIP";
ENTITY_TYPE[3]="Info_Hostage";
ENTITY_TYPE[4]="Info_RescuePoint";
ENTITY_TYPE[5]="Info_BombSpot";
ENTITY_TYPE[6]="Info_EscapePoint";
ENTITY_TYPE[7]="Info_Target";
ENTITY_TYPE[8]="Info_Animation";
ENTITY_TYPE[9]="Info_Storm";
ENTITY_TYPE[10]="Info_TileFX";
ENTITY_TYPE[11]="Info_NoBuying";
ENTITY_TYPE[12]="Info_NoWeapons";
ENTITY_TYPE[13]="Info_NoFOW";
ENTITY_TYPE[14]="Info_Quake";
ENTITY_TYPE[15]="Info_CTF_Flag";
ENTITY_TYPE[16]="Info_OldRender";
ENTITY_TYPE[17]="Info_Dom_Point";
ENTITY_TYPE[18]="Info_NoBuildings";
ENTITY_TYPE[19]="Info_BotNode";
ENTITY_TYPE[20]="Info_TeamGate";
ENTITY_TYPE[21]="Env_Item";
ENTITY_TYPE[22]="Env_Sprite";
ENTITY_TYPE[23]="Env_Sound";
ENTITY_TYPE[24]="Env_Decal";
ENTITY_TYPE[25]="Env_Breakable";
ENTITY_TYPE[26]="Env_Explode";
ENTITY_TYPE[27]="Env_Hurt";
ENTITY_TYPE[28]="Env_Image";
ENTITY_TYPE[29]="Env_Object";
ENTITY_TYPE[30]="Env_Building";
ENTITY_TYPE[31]="Env_NPC";
ENTITY_TYPE[32]="Env_Room";
ENTITY_TYPE[33]="Env_Light";
ENTITY_TYPE[34]="Env_LightStripe";
ENTITY_TYPE[35]="Env_Cube3D";
ENTITY_TYPE[50]="Gen_Particles";
ENTITY_TYPE[51]="Gen_Sprites";
ENTITY_TYPE[52]="Gen_Weather";
ENTITY_TYPE[53]="Gen_FX";
ENTITY_TYPE[70]="Func_Teleport";
ENTITY_TYPE[71]="Func_DynWall";
ENTITY_TYPE[72]="Func_Message";
ENTITY_TYPE[73]="Func_GameAction";
ENTITY_TYPE[80]="Info_NoWeather";
ENTITY_TYPE[81]="Info_RadarIcon";
ENTITY_TYPE[90]="Trigger_Start";
ENTITY_TYPE[91]="Trigger_Move";
ENTITY_TYPE[92]="Trigger_Hit";
ENTITY_TYPE[93]="Trigger_Use";
ENTITY_TYPE[94]="Trigger_Delay";
ENTITY_TYPE[95]="Trigger_Once";
ENTITY_TYPE[96]="Trigger_If"


class Tileset {
    array=[];
    property=[];
    file="";
    image=undefined;

    constructor(name){
        this.name = name;
    }
}

class Map {
    header = "Unreal Software's Counter-Strike 2D Map File (max)";
    scroll = 0;
    modifiers = 0;
    uptime = 0;
    usgn = 0;
    author = "mapfile.lua";
    tileset = "cs2dnorm.bmp";
    tile_count = 255;
    width = 25;
    height = 25;
    write_time = "000000";
    background_image = "";
    background_scroll_speed_x = 0;
    background_scroll_speed_y = 0;
    background_color_red = 0;
    background_color_green = 0;
    background_color_blue = 0;
    save_tile_heights = 0;
    pixel_tiles_hd = 0; 
    daylight = 0;
    version = "";

    tile_mod=[];
    tile_height=[];
    tile_array=[];
    tile=[];
	
	entity_count = 0;
	entity = [];
	
    constructor(mapname) {
        this.mapname = mapname;
    }
}
//--------------------------------------------------------------------------------
// Map processor
//--------------------------------------------------------------------------------
map_processor = async function(binarydata) {
    const view = new DataView(binarydata);
    let c=0; //counter

    var readString=async function(){
        let str="";
        for (var i=c;i<c+binarydata.byteLength;i++) {
            let v = String.fromCharCode(view.getUint8(i));
            str = str + v
            if (v=='\n'){
                c=i+1; // read until find CR LF, 2 character byte offset
                return str;
            }
        }
        return     
    };

    var readByte=async function(){
        let v = view.getUint8(c);
        c=c+1; // Shift 1 byte for unsigned byte
        return v;
    }

    var readInt=async function(){
        let v = view.getInt32(c,true);
        c=c+4; // Shift 4 bytes for Signed Integer (big-endian)
        return v;
    }

    var readShort=async function(){
        let v = view.getUint16(c,true);
        c=c+2; // Shift 2 bytes for Unsigned Short (big-endian)
        return v;        
    }

    var seekForward=async function(o){
        c=c+o;
    }

    //--------------------------------------------------------------------------------
    // HEADER (1)
    const mapdata = new Map("teste!");
    const header_test1=await readString();

    mapdata.scroll=await readByte();
    mapdata.modifiers=await readByte();
    mapdata.save_tile_heights=await readByte();
    mapdata.pixel_tiles_hd=await readByte();
    await seekForward(6); // 6 bytes vazios
    mapdata.uptime=await readInt();
    mapdata.usgn=await readInt();
    mapdata.daylight=await readInt();
    await seekForward(7*4); // 7 ints vazios.
    mapdata.author=await readString();
    mapdata.version=await readString();
    await seekForward(8*2); // 8 strings vazias
    mapdata.write_time=await readString();
    mapdata.tileset=await readString();
    mapdata.tile_count=await readByte();
    mapdata.width=await readInt();
    mapdata.height=await readInt();
    mapdata.background_image=await readString();
    mapdata.background_scroll_speed_x=await readInt();
    mapdata.background_scroll_speed_y=await readInt();
    mapdata.background_color_red=await readByte();
    mapdata.background_color_green=await readByte();
    mapdata.background_color_blue=await readByte();
    const header_test2 = await readString();

    if (
        header_test1 != "Unreal Software's Counter-Strike 2D Map File (max)" && 
        header_test2 != "ed.erawtfoslaernu"
    ) {
        //alert("Erro!")
    }

    // TILE MODIFIERS (2)
    for (var i=0; i<mapdata.tile_count+1;i++) {
       mapdata.tile_mod[i] = await readByte();
    }

    // TILE HEIGHTS (3)
    if (mapdata.save_tile_heights > 0){
        for (var i=0;i<mapdata.tile_count+1;i++){
            if (mapdata.save_tile_heights == 1){ // CS2D 1.0.0.3 prerelease
                mapdata.tile_height[i] = await readInt();
            } else if (mapdata.save_tile_heights == 2) { // CS2D 1.0.0.3 and above
                const height=await readShort();
                const modifier=await readByte();
                mapdata.tile_height[i]={height,modifier};
            }
        }
    }

    // MAP (4)
    for (var x=0; x<mapdata.width+1;x++) {
        mapdata.tile[x]={}
        for (var y=0; y<mapdata.height+1;y++) {
            const id=await readByte();
            mapdata.tile_array.push(id);
            mapdata.tile[x][y]=id;
        }
    }

    // Falta coisa ainda, carregar a parte ENTITIES (5) 
	// ENTITIES (5)
	mapdata.entity_count = await readInt();
	for (var x=0; x<mapdata.entity_count;x++) {
		var e = []
		e.name = await readString();
		e.type = await readByte();
		e.typeName = ENTITY_TYPE[e.type]
		e.x = await readInt();
		e.y = await readInt();
		e.trigger = await readString();
		e.strings = [];
		e.integers = [];
		for (i=0; i<10; i++){
			//console.log(i)
			e.integers[i] = await readInt();	
			e.strings[i] = await readString();	
		}
		mapdata.entity[x]=e;
	}
	
	
	
    // E carregar todos os sprites que o mapa precisar.

    let tileset = new Tileset(mapdata.tileset);
    tileset.file='./gfx/tiles/'+tileset.name
    tileset.array=[];
    tileset.image=new Image();
    tileset.image.src=tileset.file;
    await tileset.image.decode()
    // Carrega a imagem no objeto Tileset e espera o carregamento dela com o decode().

    // Pega o tamanho do tileset e divide ele em pedaços de 32 (ou 64) pixels.
    let tile_width=tileset.image.width/32;
    let tile_height=tileset.image.height/32;

    for (var x=0; x<tile_height; x++) {
        for (var y=0; y<tile_width; y++) {
            // Em vez de recortar os tilesets, pegamos só a "lógica" do recorte para passar pro canvas.
            const tile = [y*32, x*32, 32, 32]

            // Joga no array.
            tileset.array.push(tile);
        };
    };

    map_fill(mapdata,tileset);

    console.log(mapdata);
    //return mapdata;
};

//--------------------------------------------------------------------------------
// Canvas Fill
//--------------------------------------------------------------------------------
function map_fill(mapdata,tileset) {
    const canvas = document.getElementById("mapfield");
    const ctx = canvas.getContext("2d"); 

     // Event handler to resize the canvas when the document view is changed
    window.addEventListener('resize', resize_canvas, false);

    function resize_canvas() {
        canvas.width = mapdata.width*32;
        canvas.height = mapdata.height*32;
        
        // Redraw everything after resizing the window
        draw_map_on_canvas(); 
    }
    resize_canvas();

    function draw_map_on_canvas(){
        ctx.font = "20px monospaced";
        for (var x=0;x<mapdata.width+1;x++){
            for (var y=0;y<mapdata.height+1;y++){
                let tile_id=mapdata.tile[x][y];
                
                try {
                    // Desenha o mapa de acordo com a lógica recortada, e utilizando todos os argumentos
                    // drawImage(image, offsetx, offsety, sizex, sizey, offsetcanvasx, offsetcanvasy, canvassizex, canvassizey)
                    ctx.drawImage(tileset.image,...tileset.array[tile_id],x*32,y*32,32,32)

                } catch(e) {
                    ctx.fillText(tile_id,x*32,y*32)
                }
                
            }
        };

        // Pós processamento
		/*
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg; // red
          data[i + 1] = avg; // green
          data[i + 2] = avg; // blue
        }
        ctx.putImageData(imageData, 0, 0);
		*/
    }
};

//--------------------------------------------------------------------------------
// Button upload functions
//--------------------------------------------------------------------------------

document.querySelector("#mapread").addEventListener('click',function() {
    if (document.querySelector("#mapfile").value=='') {
        console.log('falha na leitura do arquivo')
        return;
    };

    let dir = document.querySelector('#mapfile').value
    let xhr=new XMLHttpRequest();
    xhr.onload=function(){
        const data = xhr.response;


        map_processor(data)
        //.then((e) => console.log(e))
    };
    
    xhr.open("GET",'./maps/'+dir);
    xhr.responseType="arraybuffer";
    xhr.send();

});

//--------------------------------------------------------------------------------
// Init
//--------------------------------------------------------------------------------
