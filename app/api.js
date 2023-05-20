export const BACKEND = "https://pserver-v1.ieeecsvitc.com";

async function talkToServer({ type, method = "GET", body }) {
    if (!type) throw new Error('Error: server communication attempted without type');
    const jwt = localStorage.getItem("jwt");
    const url = `${BACKEND}/${type}`;
    const raw = await fetch(url, {
        method,
        headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
    })
    return { raw, ...(await raw.json()) }
}

export function getQuestion() {
    return talkToServer({
        type: 'question',
    })
}

export function postAnswer(answer) {
    return talkToServer({
        type: 'answer',
        method: "POST",
        body: { answer }
    })
}

export function getUserData() {
    return talkToServer({
        type: 'me',
    });
}