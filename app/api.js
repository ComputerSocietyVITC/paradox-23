export const BACKEND = "https://backend-paradox.ieeecsvitc.com"

export async function getQuestion() {
    const jwt = localStorage.getItem("jwt");
    const url = `${BACKEND}/question`;
    const raw = await fetch(url, { headers: { Authorization: `Bearer ${jwt}` } });
    return {
        raw, ...(await raw.json())
    }
}

export async function postAnswer(answer) {
    const jwt = localStorage.getItem("jwt");
    const url = `${BACKEND}/answer`;
    const raw = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ answer }),
    });
    return {
        raw, ...(await raw.json())
    }
}

export async function getUserData() {
    const jwt = localStorage.getItem("jwt");
    const url = `${BACKEND}/me`;
    const raw = await fetch(url, { headers: { Authorization: `Bearer ${jwt}` } });
    return {
        raw, ...(await raw.json())
    }
}