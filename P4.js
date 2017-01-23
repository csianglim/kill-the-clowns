//////////////////////////////////
// SETUP STATS WINDOW
//////////////////////////////////
var stats = new Stats();
stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild( stats.domElement );

//////////////////////////////////

var x_axis = new THREE.Vector3( 1, 0, 0 );
var y_axis = new THREE.Vector3( 0, 1, 0 );
var z_axis = new THREE.Vector3( 0, 0, 1 );

//////////////////////////////////
// SETUP RENDERER & SCENE
//////////////////////////////////
var canvas = document.getElementById('canvas');
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xFFFFFF); // white background colour
canvas.appendChild(renderer.domElement);
var clock = new THREE.Clock(true);

//////////////////////////////////
// SETUP CAMERA
//////////////////////////////////
var camera = new THREE.PerspectiveCamera(30,1,0.1,8000); // view angle, aspect ratio, near, far
camera.position.set(0,20,0);
camera.lookAt(scene.position);

// Add a crosshair to the camera
// Credits: http://stackoverflow.com/questions/31655888/how-to-cast-a-visible-ray-threejs
var material = new THREE.LineBasicMaterial({ color: 0xAAFFAA });

// crosshair size
var x = 0.005, y = 0.005;
var geometry = new THREE.Geometry();

// crosshair
geometry.vertices.push(new THREE.Vector3(0, y, 0));
geometry.vertices.push(new THREE.Vector3(0, -y, 0));
geometry.vertices.push(new THREE.Vector3(0, 0, 0));
geometry.vertices.push(new THREE.Vector3(x, 0, 0));    
geometry.vertices.push(new THREE.Vector3(-x, 0, 0));

var crosshair = new THREE.Line( geometry, material );

var circleGeometry = new THREE.CircleGeometry( x, 32 );
// circleGeometry.vertices.shift();
var crosshair_circle = new THREE.Line( circleGeometry, material );
crosshair_circle.position.z = -0.5;

// place it in the center
var crosshairPercentX = 50;
var crosshairPercentY = 50;
var crosshairPositionX = (crosshairPercentX / 100) * 2 - 1;
var crosshairPositionY = (crosshairPercentY / 100) * 2 - 1;

crosshair.position.x = crosshairPositionX * camera.aspect;
crosshair.position.y = crosshairPositionY;
crosshair.position.z = -0.3;

camera.add( crosshair );
camera.add( crosshair_circle );
scene.add(camera);


//////////////////////////////////
// Make Snow
// Tutorial: https://aerotwist.com/tutorials/creating-particles-with-three-js/
// https://airtightinteractive.com/demos/js/snowbox/
// http://owendiehl.azurewebsites.net/snowglobe-threejs/
// Snowflake: http://pngimg.com/upload/snowflakes_PNG7578.png
//////////////////////////////////
var worldWidth = 1500;
var worldDepth = 1500;
edges = worldWidth - worldWidth/2

var particleCount = 1500
pMaterial = new THREE.PointCloudMaterial({
  color: 0xFFFFFF,
  size: 10,
  map: THREE.ImageUtils.loadTexture(
     "./textures/snowflake.png"
   ),
   transparent: true
});
particles = new THREE.Geometry();

for (var i = 0; i < particleCount; i++) {
    var pX = Math.random()*edges*2 - edges,
    pY = Math.random()*500 - 250,
    pZ = Math.random()*edges*2 - edges,
    particle = new THREE.Vector3(pX, pY, pZ);
    particle.velocity = {};
    particle.velocity.y = 0;
    particles.vertices.push(particle);
}

function makeItSnow(){
  var pCount = particleCount;
  while (pCount--) {
    var particle = particles.vertices[pCount];
    if (particle.y < 10) { // floor height
      particle.y = 200;
      particle.velocity.y = 0;
    }
    particle.velocity.y -= Math.random()*0.05;
    particle.y += particle.velocity.y;
  }

  particles.verticesNeedUpdate = true;
};

var particleSystem = new THREE.PointCloud(particles, pMaterial);
scene.add(particleSystem);

////////////////////////////////////////////
// Health Packs
// Heart from http://threejs.org/examples/webgl_geometry_shapes.html
var pickable = new THREE.Object3D();
scene.add(pickable)

// Define the shape
var x = 0, y = 0;
var heartShape = new THREE.Shape(); // From http://blog.burlock.org/html5/130-paths
heartShape.moveTo( x + 25, y + 25 );
heartShape.bezierCurveTo( x + 25, y + 25, x + 20, y, x, y );
heartShape.bezierCurveTo( x - 30, y, x - 30, y + 35,x - 30,y + 35 );
heartShape.bezierCurveTo( x - 30, y + 55, x - 10, y + 77, x + 25, y + 95 );
heartShape.bezierCurveTo( x + 60, y + 77, x + 80, y + 55, x + 80, y + 35 );
heartShape.bezierCurveTo( x + 80, y + 35, x + 80, y, x + 50, y );
heartShape.bezierCurveTo( x + 35, y, x + 25, y + 25, x + 25, y + 25 );

// Add to scene and pickable
var extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
var heartGeometry = new THREE.ExtrudeGeometry( heartShape, extrudeSettings );
var sphere = new THREE.SphereGeometry( 2, 16, 8 );
// light1 = new THREE.PointLight( 0xff0040, 1, 50 );
// light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) ); 

