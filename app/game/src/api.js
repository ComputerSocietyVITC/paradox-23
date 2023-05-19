export function getQuestion() {
    const jwt = localStorage.getItem("jwt");
    const url = "https://backend-paradox.ieeecsvitc.com/question";
    return fetch(url, { headers: { Authorization: `Bearer ${jwt}` } }).then(res => res.json());
}

export function postAnswer(answer) {
    const jwt = localStorage.getItem("jwt");
    const url = "https://backend-paradox.ieeecsvitc.com/answer";
    return fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ answer }),
    }).then(res => res.json());
}

export function getUserData() {
    const jwt = localStorage.getItem("jwt");
    const url = "https://backend-paradox.ieeecsvitc.com/me";
    return fetch(url, { headers: { Authorization: `Bearer ${jwt}` } }).then(res => res.json());
}