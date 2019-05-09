function start(videoMat, videoContent) {

	var reg = new RegExp(/(hands-institucional)/g);
	var href = window.location.href;
	var prod = href.match(reg);

	THREEx.ArToolkitContext.baseURL = '../';

	var renderer = new THREE.WebGLRenderer({
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
	var GLTF2Loader = new THREE.GLTF2Loader();
	var OBJLoader = new THREE.OBJLoader();
	

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
	
	var camera = new THREE.PerspectiveCamera(45, 1, 1, 100);
	scene.add(camera);
	
	var arToolkitSource = new THREEx.ArToolkitSource({
		sourceType : 'webcam',
	});
	
	arToolkitSource.init(function onReady(){
		onResize();
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
		cameraParametersUrl: prod ? 'assets/camera_para.dat' : THREEx.ArToolkitContext.baseURL + 'assets/camera_para.dat',
		detectionMode: 'mono',
		maxDetectionRate: 30,
		canvasWidth: 80*3,
		canvasHeight: 60*3,
	})
	
	// initialize it
	arToolkitContext.init(function onCompleted(){

		let m = arToolkitContext.getProjectionMatrix();
		let far = 1000;
		let near = 0.1;
	
		m.elements[10] = -(far + near) / (far - near);
		m.elements[14] = -(2 * far * near) / (far - near);
	
		camera.projectionMatrix.copy(m);
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
		patternUrl : prod ? 'assets/qr-test.patt' : THREEx.ArToolkitContext.baseURL + 'assets/qr-test.patt'
	})
	
	// build a smoothedControls
	var smoothedRoot = new THREE.Group()
	scene.add(smoothedRoot)
	var smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, {
		lerpPosition: 0.2,
		lerpQuaternion: 0.03,
		lerpScale: 0.01,
	})
	
	var arWorldRoot = smoothedRoot;

	//TV
	GLTF2Loader.load(prod ? 'assets/meshes/RetroTV.glb' : '../assets/meshes/RetroTV.glb', function(object) {
		let tv = object.scene.getObjectByName("Retro_TV");
		tv.name = "tv";
		tv.position.y += 0.3;
		// tv.scale.set(1.5, 1.5, 1.5);
		tv.castShadow = true;
		arWorldRoot.add(tv);
	})
	//FIM TV
	
	//BASE
	var baseGeo = new THREE.CylinderGeometry(1, 1, 0.1, 32 );
	var baseMat = new THREE.MeshLambertMaterial({
		color: "#AAAAAA",
		side: THREE.DoubleSide
	})
	var base = new THREE.Mesh(baseGeo, baseMat);
	// base.scale.set(1.5, 1.5, 1.5);
	base.castShadow = true;
	base.receiveShadow = true;
	base.name = "base";
	arWorldRoot.add(base);
	//FIM BASE

	//VIDEO
	var videoSize = 0.5;
	var proportion = 1.14;
	var videoGeo = new THREE.PlaneGeometry(videoSize * proportion, videoSize, 32);
	var video = new THREE.Mesh(videoGeo, videoMat);
	video.name = "video";
	video.position.x = -0.13;
	video.position.y = 0.665;
	video.position.z = 0.3;
	// video.scale.set(1.5, 1.5, 1.5);
	arWorldRoot.add(video);
	//FIM VIDEO
	
	//TRIDENT
	// OBJLoader.load(prod ? 'assets/meshes/trident.obj' : '../assets/meshes/trident.obj', function(object) {
	// 	var textureLoader = new THREE.TextureLoader();
	// 	var box = textureLoader.load('assets/images/trident-box.jpg');
	// 	box.generateMipmaps = true;

	// 	object.traverse(function (child){
	// 		if (child instanceof THREE.Mesh) { 	
	// 			var tempMaterial = new THREE.MeshPhongMaterial({
	// 				map: box,
	// 				side: THREE.FrontSide,
	// 				polygonOffset: false,
	// 				polygonOffsetFactor: 0.0,
	// 				polygonOffsetUnits: 1.0
	// 			})
	// 			child.material = tempMaterial;
	// 		}
	// 	})
	// 	console.log(object);
	// 	let trident = object;
	// 	trident.name = "trident";
	// 	trident.scale.set(0.01, 0.01, 0.01);
	// 	trident.position.y += 0.3;
	// 	trident.castShadow = true;
	// 	arWorldRoot.add(trident);
	// })
	//FIM TRIDENT
	
	// render the scene
	onRenderFcts.push(function(){
		renderer.render( scene, camera );
	})

	var lastTimeMsec= null;
	requestAnimationFrame(function animate(nowMsec){
		
		if(scene.children[4].visible) {
			if(videoContent && videoContent.paused) videoContent.play();
			scene.getObjectByName("base").visible = true;
		}
		
		else {
			if(videoContent) {
				videoContent.pause(); 
				// videoContent.currentTime = 0;
			}
			scene.getObjectByName("base").visible = true;
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