hearts = []
var max_health = 2;
for (var h = 0; h < max_health; h++){
  var heartMesh = new THREE.Mesh( heartGeometry, new THREE.MeshPhongMaterial( { color: 0xff0040 } ) );
  heartMesh.position.set( 0,0,0 );
  heartMesh.rotation.set( Math.PI/16,0,Math.PI);
  heartMesh.scale.set( 0.2,0.2,0.2 );
  // var light2 = new THREE.PointLight( 0xff0040, 2, 50 );
  // light2.position.set( 0, 2, 5 );
  // heartMesh.add( light2 );
  hearts.push(heartMesh)
}

function makeHealthPack(x,z){
  pickable.add( hearts[pickable.children.length] );
  hearts[pickable.children.length-1].position.set( x,35,z );
}

//////////////////////////////////
// SETUP POINTERLOCK CONTROLS
// CREDITS: http://mrdoob.github.io/three.js/examples/misc_controls_pointerlock.html
//////////////////////////////////
var raycaster;
var controlsEnabled;
var objects = [];
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var defaultSpeed = 700.0;
var fasterSpeed = 2000.0;
var playerMovementSpeed = defaultSpeed; 
var player_health = 100;
var player_score = 0;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
controls = new THREE.PointerLockControls( camera );
scene.add( controls.getObject() );


var instructions = document.getElementById( 'instructions' );
var winner = document.getElementById( 'winner' );
var loser = document.getElementById( 'loser' );

if ( havePointerLock ) {

  var element = document.body;
  var pointerlockchange = function ( event ) {
    if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

      controlsEnabled = true;
      controls.enabled = true;

      blocker.style.display = 'none';
      winner.style.display = 'none';
      loser.style.display = 'none';

    } else {

      controls.enabled = false;

      blocker.style.display = '-webkit-box';
      blocker.style.display = '-moz-box';
      blocker.style.display = 'box';

      instructions.style.display = '';
    }

  };

  var pointerlockerror = function ( event ) {

    instructions.style.display = '';

  };

  // Hook pointer lock state change events
  document.addEventListener( 'pointerlockchange', pointerlockchange, false );
  document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
  document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

  document.addEventListener( 'pointerlockerror', pointerlockerror, false );
  document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
  document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

  instructions.addEventListener( 'click', function ( event ) {

    instructions.style.display = 'none';

    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

    if ( /Firefox/i.test( navigator.userAgent ) ) {

      var fullscreenchange = function ( event ) {

        if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

          document.removeEventListener( 'fullscreenchange', fullscreenchange );
          document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

          element.requestPointerLock();
        }

      };

      document.addEventListener( 'fullscreenchange', fullscreenchange, false );
      document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

      element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

      element.requestFullscreen();

    } else {

      element.requestPointerLock();

    }

  }, false );

} 
else {
  instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}

var onKeyDown = function ( event ) {

  switch ( event.keyCode ) {

    case 16: // Shift key
      playerMovementSpeed = fasterSpeed;
      break;

    case 38: // up
    case 87: // w
      moveForward = true;
      break;

    case 37: // left
    case 65: // a
      moveLeft = true; break;

    case 40: // down
    case 83: // s
      moveBackward = true;
      break;

    case 39: // right
    case 68: // d
      moveRight = true;
      break;

    case 32: // space
      if ( canJump === true ) velocity.y += 350;
      canJump = false;
      break;

  }

};

var onKeyUp = function ( event ) {

  switch( event.keyCode ) {

    case 16: // Shift key
      playerMovementSpeed = defaultSpeed;
      break;

    case 38: // up
    case 87: // w
      moveForward = false;
      break;

    case 37: // left
    case 65: // a
      moveLeft = false;
      break;

    case 40: // down
    case 83: // s
      moveBackward = false;
      break;

    case 39: // right
    case 68: // d
      moveRight = false;
      break;

  }

};

document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
var mouse = new THREE.Vector2();
mouse.x = 0;
mouse.y = 0;
var shootingRaycaster = new THREE.Raycaster();

//////////////////////////////////
// Scene lighting
// Ambient, directional, point
//////////////////////////////////
var light = new THREE.AmbientLight( 0x101010 );
scene.add( light );

dirLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
dirLight.color.setHSL( 0.1, 1, 0.95 );
dirLight.position.set( -1, 3, 5 );
dirLight.position.multiplyScalar( 50 );
scene.add( dirLight );

var cam_light = new THREE.PointLight( 0xeeeeee, 1.2, 250 );
cam_light.position.set( 0, 5, 2 );
camera.add(cam_light)
// dirLight.position.multiplyScalar( 50 );

// Generate the lamp posts for lighting
var post_height = 120
var geometry = new THREE.CylinderGeometry( 2.5, 2.5, post_height, 32 );
var lampGeometry = new THREE.SphereGeometry( 6, 20, 20, 0, Math.PI*2);  
var teleporters = []
var tele_index = 0

