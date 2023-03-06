"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actions = void 0;
const axios_1 = require("axios");
// the extension keeps the message history in memory
const messages = [];
// the last chat date
let lastChat = new Date();
// reset the history
function reset() {
    print("Resetting chat history");
    messages.length = 0;
    return null;
}
// get the content of the last `n` messages from the chat, trimmed and separated by double newlines
function getTranscript(n) {
    return messages.slice(-n).map((m) => m.content.trim()).join("\n\n");
}
// the main chat action
const chat = async (input, options) => {
    const openai = axios_1.default.create({
        baseURL: "https://api.openai.com/v1",
        headers: { Authorization: `Bearer ${options.apikey}` },
    });
    // if the last chat was long enough ago, reset the history
    if (options.resetMinutes.length > 0) {
        const resetInterval = parseInt(options.resetMinutes) * 1000 * 60;
        if (new Date().getTime() - lastChat.getTime() > resetInterval) {
            reset();
        }
    }
    // add the new message to the history
    messages.push({ role: "user", content: input.text });
    // send the whole message history to OpenAI
    const { data } = await openai.post("chat/completions", {
        model: "gpt-3.5-turbo",
        messages,
    });
    // add the response to the history
    messages.push(data.choices[0].message);
    lastChat = new Date();
    // if holding shift, copy just the response. else, paste the last input and response.
    if (popclip.modifiers.shift) {
        popclip.pasteText(getTranscript(1));
    }
    else {
        popclip.showText(getTranscript(2));
    }
    return null;
};

const translate = async (input, options) => {
    const openai = axios_1.default.create({
        baseURL: "https://api.openai.com/v1",
        headers: { Authorization: `Bearer ${options.apikey}` },
    });
    // send question to OpenAI
    const message = `${options.translatePrompt} ${input.text}`;
    const { data } = await openai.post("chat/completions", {
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: message}]
    });
    // add the response to the history
    const resp = data.choices[0].message.content.trim();

    if (popclip.modifiers.shift) {
        popclip.pasteText(resp);
    }
    else {
        popclip.showText(resp);
    }
    return null;
}

const rewrite = async (input, options) => {
    const openai = axios_1.default.create({
        baseURL: "https://api.openai.com/v1",
        headers: { Authorization: `Bearer ${options.apikey}` },
    });
    // send question to OpenAI
    const message = `${options.rewritePrompt} ${input.text}`;
    const { data } = await openai.post("chat/completions", {
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: message}]
    });
    // add the response to the history
    const resp = data.choices[0].message.content.trim();

    if (popclip.modifiers.shift) {
        popclip.showText(resp);
    }
    else {
        popclip.pasteText(resp);
    }
    return null;
}

const summrize = async (input, options) => {
    const openai = axios_1.default.create({
        baseURL: "https://api.openai.com/v1",
        headers: { Authorization: `Bearer ${options.apikey}` },
    });
    // send question to OpenAI
    const message = `${options.summrizePrompt} ${input.text}`;
    const { data } = await openai.post("chat/completions", {
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: message}]
    });
    // add the response to the history
    const resp = data.choices[0].message.content.trim();

    if (popclip.modifiers.shift) {
        popclip.showText(resp);
    }
    else {
        popclip.pasteText(resp);
    }
    return null;
}

// export the actions
exports.actions = [{
        title: "ChatGPT: Chat",
        code: chat,
    }, {
        title: "ChatGPT: Translate",
        code: translate,
        icon: "T"
    }, {
        title: "ChatGPT: Rewrite",
        code: rewrite,
        icon: "R"
    }, {
        title: "ChatGPT: Summrize",
        code: summrize,
        icon: "S"
    },
    {
        title: "ChatGPT: Reset",
        icon: "broom-icon.svg",
        requirements: ["option-showReset=1"],
        after: "show-status",
        code: reset,
    }];
