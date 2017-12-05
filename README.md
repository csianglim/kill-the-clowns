# Kill The Clowns - CS314 Project 4 "Your Own Game"
- Final project created for CPSC 314 (Computer Graphics), University of British Columbia - January 2016 session. 
- Link to course website: https://www.ugrad.cs.ubc.ca/~cs314/Vjan2016/
- Play the game [here](http://www.siang.ca/kill-the-clowns/index.html)

### Documentation (readme.txt) submitted for the course provided below.

By submitting this file, I hereby declare that I worked individually on this assignment and wrote all of this code. I have listed all external resoures (web pages, books) used below. I have listed all people with whom I have had significant discussions about the project below.

## What: HIGH LEVEL OVERVIEW (Gameplay)
A 3D first person shooter where the player shoots pigs to kill ball-shaped clowns. The player must destroy all clowns on the map to win the game. 

The player loses the game when health = 0. Player incurs damage by:

1) colliding with clowns
2) crossing the red wooden fence

The player generates a picking ray by right clicking the mouse:

1) Pick up randomly-generated health packs (heart-shaped) to increase your health.
2) Use the teleporter (lamp post) to teleport to the other side of the map.

Explicit list of advanced functionality items:
1. Advanced rendering
    - Texture Billboarding
    - Environment Map/Skybox + Floor
2. Shaders
    - Manipulated the vertex shader and fragment shader using glsl to distort the normals of the mesh outwards, making a blob effect when the pig collides with a clown
3. Particle Systems:
    - Snow flakes falling down at a random velocity and random locations on the map using THREE.PointCloud 
4. Procedural modeling or textures or motion:
    - Generation of random grass blades on the floor
5. Collision Detection:
    - Boundary-Object, Boundary-Player Detection
    - Player-Object Detection
    - Object-Object Detection



## How: MID LEVEL DESCRIPTIONS
Algorithms and Data Structures

------------------------
3D Objects: 
------------------------
Examples:
trees, lamp posts, fences, spheres, hearts (health packs), grass, pigs

3D hierachy examples:
1. tree leaves (modelled by a 3D cone) are children of tree trunks
2. lamp posts have a cylindrical pole as the parent and the pole has a spherical globe and base as its children

Heart shape credits: http://threejs.org/examples/webgl_geometry_shapes.html
Pig OBJ credits: http://tf3dm.com/3d-model/pig-13314.html

------------------------
3D Camera: 
------------------------
Using Three.JS PointerLockControls and the browser's PointerLock API: 
http://mrdoob.github.io/three.js/examples/misc_controls_pointerlock.html

Player can pan the camera using W,A,S,D and rotate the view using the mouse.

Camera Crosshair Implementation
http://stackoverflow.com/questions/31655888/how-to-cast-a-visible-ray-threejs

A 2D crosshair is drawn on the screen by using THREE.Line and LineBasicMaterial and placing the object in front of the camera (close to the near plane at z=-0.5).

------------------------
Interactivity: 
------------------------
The player can interact with the 3D world in the following ways:

1. Keyboard + mouse controls to move the camera (and player) around.
2. Holding the shift key to increase the player's movement speed and space bar to jump
3. Right clicking to generate a picking ray and the game responds depending on what object the ray hits (picking up health packs, teleportation)
4. Left clicking to aim and fire pigs

------------------------
Lighting and shading:
------------------------
1. Ambient light 
2. Directional light coming down at an angle from the sky
3. Headlights (implemented as point light) shining out from the top of the camera
4. Point lights from the lamp posts/teleporters

Almost all objects in the 3D world are MeshPhongMaterial to show the lighting properly.

In addition to the lighting above:
When the player incurs damaged, I create a PlaneGeometry in front of the camera and toggle its opacity value between high and low to create a blinking effect for about 5 seconds. The player will not incur additional damage during this invicibility period.

------------------------
Picking:
------------------------
Picking is implemented primarily by raycasting using THREE.Raycaster.