function makeLampPost(x,z){
  var material = new THREE.MeshPhongMaterial( {color: 0x000022} );
  var lampmaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
  lampmaterial.emissive = new THREE.Color().setRGB(255,255,255)
  lampmaterial.emissiveIntensity = 10
  var lamp_support = new THREE.Mesh( geometry, material );
  lamp_support.position.x = x;
  lamp_support.position.z = z;
  lamp_support.position.y = 10;
  lamp_support.castShadow = true;
  scene.add( lamp_support );
  
  var lamp_bulb = new THREE.Mesh( lampGeometry, lampmaterial );
  lamp_bulb.position.set(0,post_height/2,0)
  lamp_support.add(lamp_bulb)
  var lamp_light = new THREE.PointLight( 0x00bbbb, 1.6, 400 );
  lamp_light.position.set( 0, 10, 0 );
  lamp_bulb.add( lamp_light );

  // Teleporter Base
  // http://texturelib.com/texture/?path=/Textures/metal/bare/metal_bare_0050
  var teleTexture = THREE.ImageUtils.loadTexture('./textures/metal.jpg');
  teleTexture.wrapS = teleTexture.wrapT = THREE.RepeatWrapping; 
  teleTexture.repeat.set( 2, 2 );
  var telematerial = new THREE.MeshPhongMaterial({ map: teleTexture, color: 0xbbbbbb });
  telematerial.emissiveIntensity = 0.5
  var circleGeometry = new THREE.CylinderGeometry( 30, 30, 8, 32 )
  var circle = new THREE.Mesh( circleGeometry, telematerial );
  circle.position.y = -10;
  circle.tele_id = tele_index;
  lamp_support.add( circle );
  teleporters.push(circle);
  tele_index += 1;;
}

////////////////////////////////////////////
// Make teleporters and lamp post and fence
////////////////////////////////////////////
makeLampPost(-edges+100,-edges/2+100);
makeLampPost(edges-100,edges-150);

fenceH = 25
var geometry = new THREE.CylinderGeometry( 0.5, 0.5, worldWidth, 32 );
var material = new THREE.MeshPhongMaterial( {color: 0xff1100} );

function generateFencePiece(x,y,z,axis){
 var cylinder = new THREE.Mesh( geometry, material );
 cylinder.rotateOnAxis(axis,Math.PI/2);
 cylinder.position.x = x
 cylinder.position.y = y
 cylinder.position.z = z
 scene.add( cylinder ); 
}

generateFencePiece(edges,fenceH,0,x_axis)
generateFencePiece(-edges,fenceH,0,x_axis)
generateFencePiece(0,fenceH,edges,z_axis)
generateFencePiece(0,fenceH,-edges,z_axis)
generateFencePiece(edges,fenceH+10,0,x_axis)
generateFencePiece(-edges,fenceH+10,0,x_axis)
generateFencePiece(0,fenceH+10,edges,z_axis)
generateFencePiece(0,fenceH+10,-edges,z_axis)

// The poles
// Wood: http://graphicdesignjunction.com/2013/03/seamless-high-qualtity-wood-textures/
var woodTexture = THREE.ImageUtils.loadTexture('./textures/wood.jpg');
woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping; 
woodTexture.repeat.set( 2, 2 );
var geometry = new THREE.CylinderGeometry( 2, 2, 40, 32 );
// var material = new THREE.MeshPhongMaterial( {color: 0xff1100} );

function generateFencePole(x,y,z){
  var woodMaterial = new THREE.MeshPhongMaterial({ map: woodTexture, color: 0xffffff });
  var cylinder = new THREE.Mesh( geometry, woodMaterial );
  cylinder.position.x = x
  cylinder.position.y = y
  cylinder.position.z = z
  scene.add( cylinder ); 
}

for ( var i = -edges; i <= edges; i+=Math.floor(edges/4) ) {
  generateFencePole(edges,fenceH,i)
  generateFencePole(-edges,fenceH,i)
  generateFencePole(i,fenceH,edges)
  generateFencePole(i,fenceH,-edges)
}

//////////////////////////////////
// SETUP PIG AND MOTION
// External OBJ credits: http://tf3dm.com/3d-model/pig-13314.html
//////////////////////////////////
var isFiring = false;
var pig_material = new THREE.MeshPhongMaterial( { color: 0xCC6672, 
                      specular: 0x00ee00, shininess: 0 } );
var pig_geometry = new THREE.SphereGeometry( 6, 12, 12 );
var pos = controls.getObject().position.clone();
var dir = camera.getWorldDirection()
var default_pig_t = 50;       // How far the initial pig is from the camera
var pig_t = default_pig_t;
var pig_speed = 10;           // How fast is the pig?
var pig_range = 800;          // How far can the pig fly?
var pig_gravity = -2;         // For possible pig projectile motion
var pig_damage = 20;         // How much damage does the pig do
var max_pigs = 8;
var arrow = new THREE.Object3D();
var pigs = new THREE.Object3D();
scene.add(pigs);

// OBJ Loader stuff
var pig_obj = new THREE.Object3D();
var pig_scale = 20;

var loader = new THREE.OBJLoader();
loader.load('./obj/pig.obj', function(object) 
{
    object.traverse( function ( child )
    {
        if ( child instanceof THREE.Mesh )
            child.material = pig_material.clone();
            // console.log(child.material)
    });
    // object.material = pig_material;
    object.scale.set(pig_scale,pig_scale,pig_scale);
    pig_obj = object.clone();
});

// Pig Collision Detection Stuff
var pig_coll_distance = 10;         // How close before collision == True?
var pigRaycaster = new THREE.Raycaster();

var directionRays = [
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(1, 0, 1),
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(1, 0, -1),
  new THREE.Vector3(0, 0, -1),
  new THREE.Vector3(-1, 0, -1),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(-1, 0, 1),
];

