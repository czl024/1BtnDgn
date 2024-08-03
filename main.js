const VIEW_X = 250;
const VIEW_Y = 250
const VIEW_X_2 = VIEW_X / 2;
const VIEW_Y_2 = VIEW_Y / 2;
const RADIUS = 75
const ARC_THICKNESS = 5;
const CURSOR_THICKNESS = 10;
const ATTACK_COLOR = "green";
const NOTHING_COLOR = "transparent";
const FAIL_COLOR = "red";
const CHANCE_COLOR = "yellow";
const MONSTER_COLOR = "light_red";



title = "170p2";

description = "Yellow : Chance Node\nPink : Monster node\nGreen : Do damage\nRed : Take Damage\nAll buttons do the same thing.";

characters = [];

options = {
  viewSize: {x: VIEW_X, y: VIEW_Y},
  isShowingScore: false
};



let health = 20;
let defeated = 0;
let currentNode;
let cursor;
let segments = [];
let gameover = true;



function update(){
  if(gameover) startUp();

  if(health == 0){
    gameover = true;
    end();
  }
  
  color("black");
  drawNode(currentNode);
  cursor = box(RADIUS * dcos(ticks * 3) + VIEW_X_2, RADIUS * dsin(ticks * 3) + VIEW_Y_2, CURSOR_THICKNESS);
  text(`Health : ${health}`, VIEW_X / 4, VIEW_Y_2 - 5);
  text(`Enemies Defeated : ${defeated}`, VIEW_X / 4, VIEW_Y_2 + 5);
  if(currentNode.type === "monster") text(`Enemy Health : ${currentNode.health}`, VIEW_X / 4, VIEW_Y_2 + 15);

  if(currentNode.type === "monster" && currentNode.health <= 0){
    defeated++;
    currentNode = randomNode("chance", 0);
    segments = [];
  }

  if(input.isJustPressed){
    //get color from cursor
    //console.log(cursor.isColliding.rect);
    if(cursor.isColliding.rect[ATTACK_COLOR]){
      //console.log("attack");
      currentNode.health--;
    }
    if(cursor.isColliding.rect[FAIL_COLOR]){
      //console.log("fail");
      health--;
    }
    if(cursor.isColliding.rect[CHANCE_COLOR]){
      //console.log("chance");
      currentNode = randomNode("chance", defeated);
      health += currentNode.health;
      segments = [];
    }
    if(cursor.isColliding.rect[MONSTER_COLOR]){
      //console.log("monster");
      currentNode = randomNode("monster", defeated);
      segments = [];
    }
  }

  //debug
  if(!currentNode) text("current node is undefined", 5, 5);
  else{
    text(`Node Type : ${currentNode.type}`, 5, 5);
    text(`Node Health : ${currentNode.health}`, 5, 15);
    text(`Node Opt Len : ${currentNode.options.length}`, 5, 25);
    text(`Node Total : ${currentNode.total}`, 5, 35);
  }
}



function startUp(){
  health = 20;
  defeated = 0;
  currentNode = randomNode("chance", 0);
  gameover = false;
}



function dsin(input){
  input *= PI / 180;
  return(sin(input));
}

function dcos(input){
  input *= PI / 180;
  return(cos(input));
}

function toRad(input){ return(input * PI / 180); }



class node{
  type;   //monster or chance
  health; //monster's health, or health given/taken from node
  options;//array of coordinates
  total;  //node is split in sections, should be the sum of things in options

  constructor(inType, inHealth, inOptions, inTotal){
    this.type = inType;
    this.health = inHealth;
    this.options = inOptions;
    this.total = inTotal;
  }
}



function randomNode(status, defeated){
  let nodeHealth = 0;
  let nodeOptions = [];
  let nodeTotal = 0;

  switch(status){
    case "monster":
      nodeHealth = rndi(2 * (defeated + 1), 3 * (defeated + 1));
      nodeOptions.push(["attack", (defeated + 1) * 3]);
      nodeOptions.push(["fail", (defeated + 1) * 4]);
      nodeOptions.push(["nothing", (defeated + 1) * 2]);
      nodeTotal = (defeated + 1) * 24;
      break;
    case "chance":
      nodeHealth = rndi(defeated / -5, (defeated + 1));
      nodeOptions.push(["chance", 1]);
      nodeOptions.push(["monster", 1]);
      nodeTotal = 2;
      break;
    default:
      break;
  }
  return(new node(status, nodeHealth, nodeOptions, nodeTotal));
}



function drawNode(node){
  if(segments.length == 0){
    let pool = [];
    let picker;
    let index;

    for(let x = 0; x < node.options.length; x++){
      for(let y = 0; y < node.options[x][1]; y++){
        //console.log(node.options[x][1]);
        pool.push(node.options[x][0]);  //push the action to the pool, amount dictated by its weight
      }
    }
    //console.log(pool);

    for(let x = 0; x < node.total; x++){
      index = Math.floor(Math.random() * pool.length); //pick random index
      picker = pool[index];         //get element from index
      console.log(pool.length, index);
      pool.splice(index, 1);           //remove index from pool
      segments.push(picker);        //push element into segments
    }
  }else{
    let width = 360 / segments.length;  //arc angle of each segment
    if(node.type === "monster") width *= 2.5;
    //console.log(segments);

    for(let x = 0; x < segments.length; x++){
      switch(segments[x]){
        case "nothing":
          color(NOTHING_COLOR);
          break;
        case "attack":
          color(ATTACK_COLOR);
          break;
        case "fail":
          color(FAIL_COLOR);
          break;
        case "chance":
          color(CHANCE_COLOR);
          break;
        case "monster":
          color(MONSTER_COLOR);
          break;
        default:
          if(currentNode.type === "chance") color(MONSTER_COLOR);
          else color("transparent");
          break;
      }
      
      arc(VIEW_X_2, VIEW_Y_2, RADIUS, ARC_THICKNESS, toRad(x * width), toRad((x + 1) * width));
    }
    color("black");
  }
}