1. Shooting a pig
A pig is generated in front of the camera when the left mouse button is clicked. The pig travels along the direction pointed by the crosshair. The pig checks for collision by shooting rays in several pre-defined directions (var directionRays) during the call to updatePigs(). The directions are limited for performance considerations because shooting rays in all directions is too expensive. Collision is true when any ray intersects a clown mesh and the intersection distance is below a certain threshold.

2. Picking health packs and teleporting
When the right mouse button is clicked, a picking ray is fired along the direction pointed by the crosshair. If the ray hits a valid object and the player-object distance is belowed a certain threshold, an event is triggered. Valid objects are heart-shaped health packs which will increase the player's health by 10% and teleporter bases which will update the players position to the location of the second teleporter.

------------------------
Texturing:
------------------------
1. The floor and fence have grassy and wooden textures.
2. The teleporter base has a metallic texture 
Credits: http://texturelib.com/texture/?path=/Textures/metal/bare/metal_bare_0050
3. The clown face is a texture
Credits: Fahmi Reza - https://www.facebook.com/kuasasiswa?fref=nf
4. Skybox texture
Credits: Grimm night background by Jockum Skoglund aka hipshot (www.zfight.com)
5. Pig object
Credits: http://tf3dm.com/3d-model/pig-13314.html

------------------------
On-screen control panel
------------------------
Top-left:
Framerate counter https://github.com/mrdoob/stats.js/

Bottom-left:
Player's position

Top-right:
Health and score

Bottom-right:
Number of clowns left
Available pigs

Win/Lose message at the end of the game

The on-screen display is updated in updateHUD() which replaces the <div>'s HTML content with the latest game variables.

Credits: Bootstrap and Glyphicon for the icon-fonts.
http://getbootstrap.com/components/

------------------------------------------------
Advanced rendering effects:
------------------------------------------------
Texture billboarding for the bushes
Tutorial and math reference: 
https://sites.google.com/site/threejstuts/home/billboard
Bush PNG credit: http://www.garagegames.com/community/blogs/view/12655

Implementation:
Plane geometry mesh with bush.png texture map. The plane rotates to face the player depending on the position of the camera. Also, doge.

Environment Map/Skybox:
Same method as the ones I used in P1 and P2.

------------------------------------------------
Shaders:
------------------------------------------------
When a pig collides with a clown, a counter based on the time since collided is activated and passed to the vertex shader as a uniform float. The normals of each vertex of the pig are pushed outwards with their displacement based on the counter value, creating a blob effect. gl_FragColor is set to the normals making a rainbow-ish pig blob.

Idea from: https://www.clicktorelease.com/blog/vertex-displacement-noise-3d-webgl-glsl-three-js

------------------------------------------------
Particle Systems:
------------------------------------------------
Snow

1500 vertices are generated at random x,y,z points with random initial downward velocities on the map and pushed into THREE.Geometry() as vertices. A particle system using THREE.PointCloud is defined using the geometry generated and a snowflake texture as the material. In each update() call, the location of each snowflake is updated based on its velocity. The y-value of the particle is checked and if its below the floor, it gets moved up to the top of the world again such that 1500 particles are maintained in the game at any time.

References:
// Primary Source of Ref:
http://owendiehl.azurewebsites.net/snowglobe-threejs/
// Tutorial: https://aerotwist.com/tutorials/creating-particles-with-three-js/
// Tutorial: https://airtightinteractive.com/demos/js/snowbox/
// Snowflake Texture: http://pngimg.com/upload/snowflakes_PNG7578.png

------------------------------------------------
Procedural modeling or textures or motion:
------------------------------------------------
Grass generation:
Credits: http://nikvoss.com/2013/02/threejs-grass-rendering/

Description
1. Generate 4 random vertices and connect 3 vertices (0,1,2) as a face to get a flat-ish triangular geometry. Connect the remaining vertex with 2 other initial vertices to get another face. Color the 2 different faces with random shades of green to get some complexity.

2. Place the grass blade randomly on the map