// Pickables and Health Packs
var pickingRaycaster = new THREE.Raycaster();
var picking_distance = 150;
function makePicking(){
  console.log('Make Picking Ray')
  pickingRaycaster.set(camera.getWorldPosition(), camera.getWorldDirection())
  var intersects = pickingRaycaster.intersectObjects( pickable.children );
  if (intersects.length > 0 && intersects[0].distance <= picking_distance) {
    console.log('Found Pickable')
    player_health += 10;
    pickable.remove(intersects[0].object)
  }
  var intersects = pickingRaycaster.intersectObjects( teleporters );
  if (intersects.length > 0 && intersects[0].distance <= picking_distance) {
    console.log('Found Teleporter')
    // console.log(intersects[0].object.tele_id)
    if(intersects[0].object.tele_id == 0){
      // console.log(teleporters[1].position.clone())
      console.log(teleporters[1])
      controls.getObject().position.x = teleporters[1].parent.position.x+1;
      controls.getObject().position.z = teleporters[1].parent.position.z;
      // console.log(controls.getObject().position)
    }
    else{
      controls.getObject().position.x = teleporters[0].parent.position.x+1;
      controls.getObject().position.z = teleporters[0].parent.position.z;    }
  }  
}

// Generate trees
// Pyramid shape idea: http://humaan2.com.au/chris/mountains/?seed=2632
// var tree_height = 150
// var tree_radius = tree_height / 4;
// var trunk_height = 100
// var trunk_base = 25
var obstacle_trees = []
var woodMaterial = new THREE.MeshPhongMaterial({ map: woodTexture, color: 0xffffff });

function makeTree(x,z,r){
  var variation = getRand(0.9,1.02)
  var tree_height = 95*variation
  var tree_radius = tree_height / 4;
  var trunk_height = 100
  var trunk_base = 20*variation
  // The treegeometry.faces[0].vertexColors[0] = generateGrassColor();
  var geometry = new THREE.CylinderGeometry( 1, tree_radius*2, tree_height, 4 );
  var material = new THREE.MeshPhongMaterial();
  material.color = new THREE.Color().setRGB( Math.random() * 0.1 + 0.1, Math.random() * 0.3 + 0.3, Math.random() * 0.2 + 0.1 );
  var tree = new THREE.Mesh( geometry, material );

  // The trunk
  var geometry = new THREE.CylinderGeometry( trunk_base/2, trunk_base/2, trunk_height, 32 );
  var trunk = new THREE.Mesh( geometry, woodMaterial );
  scene.add( trunk );  

  trunk.position.x = x;
  trunk.position.z = z;
  trunk.position.y = 10;
  trunk.rotateOnAxis(y_axis, r)
  trunk.add(tree)
  obstacle_trees.push(trunk)
  // trunk.castShadow = true;
  // trunk.receiveShadow = true;
  // tree.castShadow = true;
  // tree.receiveShadow = true;
  tree.position.y = trunk_height/2 + tree_height/2;
}

makeTree(-edges+200,-edges/4,getRand(0,Math.PI/4))
makeTree(-edges+200,-edges/4+50,getRand(0,Math.PI/4))
makeTree(edges-50,edges-100,getRand(0,Math.PI/4))
makeTree(edges-180,edges-160,getRand(0,Math.PI/4))

// Make billboard bushes
// The math: https://sites.google.com/site/threejstuts/home/billboard
var bushes = []
var bushTexture = THREE.ImageUtils.loadTexture('./textures/bush.png');
var bushMaterial = new THREE.MeshPhongMaterial({ map: bushTexture });  
bushMaterial.side = THREE.DoubleSide;
bushMaterial.transparent = true; 
var bush_size = 45
function makeBush(x,z){
  bush = new THREE.Mesh (new THREE.PlaneGeometry (bush_size,bush_size), bushMaterial);
  bush.position.x = x
  bush.position.z = z
  bush.position.y = bush_size/2
  scene.add(bush);
  obstacle_trees.push(bush)
  bushes.push(bush);
}

// Add Trees and Bushes to scene
for ( var i = 0; i < 15; i ++ ) {
  makeTree(getPosNeg()*getRand(0,edges-200),getPosNeg()*getRand(0,edges-400),getRand(0,Math.PI/4));
  makeBush(getPosNeg()*getRand(0,edges-200),getPosNeg()*getRand(0,edges-400))
}


function rotateBush(bush)
{
    var b = bush.position.clone();  // billboard location
    var rotaxis = new THREE.Vector3();
    var v, y_up, n;
    
    v = camera.getWorldPosition().clone(); // clone the camera position
    y_up = new THREE.Vector3(0, 1, 0); // up
    n = new THREE.Vector3(0, 0, 1); // billboard normal

    v.subVectors(v, b); // v-b
    v.sub(y_up.clone().multiplyScalar(v.dot(y_up)));
    v.normalize(); // pxz

    rotangle = Math.acos(v.dot(n));
    rotaxis.crossVectors(n, v);
    if (rotaxis.dot(y_up) < 0) rotangle *= -1;

    bush.rotation.y = rotangle;
}



// Function to make and shoot a pig
function makePig(){
  console.log('Making Pig')
  // scene.remove(arrow);
  // arrow = new THREE.ArrowHelper( camera.getWorldDirection(), camera.getWorldPosition(), 100, Math.random() * 0xffffff );
  // scene.add( arrow );  
  if (pigs.children.length < max_pigs){
    // Get camera direction and position
    dir = camera.getWorldDirection();
    pos = camera.getWorldPosition();
    // Make a new pig
    var pig = pig_obj.clone();
    pig.pig_t = default_pig_t;
    pig.p0 = pos.clone();
    pig.dir = dir.clone();
    pig.hasCollided = false;

    // pig.material = pig_material.clone()
    pig.rotateOnAxis(x_axis, Math.floor((Math.random() * Math.PI)));
    pig.rotateOnAxis(y_axis, Math.floor((Math.random() * Math.PI)));
    pig.rotateOnAxis(z_axis, Math.floor((Math.random() * Math.PI)));
    pig.position.set(pig.p0.x + pig.pig_t*pig.dir.x,
                         pig.p0.y + pig.pig_t*pig.dir.y,
                         pig.p0.z + pig.pig_t*pig.dir.z);
    isFiring = true;
    pigs.add(pig);
  }
  else{
    console.log('Max Pigs')
  }
}

