function start(material, video) {

	THREEx.ArToolkitContext.baseURL = '../';

	var renderer	= new THREE.WebGLRenderer({
		antialias : true,
		alpha: true,
		logarithmicDepthBuffer: true
	});

	
	renderer.setClearColor(new THREE.Color('lightgrey'), 0);
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = '0px';
	renderer.domElement.style.left = '0px';
	document.body.appendChild(renderer.domElement);
	
	var onRenderFcts= [];
	var scene = new THREE.Scene();

	var ambient = new THREE.AmbientLight( 0x666666 );
	scene.add(ambient);

	var directionalLight = new THREE.DirectionalLight('white');
	directionalLight.position.set( 1, 2, 0.3 ).setLength(2)
	directionalLight.shadow.mapSize.set(128,128)
	directionalLight.shadow.camera.bottom = -0.6
	directionalLight.shadow.camera.top = 0.6
	directionalLight.shadow.camera.right = 0.6
	directionalLight.shadow.camera.left = -0.6
	directionalLight.castShadow = true;
	scene.add(directionalLight);
	
	var camera = new THREE.Camera();
	scene.add(camera);
	
	var arToolkitSource = new THREEx.ArToolkitSource({
		sourceType : 'webcam',
	});
	
	arToolkitSource.init(function onReady(){
		onResize()
	});
	
	window.addEventListener('resize', function(){
		onResize()
	});
	
	function onResize(){
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)
		
		if( arToolkitContext.arController !== null ){
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
		}	
	}
	
	// create atToolkitContext
	var arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: THREEx.ArToolkitContext.baseURL + 'lib/data/data/camera_para.dat',
		detectionMode: 'mono',
		maxDetectionRate: 30,
		canvasWidth: 80*3,
		canvasHeight: 60*3,
	})
	
	// initialize it
	arToolkitContext.init(function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	})
	
	// update artoolkit on every frame
	onRenderFcts.push(function(){
		if( arToolkitSource.ready === false )	return
		smoothedControls.update(markerRoot)
		arToolkitContext.update( arToolkitSource.domElement )
	})
	
	var markerRoot = new THREE.Group
	
	scene.add(markerRoot)
	var artoolkitMarker = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
		type : 'pattern',
		patternUrl : THREEx.ArToolkitContext.baseURL + 'lib/data/data/qr-test.patt'
	})
	
	// build a smoothedControls
	var smoothedRoot = new THREE.Group()
	scene.add(smoothedRoot)
	var smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, {
		lerpPosition: 0.2,
		lerpQuaternion: 0.03,
		lerpScale: 0.01,
	})
	
	var arWorldRoot = smoothedRoot
	var loader = new THREE.OBJLoader();
	loader.load('../assets/meshes/hands.obj', function(object) {
		
		var geometry = object.children[0].geometry;

		geometry.computeBoundingBox();
		var boundingBox = geometry.boundingBox;
		var amount = boundingBox.max.x - boundingBox.min.x;
		geometry.translate(-amount/2, 0, 0);

		console.log(material);

		object.rotation.x = Math.PI/2;
		object.children[0].material = material;
		arWorldRoot.add(object);
		console.log(object);
	})
	
	var size = 3;
	var geometry = new THREE.CircleGeometry(2, 32)
	var mat = new THREE.MeshLambertMaterial({
		color: "#CCCCCC",
		side: THREE.DoubleSide
	})
	
	var mesh = new THREE.Mesh(geometry, mat);
	// mesh.position.x = -size/2 + 1;
	// mesh.position.z = -(size * 1.425)/2 + 1;
	mesh.name = "hands";
	mesh.rotation.x = -Math.PI/2;
	arWorldRoot.add(mesh);
	
	// var stats = new Stats();
	// document.body.appendChild( stats.dom );
	
	// render the scene
	onRenderFcts.push(function(){
		renderer.render( scene, camera );
		// stats.update();
	})
	
	// run the rendering loop
	var lastTimeMsec= null;
	requestAnimationFrame(function animate(nowMsec){
		
		if(scene.children[2].visible) {
			if(video && video.paused) video.play();
			scene.getObjectByName("hands").visible = true;
		}
		
		else {
			if(video) {
				video.pause(); 
				video.currentTime = 0;
			}
			scene.getObjectByName("hands").visible = true;
		}
	
		// keep looping
		requestAnimationFrame( animate );
	
		// measure time
		lastTimeMsec = lastTimeMsec || nowMsec-1000/60
		var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
		lastTimeMsec = nowMsec;

		// call each update function
		onRenderFcts.forEach(function(onRenderFct){
			onRenderFct(deltaMsec/1000, nowMsec/1000);
		})
	})
}