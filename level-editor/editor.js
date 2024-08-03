import { ListStore } from 'https://esm.sh/campfire.js@2.4.1';
import { CodeJar } from 'https://esm.sh/codejar'
import { message } from '../app/game/src/alert.js';

const scene = {};
const mouse = {
    x: 0, y: 0, middle: false, left: false, right: false
}

function filePicker({ accept = null, many = false }) {
    return new Promise(async resolve => {
        const fileInputElement = document.createElement('input');
        fileInputElement.type = 'file';
        fileInputElement.id = 'filepicker-input';
        if (accept) fileInputElement.accept = accept;
        fileInputElement.addEventListener('change', () => {
            const file = fileInputElement.files[0];
            document.body.removeChild(fileInputElement);
            resolve(file);
        });
        document.body.appendChild(fileInputElement);
        setTimeout(_ => {
            fileInputElement.click();
            const onFocus = () => {
                window.removeEventListener('focus', onFocus);
                document.body.addEventListener('mousemove', onMouseMove);
            };
            const onMouseMove = () => {
                document.body.removeEventListener('mousemove', onMouseMove);
                if (!fileInputElement.files.length) {
                    document.body.removeChild(fileInputElement);
                    resolve(null);
                }
            }
            window.addEventListener('focus', onFocus);
        }, 0);
    });
}