var isPigClownCollided = false;

function updatePigs(){
  for (var p = pigs.children.length-1; p >= 0; p--){
    pig = pigs.children[p]
    pig.position.set(pig.p0.x + pig.pig_t*pig.dir.x,
                     pig.p0.y + pig.pig_t*pig.dir.y,
                     pig.p0.z + pig.pig_t*pig.dir.z);
    pig.pig_t = pig.pig_t + pig_speed;

    // Remove out of range pigs
    if (pig.pig_t >= pig_range || pig.position.y <= 5){
      isPigClownCollided = false;
      pigs.remove(pig);
      console.log('Active Pigs: ' + pigs.children.length)
      if (pigs.length == 0 ){
        isFiring = false;
      }
    }

    // Compute collisions
    // Credits and ideas: 
    // http://stemkoski.github.io/Three.js/Collision-Detection.html
    // http://webmaestro.fr/collisions-detection-three-js-raycasting/
    if(!pig.hasCollided){
      for (i = 0; i < directionRays.length; i++) {
        pigRaycaster.set(pig.position, directionRays[i])
        var intersects = pigRaycaster.intersectObjects( clowns.children );
        if (intersects.length > 0 && intersects[0].distance <= pig_coll_distance) {
          pig.hasCollided = true;
          intersects[ 0 ].object.material.color.offsetHSL(0,+0.25,-0.10)
          intersects[ 0 ].object.health -= pig_damage
          intersects[ 0 ].object.clownSpeed += 0.15
          player_score += Math.floor(pig_damage/2);
          computeClownPigPhysics(intersects[ 0 ].object,pig)
          intersects[ 0 ].object.scale.set(2,2,2)
          isPigClownCollided = true;
          pig.children[0].material = splatterMaterial;
          splat_time = performance.now();
          if (intersects[ 0 ].object.health <= 0){
            clowns.remove(intersects[ 0 ].object)
            player_score += player_score + pig_damage*2;
          }
        }
      }
    }
  }  
}

function onDocumentMouseDown( event ) {
  // Left mouse click shoots pig
  if (event.which == 1){
    if (controlsEnabled){
      makePig();
    }
  }
  // Right mouse click for picking ray
  if (event.which == 3){
    if (controlsEnabled){
      makePicking();
    }
  }  
}

// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);
resize();

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
  window.scrollTo(0,0);
}

////////////////////////
// Make floor
////////////////////////
var floorTexture = new THREE.ImageUtils.loadTexture( 'textures/grass.jpg' );
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
floorTexture.repeat.set( 6, 6 );
var floorMaterial = new THREE.MeshPhongMaterial( { map: floorTexture, side: THREE.DoubleSide } );
var floorGeometry = new THREE.PlaneGeometry(5000, 5000, 10, 10);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -1;
floor.rotation.x = Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

//////////////////////////////////////////
// Procedural Generation of Grass Blades
// Credits: http://nikvoss.com/2013/02/threejs-grass-rendering/
// Simplified version with 2 faces + 4 vertices
//////////////////////////////////////////
var grassScale = 2.9;

function generateRandomGrassLeaf( material ) {
  var geometry = new THREE.Geometry(),
    dir = (Math.random() > 0.5) ? 1.0 : -1.0, // Direction of the grass
    offset = Math.random() * 0.5 + 0.2, // How much movement
    factor = Math.random() * 2 + 1; // scale it up

  geometry.vertices.push( new THREE.Vector3(   0, 0, dir * factor * Math.pow( offset, 5 ) ) );
  geometry.vertices.push( new THREE.Vector3(   1, 0, dir * factor * Math.pow( offset, 5 ) ) );
  geometry.vertices.push( new THREE.Vector3(   0.5, 4.5, dir * factor * Math.pow( offset, 4 ) ) );
  geometry.vertices.push( new THREE.Vector3( 0.8, 3, dir * factor * Math.pow( offset, 3 ) ) );
  geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
  geometry.faces.push( new THREE.Face3( 0, 3, 2 ) );

  function grassColor() {
    return new THREE.Color().setRGB( Math.random() * 0.1 + 0.1, Math.random() * 0.3 + 0.3, Math.random() * 0.2 + 0.1 );
  }

  geometry.faces[0].vertexColors[0] = grassColor();
  geometry.faces[0].vertexColors[1] = grassColor();
  geometry.faces[0].vertexColors[2] = grassColor();

  geometry.faces[1].vertexColors[0] = grassColor();
  geometry.faces[1].vertexColors[1] = grassColor();
  geometry.faces[1].vertexColors[2] = grassColor();

  var mesh = new THREE.Mesh( geometry, material );
  mesh.scale.set(grassScale, Math.random() * grassScale + grassScale, grassScale);
  mesh.position.x = Math.random() * worldWidth - worldWidth/2;
  mesh.position.z = Math.random() * worldDepth - worldDepth/2;
  mesh.rotation.y = Math.random() * Math.PI;
  return mesh;
}

var grassCount = 7000;
grassMaterial = new THREE.MeshPhongMaterial( { shading: THREE.FlatShading, vertexColors: THREE.VertexColors, side: THREE.DoubleSide } );
grassGeometry = new THREE.Geometry();
for ( var i = 0, l = grassCount; i < l; i++ ) {
  THREE.GeometryUtils.merge(grassGeometry, generateRandomGrassLeaf( grassMaterial ) );
}
grassMesh = new THREE.Mesh( grassGeometry, grassMaterial );
grassMesh.position.y = 5;
scene.add(grassMesh);

