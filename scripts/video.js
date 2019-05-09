function createMaterial() {

	var video = document.createElement('video');
	enableInlineVideo(video);
	video.src = "assets/videos/hands.mp4";
	video.loop = true
	video.id = "video-texture";
	video.setAttribute('playsinline', '');
	video.muted = true;

	document.getElementById('audio').addEventListener('click', function(event) {
		if(event.currentTarget.classList.contains('muted')) {
			video.muted = false; 
			event.currentTarget.classList.remove('muted');
		}
		else {
			video.muted = true;
			event.currentTarget.classList.add('muted');
		}
	})

	document.body.appendChild(video);

	var texture = new THREE.VideoTexture(video);
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	texture.format = THREE.RGBFormat;

	var videoMat = new THREE.MeshLambertMaterial({
		map: texture,
		color: '#ffffff',
		side: THREE.FrontSide
	})

	start(videoMat, video);
}