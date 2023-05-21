import { questions } from "./questions.js";

export async function getQuestion(level) {
    return questions[level - 1];
}

export async function postAnswer({ level, answer }) {
    const correct = questions[level - 1].answer === answer;
    return { correct };
}