//////////////////////////////////////////////////////////////////////////////////
// Add a Sky Box!
// https://www.script-tutorials.com/webgl-with-three-js-lesson-5/
// Grimm night background by Jockum Skoglund aka hipshot (www.zfight.com)
//////////////////////////////////////////////////////////////////////////////////
var path = 'textures/skybox/';
// var sides = [ path + 'posx.jpg', path + 'negx.jpg', path + 'posy.jpg', path + 'negy.jpg', path + 'posz.jpg', path + 'negz.jpg' ];
var sides = [ path + 'grimmnight_px.png', path + 'grimmnight_nx.png', path + 'grimmnight_py.png', path + 'grimmnight_ny.png', path + 'grimmnight_pz.png', path + 'grimmnight_nz.png' ];
var scCube = THREE.ImageUtils.loadTextureCube(sides);
scCube.format = THREE.RGBFormat;
var skyShader = THREE.ShaderLib["cube"];
skyShader.uniforms["tCube"].value = scCube;
var skyMaterial = new THREE.ShaderMaterial( {
  fragmentShader: skyShader.fragmentShader, vertexShader: skyShader.vertexShader,
  uniforms: skyShader.uniforms, depthWrite: false, side: THREE.BackSide
});

var skyBox = new THREE.Mesh(new THREE.CubeGeometry(1024, 1024, 1024), skyMaterial);
skyBox.scale.set(4,4,4)
skyMaterial.needsUpdate = true;
scene.add(skyBox);


//////////////////////////////////////////////////////////////////////////////////
// Add the clowns
//////////////////////////////////////////////////////////////////////////////////
clowns = new THREE.Object3D();
scene.add( clowns );
var cubeTexture = THREE.ImageUtils.loadTexture('./textures/clown5.jpg');
var range = 500; // How wide of a range to generate the clowns
var clown_height = 25; // How high above the ground should the clown be
var clown_health = 100; // Clown starts at 100 health
var max_clowns = 5; // How many clowns
var clownSpeed = 0.50;
var clownRaycaster = new THREE.Raycaster();
var clown_damage_distance = 30;
var clown_damage = 10;
var canDoDamage = true;
var distance_to_player;
var isPlayerDamaged;
var blink_on = true;
var blink_duration = 0.1;
var blink_time_end;
var splat_time = 0.0;

// Splatter Blob Pig
// Idea: https://www.clicktorelease.com/blog/vertex-displacement-noise-3d-webgl-glsl-three-js
var splatterMaterial = new THREE.ShaderMaterial( {
    uniforms: {
      time: {type : 'f', value: splat_time}
    },
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent
} );

splatterMaterial.needsUpdate = true;


function spawnClown(x,z){
  var cubeMaterial = new THREE.MeshPhongMaterial({ map: cubeTexture, color: 0xffffff });
  cubeMaterial.color.setHSL(5, 0.54, 0.84);
  var cubeGeometry = new THREE.SphereGeometry( 10, 20, 20, 0, Math.PI*2);  
  var clown_cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
  clown_cube.position.set(x, Math.random()*clown_height+25, z );
  clown_cube.health = clown_health;
  clown_cube.moveTowardsDirection = new THREE.Vector3(getRandSigned(), 
                                                         0, 
                                                         getRandSigned());
  clown_cube.rotationSpeed = getRand(8,128) // Add random rotations
  clown_cube.isFound = false // Did the clown see the player? initialize to false
  clown_cube.clownSpeed = clownSpeed
  clowns.add( clown_cube );  
  return clown_cube
}

///////////////////////////////////////////////////////////
// To update clown movement and health pack rotations
//////////////////////////////////////////////////////////
function updateClowns(){
  for (var h = 0; h < pickable.children.length; h++){
    heart = pickable.children[h]
    heart.rotateOnAxis(y_axis, Math.PI/256)
  }

  if (isPlayerDamaged){
    if (current_time > blink_time_end){
      blink_time_end = current_time + blink_duration;
      console.log('Toggle Blink')
      if(blink_on){
        damage_plane.material.opacity = 0.15;
      }
      else
        damage_plane.material.opacity = 0.6;
      blink_on = !blink_on;
    }
    if (current_time > resistance_time_end){
      canDoDamage = true;
      isPlayerDamaged = false;
      camera.remove( damage_plane );
    }      
  }

  for(var c = 0; c < clowns.children.length; c++ ) {
    clown = clowns.children[c]
    cx = clown.moveTowardsDirection.x
    cz = clown.moveTowardsDirection.z
    cx_0 = clown.position.x; cy_0 = clown.position.y; cz_0 = clown.position.z   
    clown.position.set( cx_0+clown.clownSpeed*cx,
                        cy_0,
                        cz_0+clown.clownSpeed*cz)
    
    // Check for collision with boundaries
    if(Math.abs(clown.position.x) >= edges || Math.abs(clown.position.z) >= edges){
      clown.moveTowardsDirection.x = -clown.moveTowardsDirection.x;
      clown.moveTowardsDirection.z = -clown.moveTowardsDirection.z;
    }

    // Check for collision with trees and toehr
    for (i = 0; i < directionRays.length; i++) {
      clownRaycaster.set(clown.position, directionRays[i])
      var intersections = clownRaycaster.intersectObjects( obstacle_trees, true );
      var isBlocked = intersections.length > 0;
      if (isBlocked && intersections[0].distance < 5 ){
        console.log('Clown Collision with Tree')
        clown.moveTowardsDirection.x = (-directionRays[i].x)
        clown.moveTowardsDirection.y = (-directionRays[i].y)
        clown.moveTowardsDirection.z = (-directionRays[i].z)      
      }
    }    

    // If the clown has not detected the player then rotate
    if (!clown.isFound){
      clown.rotateOnAxis(y_axis, Math.PI/clown.rotationSpeed)
    }     
    else{ // Else look at player
      clown.lookAt(camera.getWorldPosition().clone());
    }
    // How close is the clown to the player?
    distance_to_player = distanceVector(camera.getWorldPosition(), clown.position);
    if (distance_to_player < clown_damage_distance*9){
      clown.clownSpeed = clown.clownSpeed + 0.035
    }
    if (distance_to_player < clown_damage_distance){     
      if (canDoDamage) {
        damageToPlayer();
        computeClownPlayerPhysics(clown);
      }
    }
  }
}

