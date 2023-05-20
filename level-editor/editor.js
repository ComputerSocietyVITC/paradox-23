import { ListStore } from 'https://esm.sh/campfire.js';
import { CodeJar } from 'https://esm.sh/codejar'
import { message } from '../app/game/src/alert.js';

const scene = {};

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

const createListItem = (type, val, store, idx) => {
    const attr = `data-${type}-idx`;
    const div = document.createElement('div');
    div.setAttribute(attr, idx);

    const child = document.createElement('pre');
    child.innerHTML = JSON.stringify(val, null, 2);

    const btn = document.createElement('button');
    btn.innerHTML = 'Remove';
    btn.onclick = () => store.remove(parseInt(div.getAttribute(attr)));

    highlightJSON(child);
    div.append(child, btn);
    return div;
}

types.on("push", ({ value, idx }) => {
    const div = createListItem('type', value, types, idx);
    addedTypes.appendChild(div);
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
})

entities.on('remove', ({ idx }) => {
    addedEntities.removeChild(addedEntities.querySelector(`div[data-entity-idx="${idx}"]`));
    addedEntities.querySelectorAll('div[data-entity-idx]').forEach((elt, i) => {
        elt.setAttribute('data-entity-idx', i);
    })
})

window.addEventListener('DOMContentLoaded', () => {
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

    canvas.onclick = (e) => {
        var rect = e.target.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left); //x position within the element.
        const y = Math.round(e.clientY - rect.top);  //y position within the element.
        const stringified = JSON.stringify({ x, y });
        if (entityPositionCheckbox.checked) {
            entityPosField.value = stringified;
        }
        if (playerPositionCheckbox.checked) {
            playerPosField.value = stringified;
        }
    }
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
    const previewBtn = document.querySelector('#finish-buttons #preview');
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

    setBgForm.onsubmit = (e) => {
        e.preventDefault();
        scene.bg = bgPicker.value;
        setBg();
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

    addEntityForm.onsubmit = (e) => {
        e.preventDefault();
        const data = new FormData(addEntityForm);
        let obj = Object.fromEntries(data.entries());
        if (obj.pos) obj.pos = JSON.parse(obj.pos);
        if (obj.misc) Object.assign(obj, JSON.parse(obj.misc));
        delete obj.misc;
        entities.push(obj);
    }

    modifyPlayerForm.onsubmit = (e) => {
        e.preventDefault();
        const data = new FormData(modifyPlayerForm);
        let obj = Object.fromEntries(data.entries());
        if (obj.pos) obj.pos = JSON.parse(obj.pos);
        if (obj.height) obj.height = parseInt(obj.height);
        if (obj.width) obj.width = parseInt(obj.width);
        scene.player = obj;
        ctx.drawImage(getPreviewSprite(scene.player.sprite), scene.player.pos.x, scene.player.pos.y);
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
        if (!scene.bg || !scene.player) {
            await message('Scene not configured.');
            return;
        }
        const res = JSON.parse(JSON.stringify(scene));
        res.entities = entities.value.map(e => e);
        res.types = groupBy(types.value, 'type');
        return res;
    }

    previewBtn.onclick = async () => {
        const script = await exp();
        const { bg, entities, types } = script;
        ctx.drawImage(getImg(bg), 0, 0);
        const hydratedEntities = entities.map(entity => {
            const { extends: extendsType, pos, ...rest } = entity;
            const extendedType = types[extendsType];

            return { ...extendedType, pos, ...rest, type: extendedType.etype };
        });

        for (const entity of hydratedEntities) {
            const sprite = getPreviewSprite(entity.sprite);
            if (!sprite) {
                console.error("Couldn't find sprite", entity.sprite);
                continue;
            }
            ctx.drawImage(sprite, entity.pos.x, entity.pos.y);
        }

        ctx.drawImage(getPreviewSprite(script.player.sprite), script.player.pos.x, script.player.pos.y);
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
})