3. Repeat for a few thousand grass blades

4. Merge the grass blades together to get a giant grass mesh and add it to the scene.

------------------------------------------------
Collision detection
------------------------------------------------
Collision detection is implemented at several levels:

* Object-Boundary Collision Detection *
If a clown collides with the fence, its velocity vector is set to negative and the clown bounces back. The player incurs damage if its position is outside the fence but is not constrained to move within the fence.

Both of the above events are triggered by a simple position check to see if they exceed the threshold fence boundary.

* Clown - Player and Clown - Pig Collision Detection *
The clown-player Euclidean distance is repeatedly computed in updateClowns(). If the distance drops below a certain threshold then computeClownPlayerPhysics() is called, which causes the clown to move away in the opposite direction and the player knocked back slightly.

The clown-pig collision implements slightly more realistic physics (// http://physics.stackexchange.com/questions/79047/determine-resultant-velocity-of-an-elastic-particle-particle-collision-in-3d-spa).

Asummptions:
1. Conservation of linear momentum
2. Both pig and clown have equal mass

The normal vector between the pig and clown are computed as described on StackOverflow and the pig gets knocked back along that vector with a certain scaled velocity.

*Clown-Clown, Clown-Trees and Player-Trees collision*
Implemented using raycasting in several directions (same as the pig-clown collision detection). If the ray detects an object and the distance is below a certain threshold, the initiating object switches its velocity to move along the negative direction of the ray. This creates a camera bump effect for the player when the player hits a tree or a bush.

Collision Credits and Ideas:
// http://stemkoski.github.io/Three.js/Collision-Detection.html
// http://webmaestro.fr/collisions-detection-three-js-raycasting/

----------------------------------------
howto: Game Mechanics and Instructions
----------------------------------------
1. W,A,S,D          pan camera
2. Mouse            rotate view
3. Left click       shoot pig
4. Right cick       pick object/activate teleporter
5. Shift key        run (movement speed boost)
6. Space            jump

- Player
The objective of the game is to destroy all clowns on the map. The player can shoot up to 8 pigs at one time and must wait until the pigs rest to continue shooting as indicated by the icons on the bottom right of the screen. The player incurs damage by colliding with a clown and can pick up health packs to recharge. The player can right click on the teleporter (lamp post) to move to the other side of the map. 

- Clown
The clown rotates and moves in random directions until it is within a certain radius of the player. Upon which it will rotate to look at the player and move towards the player in a straight line. As the clown gets closer to the player, its speed increases. The clown can only change directions every 3 seconds so it is possible to dodge by moving left/right. If the player is out of range, the clown moves in random directions again. The player incurs damage by exploring outside the fence, however, the clowns cannot leave the fence and will bounce in the opposite direction if they hit it. The clowns are respawn with a certain probability sampled from an exponential-ish distribution. As the number of clowns on the map decrease, the probability of spawning increases. The spawning location will be close to a randomly chosen clown.

- Win/Lose
The player wins the game by destroying all clowns. The player loses the game when health = 0.

## Sources: Inspiration and Ideas
Detailed sources of technical references and credits provided in relevant sections of the the P4.js source code and in this README.

Inspiration for night-sky + grassy + creepy map:
- http://oos.moxiecode.com/js_webgl/grass_quads/
- http://oos.moxiecode.com/js_webgl/run_and_dont_look_back/

References for how to begin building an FPS with three.js
- http://www.isaacsukin.com/news/2012/06/how-build-first-person-shooter-browser-threejs-and-webglhtml5-canvas
- https://makc3d.wordpress.com/2014/07/20/threejs-first-person-shooter/

Inspiration for the clown face
- https://www.facebook.com/kuasasiswa
- http://www.bbc.com/news/blogs-trending-35486530
- http://www.wsj.com/articles/malaysian-leader-spent-millions-on-luxury-goods-1459383835

Pyramid shaped trees:
- http://humaan2.com.au/chris/mountains/?seed=2632