// Compute clown-player and clown-pig physics during collision
// Assuming for the clown-pig:
// 1. Conservation of linear momentum
// 2. Both bodies have equal mass
// http://physics.stackexchange.com/questions/79047/determine-resultant-velocity-of-an-elastic-particle-particle-collision-in-3d-spa
// For the clown-player: clown moves away in opposite direction until updateAI() is called.
var m1 = 200
var m2 = 100
var coll_scale = 0.8;
function computeClownPlayerPhysics(clown){
  clown_dir = clown.moveTowardsDirection.clone();
  clown.moveTowardsDirection.x = -clown_dir.x
  clown.moveTowardsDirection.z = -clown_dir.z
  velocity.x = clown_dir.x * 10.0
  velocity.z = clown_dir.z * 10.0
  controls.getObject().translateX( velocity.x * m1/m2 * coll_scale);
  controls.getObject().translateZ( velocity.z * m1/m2 * coll_scale);  
}

function computeClownPigPhysics(clown,pig){
  clown_dir = clown.moveTowardsDirection.clone().normalize();
  pig_dir = pig.dir.clone().normalize();
  collision_normal = clown_dir.sub(pig_dir);
  rel_velocity = clown_dir.sub(pig_dir).dot(collision_normal);
  console.log(rel_velocity)
  clown.moveTowardsDirection.x = (-collision_normal.x);
  clown.moveTowardsDirection.y = (-collision_normal.y);
  clown.moveTowardsDirection.z = (-collision_normal.z); 
  clown.clownSpeed += rel_velocity/50 ;
}

var resistance_time_length = 5;
var resistance_time_start;
var resistance_timend;
var geometry = new THREE.PlaneGeometry( 5, 5, 32 );
var material = new THREE.MeshBasicMaterial( {color: 0xff0000, side: THREE.DoubleSide} );
var damage_plane = new THREE.Mesh( geometry, material );
damage_plane.position.z = -1;
damage_plane.material.transparent = true
damage_plane.material.opacity = 0.5;

function damageToPlayer(){
  isPlayerDamaged = true;
  resistance_time_start = clock.getElapsedTime();
  resistance_time_end = resistance_time_start + resistance_time_length;       
  player_health = player_health - clown_damage;
  canDoDamage = false;
  blink_time_end = current_time + blink_duration
  camera.add( damage_plane );
}

var ai_time_length = 3;
var ai_time_start = clock.getElapsedTime();
var ai_time_end = ai_time_start + ai_time_length;  

// Helper function to generate rand signed integer between -1 and 1
function getRandSigned(){
  var num = (Math.random());
  num *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases        
  return num;
}

function getPosNeg(){
  return Math.floor(Math.random()*2) == 1 ? 1 : -1
}

// Helper function to generate rand number between x,y
function getRand(x,y){
  var num = (Math.random()*y)+x;
  return num;
}

// To update the clown AI
// For all clowns, shoot a ray and update clown.direction to 
// move towards the player if detected, otherwise a random direction is used
function distanceVector( v1, v2 )
{
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}

var lambda = 0.5;
var lambda_health = 1;
makeHealthPack(getRand(-1000,1000),getRand(-1000,1000))
makeHealthPack(getRand(-1000,1000),getRand(-1000,1000))
function updateAI(){
  // Check if we need new health packs
  // TODO: Follow exponential distribution
  // console.log(pickable.children.length)
  if (pickable.children.length < max_health){ //max_health as in maximum health pickables
    console.log(lambda_health*Math.exp(-player_health/20))
    if(Math.random() < lambda_health*Math.exp(-player_health/20))
      makeHealthPack(getRand(-1000,1000),getRand(-1000,1000))
  }

  // Do we need to spawn new clowns?
  // Spawn a new clown with a certain probability and set its location to
  // a random clown currently on the map
  if (clowns.children.length < max_clowns){
    if (Math.random() < lambda*Math.exp(-lambda*clowns.children.length/2)){
      clown = spawnClown(getRand(edges/4,edges/2),getRand(edges/4,edges/2));
      existing_clown = clowns.children[0]
      clown.position.set(existing_clown.position.x,getRand(clown_height,clown_height+5),existing_clown.position.z)
    }
  }

  // Handle the clown movements and AI
  for(var c = 0; c < clowns.children.length; c++ ) {
    clown = clowns.children[c]
    var isFound = false;
    var distance_to_player = distanceVector(camera.getWorldPosition(), clown.position)
    // console.log(distance_to_player)
    if (distance_to_player <= 450){
      clown.isFound = true;
      // console.log('AI: Player Detected')
      player_pos = camera.getWorldPosition().clone();
      clown_pos = clown.position;
      clown.lookAt(player_pos);
      move_dir = new THREE.Vector3();
      clown.moveTowardsDirection = move_dir.subVectors(player_pos,clown_pos).normalize();
      clown.clownSpeed = clown.clownSpeed + 0.05;
    }

    else{
      clown.isFound = false;
      if (Math.random() < 0.5){
        // console.log('AI: Switching Clown Directions')
        clown.clownSpeed = clownSpeed;
        clown.rotationSpeed = getRand(16,256)
        clown.moveTowardsDirection = new THREE.Vector3(getRandSigned(), getRandSigned() , getRandSigned()).normalize();
        if ((clown.position.y) > 50 || clown.position.y < 15) {
          clown.moveTowardsDirection.y = -clown.moveTowardsDirection.y;
        }
      }
    }
  }
}


