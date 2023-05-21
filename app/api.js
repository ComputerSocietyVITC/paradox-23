// export const BACKEND = "https://paradox.shantaram.xyz";
import { questions } from "./questions.js";

// async function talkToServer({ type, method = "GET", body }) {
//     if (!type) throw new Error("Error: server communication attempted without type");
//     const jwt = localStorage.getItem("jwt");
//     const url = `${BACKEND}/${type}`;
//     const raw = await fetch(url, {
//         method,
//         headers: {
//             Authorization: `Bearer ${jwt}`,
//             "Content-Type": "application/json",
//         },
//         body: body ? JSON.stringify(body) : undefined,
//     });
//     try {
//         return { raw, ...(await raw.json()) };
//     } catch (talkErr) {
//         console.error(talkErr);
//     }
// }

// export function getQuestion() {
//     return talkToServer({
//         type: 'question',
//     })
// }

// export function postAnswer(answer) {
//     return talkToServer({
//         type: 'answer',
//         method: "POST",
//         body: { answer }
//     })
// }

// export function getUserData() {
//     return talkToServer({
//         type: 'me',
//     });
// }

export async function getQuestion(level) {
    return questions[level - 1];
}

export async function postAnswer({ level, answer }) {
    const correct = questions[level - 1].answer === answer;
    return { correct };
}
