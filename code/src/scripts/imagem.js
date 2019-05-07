function createMaterial() {

	var texture = new THREE.TextureLoader().load("../assets/monochromatic.png");

	var material = new THREE.MeshBasicMaterial({
		map: texture,
		color: '#ffffff',
		side: THREE.DoubleSide
	})

	start(material);
}