////////////////////////////////////
// To update the HUD
////////////////////////////////////
function updateHUD(){
  document.getElementById('player-position').innerHTML = "(" + Math.round(controls.getObject().position.x) + ',' + Math.round(controls.getObject().position.y) + ',' + Math.round(controls.getObject().position.z) + ")";
  document.getElementById('player-health').innerHTML = "<i class='glyphicon glyphicon-heart'></i>" + (player_health).toString() + '%';
  document.getElementById('player-score').innerHTML = "<i class='glyphicon glyphicon-usd'></i>" + (player_score).toString();
  document.getElementById('player-pigs').innerHTML = ""
  for(var p = max_pigs; p > pigs.children.length; p-- ) {
    document.getElementById('player-pigs').innerHTML = document.getElementById('player-pigs').innerHTML + "<i class='glyphicon glyphicon-piggy-bank'></i>"
  }

  document.getElementById('player-clowns').innerHTML = ""
  for(var p = 0; p < clowns.children.length; p++ ) {
    document.getElementById('player-clowns').innerHTML = document.getElementById('player-clowns').innerHTML + "<i class='glyphicon glyphicon-user'></i>"
  }

}


function update() {
  stats.begin();
  current_time = clock.getElapsedTime();

  if ( isFiring ){
    updatePigs();
  }

  if (current_time > ai_time_end){  
    ai_time_start = clock.getElapsedTime();
    ai_time_end = ai_time_start + ai_time_length;    
    updateAI();
  }

  if (Math.abs(controls.getObject().position.x) > edges || Math.abs(controls.getObject().position.z) > edges){
    if (canDoDamage){
      damageToPlayer()
    }
  }

  if ( controlsEnabled ) {
    if (!initClown){
      // Initialize clowns
      for(var i = 0; i < max_clowns; i++ ) {
        spawnClown(getRand(controls.getObject().position.x+100,edges-100),getRand(controls.getObject().position.z+100,edges-100));
      }  
      initClown = true;
    }    

    updateClowns();   
    var time = performance.now();
    var delta = ( time - prevTime ) / 1000;
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
    if ( moveForward ) velocity.z -= playerMovementSpeed * delta;
    if ( moveBackward ) velocity.z += playerMovementSpeed * delta;
    if ( moveLeft ) velocity.x -= playerMovementSpeed * delta;
    if ( moveRight ) velocity.x += playerMovementSpeed * delta;
    for (i = 0; i < directionRays.length; i++) {
      raycaster.set(controls.getObject().position, directionRays[i])
      var intersections = raycaster.intersectObjects( obstacle_trees, true );
      var isBlocked = intersections.length > 0;
      if (isBlocked && intersections[0].distance < 5 ){
        console.log('Collision with Tree')
        velocity.x += (-directionRays[i].x * playerMovementSpeed * delta)
        velocity.z += (-directionRays[i].z * playerMovementSpeed * delta)      
        // camera.updateProjectionMatrix();
      }
    }  

    controls.getObject().translateX( velocity.x * delta );
    controls.getObject().translateY( velocity.y * delta );
    controls.getObject().translateZ( velocity.z * delta );
    if ( controls.getObject().position.y < 10 ) {
      velocity.y = 0;
      controls.getObject().position.y = 10;
      canJump = true;
    }
    prevTime = time;
    camera.updateProjectionMatrix();
    updateHUD();
  }

  if(player_health <= 0){
    loser.style.display = '-webkit-box';
    loser.style.display = '-moz-box';
    loser.style.display = 'box';
    blocker.style.display = '-webkit-box';
    blocker.style.display = '-moz-box';
    blocker.style.display = 'box';    
    controlsEnabled = false;
    controls.enabled = false;
  }

  if(initClown && clowns.children.length < 1){
    winner.style.display = '-webkit-box';
    winner.style.display = '-moz-box';
    winner.style.display = 'box';
    blocker.style.display = '-webkit-box';
    blocker.style.display = '-moz-box';
    blocker.style.display = 'box';    
    controlsEnabled = false;
    controls.enabled = false;
  }

  // Particle system
  makeItSnow();

  // Billboarding
  for (i=0; i<bushes.length; i++){
    rotateBush(bushes[i])
  }

  if(isPigClownCollided){
    // console.log('time - splat_time', time - splat_time)
    splatterMaterial.uniforms[ 'time' ].value = (time - splat_time)/1000;
    splatterMaterial.needsUpdate = true;
  }

  stats.end();
  requestAnimationFrame(update);
  renderer.render( scene, camera );
}

var initClown = false;
update();