const highlightJSON = div => {
    let code = div.textContent;
    code = code.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="json-string">"$1"</span>');
    code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="json-number">$1</span>');
    code = code.replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>');
    code = code.replace(/\bnull\b/g, '<span class="json-null">null</span>');
    code = code.replace(/"([^"\\]*(\\.[^"\\]*)*)"\s*:/g, '<span class="json-key">"$1"</span>:');
    div.innerHTML = code;
};

const miscTa = document.querySelector('#entity-misc');
miscTa.value = "{}";

const jar = CodeJar(document.querySelector('#entity-misc-editor'), highlightJSON, { tab: '  ' });
jar.updateCode('{}');
jar.onUpdate(code => { miscTa.value = code; })

const types = new ListStore([]);
const entities = new ListStore([]);

const addedTypes = document.querySelector('#added-types');
const addedEntities = document.querySelector("#added-entities");

function setEntity(data) {
    const { action, pos, ...misc } = data;
    if (misc.extends) delete misc.extends;

    document.getElementById('entity-extends').value = data.extends || '';
    document.getElementById('entity-action').value = action || '';
    document.getElementById('entity-pos').value = JSON.stringify(data.pos || { x: 0, y: 0 });
    jar.updateCode(miscTa.value = JSON.stringify(misc));
}

const createListItem = (typeToAdd, val, store, idx) => {
    const attr = `data-${typeToAdd}-idx`;
    const div = document.createElement('div');
    div.setAttribute(attr, idx);

    const child = document.createElement('pre');
    child.innerHTML = JSON.stringify(val, null, 2);

    if (typeToAdd === 'entity') {
        child.onclick = () => {
            document.querySelector('div[data-tabname="Entities"]').parentElement.scrollTop = 0;
            console.log(val);
            setEntity(val);
            store.remove(parseInt(div.getAttribute(attr)));
        }
    }

    const a = document.createElement('a');
    a.href = 'javascript:void(0)'
    a.innerHTML = 'Remove';
    a.className = 'remove-pre-link';
    a.onclick = () => store.remove(parseInt(div.getAttribute(attr)));

    highlightJSON(child);
    div.append(child, a);
    return div;
}

const entityExtendsList = document.querySelector('#entity-extends-list');

types.on("push", ({ value, idx }) => {
    const div = createListItem('type', value, types, idx);
    addedTypes.appendChild(div);
    const opt = document.createElement('option');
    opt.value = value.type;
    opt.setAttribute('data-etype-idx', idx);
    entityExtendsList.appendChild(opt);
})

entities.on("push", ({ value, idx }) => {
    const div = createListItem('entity', value, entities, idx);
    addedEntities.appendChild(div);
})

types.on("remove", ({ idx }) => {
    addedTypes.removeChild(addedTypes.querySelector(`div[data-type-idx="${idx}"]`));
    addedTypes.querySelectorAll('div[data-type-idx]').forEach((elt, i) => {
        elt.setAttribute('data-type-idx', i);
    })

    entityExtendsList.removeChild(entityExtendsList.querySelector(`option[data-etype-idx="${idx}"]`));
    entityExtendsList.querySelectorAll('option[data-type-idx]').forEach((elt, i) => {
        elt.setAttribute('data-etype-idx', i);
    })
})

entities.on('remove', ({ value, idx }) => {
    addedEntities.removeChild(addedEntities.querySelector(`div[data-entity-idx="${idx}"]`));
    addedEntities.querySelectorAll('div[data-entity-idx]').forEach((elt, i) => {
        elt.setAttribute('data-entity-idx', i);
    })
})

window.addEventListener('DOMContentLoaded', async () => {
    let currentTab = '';
    const getTab = (name) => {
        return [
            document.querySelector(`button.tab[data-tabname=${name}]`),
            document.querySelector(`div[data-tabname="${name}"]`)
        ]
    }

    const canvas = document.querySelector('#canvas');
    const entityPositionCheckbox = document.querySelector('#entity-position-checkbox');
    const entityPosField = document.querySelector('#entity-pos');
    const playerPositionCheckbox = document.querySelector('#player-position-checkbox');
    const playerPosField = document.querySelector('#player-pos');

    const getCvsMouseXy = (e) => {
        const rect = e.target.getBoundingClientRect();
        return {
            // subtract border width because of box-sizing border box
            x: Math.round(e.clientX - rect.left - 2),
            y: Math.round(e.clientY - rect.top - 2)
        }
    }

    let currentlyDragging = null;

    canvas.oncontextmenu = (e) => e.preventDefault();
    canvas.onmousemove = (e) => {
        const pos = getCvsMouseXy(e);
        mouse.x = pos.x;
        mouse.y = pos.y;
        if (entityPositionCheckbox.checked) {
            const extended = document.querySelector('#entity-extends').value;
            const type = types.value.find(itm => itm.type === extended);
            currentlyDragging = type;
        }
        else {
            currentlyDragging = null;
        }
    }

    canvas.onclick = (e) => {
        const stringified = JSON.stringify(getCvsMouseXy(e));
        console.log(stringified);
        if (entityPositionCheckbox.checked) {
            entityPosField.value = stringified;
            entityPositionCheckbox.checked = false;
        }
        if (playerPositionCheckbox.checked) {
            playerPosField.value = stringified;
            playerPositionCheckbox.checked = false;
        }
    }

    const handler = (val) => (e) => {
        mouse[
            { 1: 'left', 2: 'middle', 3: 'right' }[e.which]
        ] = val;
        console.log(mouse);
    }

    canvas.onmousedown = handler(true);
    canvas.onmouseup = handler(false);

    const ctx = canvas.getContext('2d');

    document.querySelectorAll('.tab').forEach(item => {
        const tabname = item.getAttribute('data-tabname');
        const body = document.querySelector(`div[data-tabname="${tabname}"]`);
        body.style.display = 'none';

        item.onclick = () => {
            if (currentTab) {
                const [oldBtn, oldBody] = getTab(currentTab);
                oldBtn.classList.remove('active');
                oldBody.style.display = 'none';
            }

            currentTab = tabname;
            item.classList.add('active');
            body.style.display = 'block';
        }
    })

    document.querySelectorAll('.tab:first-child').forEach(elt => elt.click());
    document.body.classList.remove('loading');

    const currentFiles = new Set();
    const currentSprites = new Set();
    const assetUploadForm = document.querySelector('#upload-files');
    const setBgForm = document.querySelector('#set-background');
    const bgPicker = setBgForm.querySelector('#background-picker');
    const imageInput = document.querySelector('#image-picker');
    const previews = document.querySelector('#asset-previews');
    const addTypeForm = document.querySelector('#add-type');
    const addEntityForm = document.querySelector('#add-entity');
    const spritePicker = addTypeForm.querySelector('#type-sprite');
    const playerSpritePicker = document.querySelector('#player-sprite');
    const modifyPlayerForm = document.querySelector('#modify-player');
    const importBtn = document.querySelector('#finish-buttons #import');
    const exportBtn = document.querySelector('#finish-buttons #export');

    assetUploadForm.onsubmit = (e) => {
        e.preventDefault();
        for (const file of imageInput.files) {
            if (currentFiles.has(file)) continue;
            currentFiles.add(file);
        }
        updateFiles();
    }

    const updateFiles = () => {
        previews.innerHTML = '';
        bgPicker.innerHTML = '';
        spritePicker.innerHTML = '';
        playerSpritePicker.innerHTML = '';

        for (const file of currentFiles) {
            const tmpl = document.querySelector('#asset-template');
            const newNode = tmpl.content.cloneNode(true);
            const img = newNode.querySelector('img');
            img.src = URL.createObjectURL(file);
            img.setAttribute('data-filename', file.name);
            newNode.querySelector('.asset-label').innerHTML = file.name;
            previews.appendChild(newNode);

            const bgOption = document.createElement('option');
            bgOption.innerHTML = file.name;
            bgPicker.appendChild(bgOption);

            if (file.name.startsWith('ss_')) {
                let matches = file.name.match(/ss_(\d+)_(\w+)_(\w+)?.png/);
                if (!matches) matches = file.name.match(/ss_(\d+)_(\w+)(_\w+)?.png/);
                if (currentSprites.has(matches[2])) continue;
                img.setAttribute('data-preview-sprite', matches[2]);
                const spriteOption = document.createElement('option');
                currentSprites.add(matches[2]);
                spriteOption.innerHTML = matches[2];
                spritePicker.appendChild(spriteOption);
                playerSpritePicker.appendChild(spriteOption.cloneNode(true));
            }
        }
    }

    const getImg = (name) => document.querySelector(`img[data-filename="${name}"]`);
    const getPreviewSprite = (name) => document.querySelector(`[data-preview-sprite="${name}"]`);

    const setBg = () => {
        const img = getImg(bgPicker.value);
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    }

    setBgForm.onsubmit = async (e) => {
        e.preventDefault();
        scene.bg = bgPicker.value;
    }

    addTypeForm.onsubmit = (e) => {
        e.preventDefault();
        const data = new FormData(addTypeForm);
        const obj = Object.fromEntries(data.entries());
        if (obj.height) obj.height = parseInt(obj.height);
        if (obj.width) obj.width = parseInt(obj.width);
        if (obj.isAnimated) obj.isAnimated = obj.isAnimated === 'on';
        types.push(obj);
    }

    addEntityForm.onsubmit = async (e) => {
        e.preventDefault();
        const data = new FormData(addEntityForm);
        let obj = Object.fromEntries(data.entries());
        if (obj.pos) obj.pos = JSON.parse(obj.pos);
        else obj.pos = { x: 0, y: 0 };
        for (const [key, val] of Object.entries(obj)) {
            if (val.toString().trim() === '') {
                delete obj[key];
            }
        }
        if (obj.misc) {
            console.log(obj.misc);
            console.log(obj);
            Object.assign(obj, JSON.parse(obj.misc));
            delete obj.misc;
            console.log(obj);
        }
        entities.push(obj);
        setEntity({
            action: "",
            pos: "",
        });
    }

    modifyPlayerForm.onsubmit = async (e) => {
        e.preventDefault();
        const data = new FormData(modifyPlayerForm);
        let obj = Object.fromEntries(data.entries());
        if (obj.pos) obj.pos = JSON.parse(obj.pos);
        if (obj.height) obj.height = parseInt(obj.height);
        if (obj.width) obj.width = parseInt(obj.width);
        scene.player = obj;
    }

    function groupBy(array, key) {
        return array.reduce((dictionary, obj) => {
            const value = obj[key];
            if (!dictionary[value]) {
                dictionary[value] = obj;
            }
            return dictionary;
        }, {});
    }

    const exp = async () => {
        const res = JSON.parse(JSON.stringify(scene));
        res.entities = entities.value.map(e => e);
        res.types = groupBy(types.value, 'type');
        return res;
    }

    let lastDraw = new Date().valueOf();
    const draw = async () => {
        if (new Date().valueOf() - lastDraw < 20) {
            return setTimeout(draw, 50);
        }
        else {
            lastDraw = new Date().valueOf();
        }
        const script = await exp();
        if (!script) return;
        const { bg, entities, types } = script;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (bg && getImg(bg)) {
            canvas.width = getImg(bg).naturalWidth;
            canvas.height = getImg(bg).naturalHeight;
            ctx.drawImage(getImg(bg), 0, 0);
        }

        ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.fillText(`${mouse.x}, ${mouse.y}`, 0, 0);

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        if (currentlyDragging) {
            ctx.strokeRect(
                mouse.x,
                mouse.y,
                currentlyDragging.width,
                currentlyDragging.height
            );
        }

        const hydratedEntities = entities.map(entity => {
            const { extends: extendsType, pos, ...rest } = entity;
            const extendedType = types[extendsType];

            return { ...extendedType, pos, ...rest, type: extendedType?.etype };
        });

        for (const entity of hydratedEntities) {
            const sprite = getPreviewSprite(entity.sprite);
            if (!sprite) {
                ctx.fillStyle = entity.color || 'red';
                ctx.fillRect(entity.pos.x, entity.pos.y, entity.width, entity.height);
                continue;
            }
            ctx.drawImage(sprite, entity.pos.x, entity.pos.y);
        }

        if (script.player) {
            if (playerPositionCheckbox.checked) {
                ctx.strokeRect(
                    mouse.x,
                    mouse.y,
                    script.player.width,
                    script.player.height
                );
            }

            if (script.player.sprite && getPreviewSprite(script.player.sprite)) {
                ctx.drawImage(getPreviewSprite(script.player.sprite), script.player.pos.x, script.player.pos.y);
            }
            else {
                ctx.fillStyle = script.player.color || 'yellow';
                ctx.fillRect(script.player.pos.x, script.player.pos.y, script.player.width, script.player.height);
            }
        }

        draw();
    }

    importBtn.onclick = async () => {
        if (!currentFiles.size) return message({ text: "Please upload some assets first." });
        const file = await filePicker({ accept: 'text/plain,application/json' });
        if (!file) return message({ text: "No file supplied." });
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = async (val) => {
            const json = JSON.parse(reader.result);
            json.entities?.forEach(entity => {
                console.log(entity);
                entities.push(entity)
            });
            Object.values(json.types).forEach(type => types.push(type));
            scene.bg = json.bg;
            scene.player = json.player;
            playerPosField.value = JSON.stringify(json.player.pos);
            playerSpritePicker.value = json.player.sprite;
            document.getElementById('player-width').value = json.player.width;
            document.getElementById('player-height').value = json.player.height;
            bgPicker.value = json.bg;
        }
    }

    exportBtn.onclick = async () => {
        const anchor = document.createElement('a');
        anchor.download = 'scene.json';
        anchor.href = `data:text/plain;charset=utf-8,${encodeURIComponent(
            JSON.stringify(await exp(), null, 2))
            }`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    }
    await draw();
})