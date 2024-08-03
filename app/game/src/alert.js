import cf from 'https://esm.sh/campfire.js@2.4.1';

const maskStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.6)',
    width: '100vw',
    height: '100vh',
    padding: 0,
    margin: 0,
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000
}

const create = () => {
    document.querySelector('#alert-mask')?.remove();
    let mask = cf.insert(cf.nu('div#alert-mask', {
        style: maskStyle,
        raw: true,
        c: `<div id='cf-alert'>
        <div id='alert-header'></div>
        <div id='alert-body'></div>
        <div id='alert-footer'></div>
        </div>
        `
    }), { atEndOf: document.body });

    const header = mask.querySelector('#alert-header');
    const body = mask.querySelector('#alert-body');
    const footer = mask.querySelector('#alert-footer');

    return [header, body, footer, mask]
}

function fatal({ text, title = 'Error', safeBody = true }) {
    const [header, body] = create();
    return new Promise(() => {
        header.innerHTML = cf.escape(title);
        body.innerHTML = safeBody ? cf.escape(text) : text;
    })
}

function message({ text, title = 'Info', customLabel = 'OK', safeBody = true }) {
    const [header, body, footer, mask] = create();
    return new Promise((resolve, reject) => {
        try {
            header.innerHTML = cf.escape(title);
            body.innerHTML = safeBody ? cf.escape(text) : text;

            cf.insert(cf.nu('button#alert-ok', {
                on: {
                    click: (e) => {
                        resolve();
                        mask.remove();
                    }
                },
                c: customLabel
            }), { atEndOf: footer });
        }
        catch (e) {
            reject(e)
        }
    })
}

function input({ text, title = 'Input', safeBody = true, imgUrl = undefined }) {
    const [header, body, footer, mask] = create();
    return new Promise((resolve, reject) => {
        try {
            header.innerHTML = cf.escape(title);
            body.innerHTML = safeBody ? cf.escape(text) : text;

            if (imgUrl) {
                cf.insert(cf.nu('img#alert-image', {
                    misc: {
                        src: imgUrl
                    }
                }), { atEndOf: body });
            }

            const field = cf.insert(cf.nu('input#alert-input', {
                attrs: { type: 'text' }
            }), { atEndOf: body })

            cf.insert(cf.nu('button#alert-cancel', {
                on: {
                    click: (e) => {
                        reject('Cancelled by user');
                        mask.remove();
                    }
                },
                c: "Cancel"
            }), { atEndOf: footer });

            cf.insert(cf.nu('button#alert-ok', {
                on: {
                    click: (e) => {
                        resolve(field.value);
                        mask.remove();
                    }
                },
                c: "Submit"
            }), { atEndOf: footer });
        }
        catch (e) {
            reject(e)
        }
    })
}

function confirm({ text, customLabels, title = 'Are you sure?', safeBody = true }) {
    const [header, body, footer, mask] = create();
    return new Promise((resolve, reject) => {
        try {
            header.innerHTML = cf.escape(title);
            body.innerHTML = safeBody ? cf.escape(text) : text;

            cf.insert(cf.nu('button#alert-cancel', {
                on: {
                    click: (e) => {
                        resolve(false);
                        mask.remove();
                    }
                },
                c: customLabels?.no || "No"
            }), { atEndOf: footer });

            cf.insert(cf.nu('button#alert-ok', {
                on: {
                    click: (e) => {
                        resolve(true);
                        mask.remove();
                    }
                },
                c: customLabels?.yes || "Yes"
            }), { atEndOf: footer });

        }
        catch (e) {
            reject(e)
        }
    })
}

export default { input, message, confirm, fatal };
export { input, message, confirm, fatal };