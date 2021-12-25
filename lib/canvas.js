class HeadCanvas {
    constructor(options = {}) {
        this.textureURL = options.textureURL ?? '../img/head_base.png';
        this.textureFacesLoaded = {};

        this.rotX = options.rotX ?? 0;
        this.rotY = options.rotY ?? 1;
        this.distance = options.distance ?? 1.5;

        this.backgroundColor = options.backgroundColor;

        this.isPrimaryVisible = options.isPrimaryVisible ?? true;
        this.isSecundaryVisible = options.isSecundaryVisible ?? true;

        this.el = document.createElement('div');
        this.el.classList.add('headRender');
        if (this.parent) this.setParent(this.parent);
        
        // ThreeJS stuff
        this.scene = new THREE.Scene();
        if (this.backgroundColor) this.setBackgroundColor(this.backgroundColor);
        this.renderer = new THREE.WebGLRenderer({alpha: true});
        this.loader = new THREE.TextureLoader();
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, .1, 1000);
        this.el.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.camera.position.set(this.rotX, this.rotY, this.distance);
        this.controls.update();

        this.cubeP = null;
        this.cubeS = null;

        // Resize everything
        this.resize(options.width ?? 200, options.height ?? 200);        
    }

    async init(callback) {
        // Create face textures
        this.textureFacesLoaded = await this._createFacesFromTextureURL(this.textureURL);

        // Create primary layer
        const geometryP = new THREE.BoxGeometry();
        const materialsP = [
            new THREE.MeshBasicMaterial({map: this.textureFacesLoaded.primary.right, transparent: true}),
            new THREE.MeshBasicMaterial({map: this.textureFacesLoaded.primary.left, transparent: true}),
            new THREE.MeshBasicMaterial({map: this.textureFacesLoaded.primary.top, transparent: true}),
            new THREE.MeshBasicMaterial({map: this.textureFacesLoaded.primary.bottom, transparent: true}),
            new THREE.MeshBasicMaterial({map: this.textureFacesLoaded.primary.front, transparent: true}),
            new THREE.MeshBasicMaterial({map: this.textureFacesLoaded.primary.back, transparent: true}),
        ];
        this.cubeP = new THREE.Mesh(geometryP, materialsP);
        this.scene.add(this.cubeP);

        // Create secundary layer
        const geometryS = new THREE.BoxGeometry();
        const materialsS = [
            new THREE.MeshBasicMaterial({map: this.textureFacesLoaded.secundary.right, transparent: true}),
            new THREE.MeshBasicMaterial({map: this.textureFacesLoaded.secundary.left, transparent: true}),
            new THREE.MeshBasicMaterial({map: this.textureFacesLoaded.secundary.top, transparent: true}),
            new THREE.MeshBasicMaterial({map: this.textureFacesLoaded.secundary.bottom, transparent: true}),
            new THREE.MeshBasicMaterial({map: this.textureFacesLoaded.secundary.front, transparent: true}),
            new THREE.MeshBasicMaterial({map: this.textureFacesLoaded.secundary.back, transparent: true}),
        ];
        this.cubeS = new THREE.Mesh(geometryS, materialsS);
        this.cubeS.scale.set(1.1, 1.1, 1.1);
        this.scene.add(this.cubeS);

        // Render
        this.render();

        // Callback
        if (callback) callback.bind(this)();
    }

    disposeScene() {
        // Return if the scene doesn't exist and is thus not disposable
        if (!this.cubeP) return;

        // Dispose primary cube
        this.scene.remove(this.cubeP)
        this.cubeP.geometry.dispose();
        for (let material of this.cubeP.material) {
            material.map.dispose();
            material.dispose();
        };
        this.cubeP = undefined;

        // Dispose secundary cube
        this.scene.remove(this.cubeS)
        this.cubeS.geometry.dispose();
        for (let material of this.cubeS.material) {
            material.map.dispose();
            material.dispose();
        };
        this.cubeS = undefined;

        // Dispose textures
        for (let layer of Object.values(this.textureFacesLoaded)) for (let face of Object.values(layer)) face.dispose();
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        
        this.el.style.width = this.width + 'px';
        this.el.style.height = this.height + 'px';
        
        this.renderer.setSize(this.width, this.height)
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    setParent(el) {
        el.appendChild(this.el);
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
        this.scene.background = new THREE.Color(color);
    }

    setPrimaryVisibility(isPrimaryVisible) {
        this.isPrimaryVisible = isPrimaryVisible;
        this.cubeP.visible = isPrimaryVisible;
    }
    setSecundaryVisibility(isSecundaryVisible) {
        this.isSecundaryVisible = isSecundaryVisible;
        this.cubeS.visible = isSecundaryVisible;
    }

    async setTextureFromURL(url) {
        // Dispose of subdivided textures, main texture and subdivision materials
        this.disposeScene();

        // Set new texture URL
        this.textureURL = url;

        // Re-initialise scene
        this.init();
    }

    _createFacesFromTextureURL = async url => new Promise( resolve => {
        // Set return variable
        let textureFacesLoaded = {};

        // Initialise canvas to subdivide the texture
        let cv = document.createElement('canvas');
        let ctx = cv.getContext('2d');

        // Initialise image
        let texture = new Image();
        texture.crossOrigin = "anonymous";
        texture.onload = () => {
            // Subdivision map (tells where the face is located on the texture)
            const SUBDIVMAP = {
                primary: {
                    front: {
                        top: 1,
                        left: 1
                    },
                    left: {
                        top: 1,
                        left: 0
                    },
                    right: {
                        top: 1,
                        left: 2
                    },
                    back: {
                        top: 1,
                        left: 3
                    },
                    top: {
                        top: 0,
                        left: 1
                    },
                    bottom: {
                        top: 0,
                        left: 2
                    }
                },
                secundary: {
                    front: {
                        top: 1,
                        left: 5
                    },
                    left: {
                        top: 1,
                        left: 4
                    },
                    right: {
                        top: 1,
                        left: 6
                    },
                    back: {
                        top: 1,
                        left: 7 
                    },
                    top: {
                        top: 0,
                        left: 5
                    },
                    bottom: {
                        top: 0,
                        left: 6
                    }
                }
            }

            // Subdivision multiplier
            const SUBDIVMULT = texture.width / 8;

            // Set canvas size
            cv.width = SUBDIVMULT;
            cv.height = SUBDIVMULT;

            // For every layer, save every face
            for (let [layerName, layer] of Object.entries(SUBDIVMAP)) {
                textureFacesLoaded[layerName] = {};
                for (let [faceName, faceLoc] of Object.entries(layer)) {
                    // Draw subimage to canvas
                    ctx.clearRect(0, 0, SUBDIVMULT, SUBDIVMULT);
                    ctx.drawImage(texture, faceLoc.left * SUBDIVMULT, faceLoc.top * SUBDIVMULT, SUBDIVMULT, SUBDIVMULT, 0, 0, SUBDIVMULT, SUBDIVMULT);
                    // Save data url of canvas
                    let dataURL = cv.toDataURL('image/png');
                    // Load texture from data url
                    let subtexture = this.loader.load(dataURL);
                    // Apply scaling filter
                    subtexture.magFilter = THREE.NearestFilter;
                    // Save texture
                    textureFacesLoaded[layerName][faceName] = subtexture;
                }
            }

            // Resolve
            resolve(textureFacesLoaded);
        };
        texture.onerror = () => {
            console.error(`Could not load image at '${url}'`);
        }
        texture.src = url;
    });

    render() {
        this.renderer.render( this.scene, this.camera );
    }
}
//export default HeadCanvas;