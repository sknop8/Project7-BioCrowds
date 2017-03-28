const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import { BioCrowd, Agent } from './biocrowd'

let scene;
let crowd;
const agentGeo = new THREE.BoxGeometry( 0.3, 1, 0.3 );
const agentMat = new THREE.MeshBasicMaterial( { color: 0x2222dd } );

// called after the scene loads
function onLoad(framework) {
    scene = framework.scene;
    const camera = framework.camera;
    const renderer = framework.renderer;
    const gui = framework.gui;
    const stats = framework.stats;

    // Basic Lambert white
    const lambertWhite = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });

    // Set light
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.color.setHSL(0.1, 1, 0.95);
    directionalLight.position.set(1, 3, 2);
    directionalLight.position.multiplyScalar(10);

    // scene.background = skymap;
    renderer.setClearColor(0xffffff, 1);

    const objLoader = new THREE.OBJLoader();
    const markerGeo = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
    const markerMat = new THREE.MeshBasicMaterial( { color: 0x000000 } );



    // set camera position
    camera.position.set(15, 50, -15);
    camera.lookAt(new THREE.Vector3(0,-10,0));

    scene.add(directionalLight);

    // edit params and listen to changes like this
    // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
    gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
        camera.updateProjectionMatrix();
    });


    // Initialize bio crowd
    crowd = new BioCrowd(20, 4000);

    for (let m in crowd.markers){
      let pos = crowd.markers[m];
      let markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.set(pos.x, pos.y, pos.z);
      scene.add(markerMesh);
    }

    let startPositions = [];
    let endPositions = [];
    const NUM_AGENTS = 30;
    for (let i = 0; i < NUM_AGENTS; i++) {
      let x0 = (i / NUM_AGENTS) * crowd.grid_size;//Math.random() * crowd.grid_size;
      let z0 = 0 //Math.random() * crowd.grid_size;
      let x1 = x0// Math.random() * crowd.grid_size;
      let z1 = crowd.grid_size//Math.random() * crowd.grid_size;
      startPositions.push(new THREE.Vector3(x0, 0, z0));
      endPositions.push(new THREE.Vector3(x1, 0, z1));
    }
    crowd.SetupAgents(startPositions, endPositions);
}

function lerp(a, b, t) {
    return (1 - t) * a + t * b;
}k

// called on frame updates
function onUpdate(framework) {
  if (crowd) {
    crowd.MoveAgents();
    const agents = crowd.agents;

    for (let i = 0; i < agents.length; i++) {
      let pos = agents[i].pos;
      let agentMesh = new THREE.Mesh(agentGeo, agentMat);
      agentMesh.position.set(pos.x, pos.y, pos.z);
      let name = "agent" + i
      agentMesh.name = name;
      scene.remove(scene.getObjectByName(name,true));

      scene.add(agentMesh);
    }
  }
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);