// AI document writer: LangChain prompt -> Mistral -> plain text, streamed
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import env from "../config/env.config.js";

export const aiOn = () => !!env.MISTRAL_API_KEY;

// The doc format is the tiny markdown in client/src/shared/lib/markdown.ts; anything richer would show up as raw symbols.
const SYSTEM = `You write business documents for codedemons, a two-person web design and development studio in India (founders Bhavya and Sameer, hello@codedemons.in).
Documents are read and e-signed by the client in their portal, so they must be clear, specific, friendly but professional, and legally sensible for India.

Output ONLY the document, in this exact format and nothing else:
- First line: "# " followed by the document title.
- Section headings start with "## ". Number them ("## 1. Scope") for contracts and agreements.
- Bullet points start with "- ".
- Everything else is plain paragraphs, separated by a blank line.
Never use bold, italics, tables, numbered lists, code fences, links, emojis or a preamble like "Here is".
Money is in Indian rupees with the ₹ sign. Never invent prices, dates or numbers you were not given: write ______ as a blank to fill in.
Use the client's real name, company and project details wherever they fit. Do not add signature lines; the portal adds signature boxes.`;

const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM],
    ["human", `Document type: {kind}
Today: {today}
Client: {client}
Project: {project}

{task}`],
]);

export type WriteInput = {
    kind: string; client: string; project: string;
    instructions: string;
    // the current draft, when revising instead of writing from scratch
    draft?: string;
};

/** Streams the document text, chunk by chunk. */
export async function writeDoc(i: WriteInput) {
    const model = new ChatMistralAI({ apiKey: env.MISTRAL_API_KEY, model: env.MISTRAL_MODEL, temperature: 0.4, maxRetries: 1 });
    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const task = i.draft?.trim()
        ? `Revise the draft below. ${i.instructions || "Improve it."}\nKeep everything that is still right, and return the whole document.\n\nDRAFT:\n${i.draft}`
        : `Write the document. ${i.instructions || "Cover everything this kind of document normally needs, tailored to this client and project."}`;
    return chain.stream({
        kind: i.kind || "general business document",
        today: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
        client: i.client, project: i.project || "Not specified", task,
    });
}
