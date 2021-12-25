// Create head canvas
const CANVAS = new HeadCanvas({
    textureURL: 'img/grian.png',
    width: 350,
    height: 350,
    distance: 2.5,
    backgroundColor: 0xeeeeee
});
CANVAS.setParent(document.getElementById('putCanvasHere'));
CANVAS.init(() => {
    // == Elements ==========================
    const $textureMethod = document.getElementById('textureMethod');
    const $uploadSkinTab = document.getElementById('uploadSkinTab');
    const $uuidTab = document.getElementById('uuidTab');

    const $uploadSkin = document.getElementById('uploadSkin');
    const $uuid = document.getElementById('uuid');

    const $uuidSet = document.getElementById('uuidSet');
    const $getUUIDOfPlayer = document.getElementById('getUUIDOfPlayer');

    const $enablePrimaryLayer = document.getElementById('enablePrimaryLayer');
    const $enableSecundaryLayer = document.getElementById('enableSecundaryLayer');
    const $enableAnimation = document.getElementById('enableAnimation');
    const $backgroundColor = document.getElementById('backgroundColor');


    // == URL Params ==========================
    const urlParams = new URLSearchParams(window.location.search);

    let uuidParam = urlParams.get('uuid');
    let isPrimaryEnabledParam = urlParams.get('isPrimaryEnabled');
    let isSecundaryEnabledParam = urlParams.get('isSecundaryEnabled');
    let isAnimationEnabledParam = urlParams.get('isAnimationEnabled');
    let backgroundColorParam = urlParams.get('backgroundColor');

    if (uuidParam) {
        $uuid.value = uuidParam;
        $textureMethod.value = 'uuid';
        uuidInput();
    }
    // I know the following code looks ugly...
    if (typeof isPrimaryEnabledParam == 'string' && isPrimaryEnabledParam.toLowerCase() == 'true') $enablePrimaryLayer.checked = true;
    if (typeof isPrimaryEnabledParam == 'string' && isPrimaryEnabledParam.toLowerCase() == 'false') $enablePrimaryLayer.checked = false;
    if (typeof isSecundaryEnabledParam == 'string' && isSecundaryEnabledParam.toLowerCase() == 'true') $enableSecundaryLayer.checked = true;
    if (typeof isSecundaryEnabledParam == 'string' && isSecundaryEnabledParam.toLowerCase() == 'false') $enableSecundaryLayer.checked = false;
    if (typeof isAnimationEnabledParam == 'string' && isAnimationEnabledParam.toLowerCase() == 'true') $enableAnimation.checked = true;
    if (typeof isAnimationEnabledParam == 'string' && isAnimationEnabledParam.toLowerCase() == 'false') $enableAnimation.checked = false;
    $backgroundColor.value = /^\#[\da-f]{6}$/i.test(backgroundColorParam) ? backgroundColorParam : '#eeeeee';

    function setURLParam(param, val) {
        urlParams.set(param, val);
        let newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + urlParams.toString();
        window.history.pushState({path: newUrl}, '', newUrl);
    }



    // == Animation function ==========================
    let isAnimationEnabled = $enableAnimation.checked;
    function animate() {
        requestAnimationFrame( animate );
        if (isAnimationEnabled && CANVAS.cubeP) {
            CANVAS.cubeP.rotation.y += .005;
            CANVAS.cubeS.rotation.y += .005;
            CANVAS.controls.update();
        }
        CANVAS.render();
    }
    animate();



    // == Settings ==========================
    // Primary layer
    function primaryLayerEnabledChanged() {
        CANVAS.setPrimaryVisibility($enablePrimaryLayer.checked);
        setURLParam('isPrimaryEnabled', $enablePrimaryLayer.checked.toString());
    }
    primaryLayerEnabledChanged();
    $enablePrimaryLayer.addEventListener('change', primaryLayerEnabledChanged);

    // Secundary layer
    function secundaryLayerEnabledChanged() {
        CANVAS.setSecundaryVisibility($enableSecundaryLayer.checked);
        setURLParam('isSecundaryEnabled', $enableSecundaryLayer.checked.toString());
    }
    secundaryLayerEnabledChanged();
    $enableSecundaryLayer.addEventListener('change', secundaryLayerEnabledChanged);

    // Animation
    function animationEnabledChanged() {
        isAnimationEnabled = $enableAnimation.checked;
        setURLParam('isAnimationEnabled', $enableAnimation.checked.toString());
    }
    animationEnabledChanged();
    $enableAnimation.addEventListener('change', animationEnabledChanged);

    // Background color
    function backgroundColorChanged() {
        CANVAS.setBackgroundColor(parseInt(`0x${$backgroundColor.value.substr(1)}`));
        setURLParam('backgroundColor', $backgroundColor.value);
    }
    $backgroundColor.addEventListener('change', backgroundColorChanged);
    backgroundColorChanged();



    // == Inputs ==========================
    function textureMethodChanged() {
        $uploadSkinTab.classList.add('hidden');
        $uuidTab.classList.add('hidden');
        let textureMethod = $textureMethod.value;
        if (textureMethod == 'file') {
            $uploadSkinTab.classList.remove('hidden');
            if ($uploadSkin.files[0]) uploadedSkin();
        } else {
            $uuidTab.classList.remove('hidden');
        }
    }

    $textureMethod.addEventListener('change', textureMethodChanged);
    textureMethodChanged();

    // File upload
    async function uploadedSkin() {
        let file = $uploadSkin.files[0];
        let base64URL = await getBase64FromFile(file);
        CANVAS.setTextureFromURL(base64URL);
    }
    $uploadSkin.addEventListener('change', uploadedSkin);

    async function getBase64FromFile(file) {
        return new Promise( resolve => {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.onerror = function (error) {
                console.error('Could not load file: ', error);
                resolve(null);
            };
        });
    }

    // UUID input
    function uuidInput() {
        let uuid = $uuid.value.replaceAll('-', '');
        CANVAS.setTextureFromURL('https://crafatar.com/skins/' + uuid);
    }
    $uuidSet.addEventListener('click', uuidInput);

    $getUUIDOfPlayer.addEventListener('click', () => {
        let playerName = window.prompt('Type the name of a player...');
        if (playerName == '' || playerName == null) return;
        let apiWindow = window.open(`https://api.mojang.com/users/profiles/minecraft/${playerName}`);
        let uuid = window.prompt('Get the UUID from the page (the long string of characters next to \'id\') and paste it in this dialog box');
        if (uuid == '' || uuid == null) return;
        if (apiWindow) apiWindow.close();
        CANVAS.setTextureFromURL('https://crafatar.com/skins/' + uuid);
    });
});
