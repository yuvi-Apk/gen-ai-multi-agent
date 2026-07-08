import "dotenv/config";
import { stdin, stdout } from "node:process";
import readline from "node:readline/promises";
import Anthropic from '@anthropic-ai/sdk';
import { getResponseFromClaude, getResponseFromGemini, getResponseFromOpenAi } from "./agents.ts";

// console.log("all setups completes", process.env.ANTHROPIC_API_KEY)

const rl = readline.createInterface({
    input: stdin,
    output: stdout,
});


const getBestResponse = async (userInput: string) => {

    const rawData = await Promise.allSettled([
        getResponseFromOpenAi(userInput),
        getResponseFromClaude(userInput),
        getResponseFromGemini(userInput)
    ]);

    // console.log(rawData)

    const combinedTextForVerified = rawData.filter((data) => data.status === "fulfilled").map((data, index) => `Response ${index + 1}:  ${data.value}`).join("\n")

    // console.log("OpenAI IN Verified state  :", openAiResponse);
    // console.log("Claude IN Verified state :", claudeResponse);
    // console.log("Gemini IN Verified state :", googleGeminiResponse);

    const anthropicClient = new Anthropic();

    const textToEvaluate = `User Query: ${userInput}
    candidate response:
        ${combinedTextForVerified}
        among all of the candidate responses which is the best fit according to the user query only return thats response as it is okay

        nothing else returns (while return remove these "Response 1 like")
    `

    const response = await anthropicClient.messages.create({
        max_tokens: 1024,
        stream: true,
        thinking: { type: "adaptive", display: "summarized" },
        messages: [
            {
                role: "user",
                content: textToEvaluate
            }
        ],
        model: "claude-haiku-4-5"
    });

    // for (const block of response.content) {
    //     if (block.type === "text") {
    //         console.log(block.text);
    //     }
    // }

      console.log(" \n \n Ai 🤖: ", )
    //1:- one type of stream
    for await (const event of response) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            process.stdout.write(event.delta.text);
        }
    }

    // for await (const event of response) {
    //     if (event.type === "content_block_delta") {
    //         if (event.delta.type === "thinking_delta") {
    //             process.stdout.write(event.delta.thinking);
    //         } else if (event.delta.type === "text_delta") {
    //             process.stdout.write(event.delta.text);
    //         }
    //     }
    // }

    // return response.content.filter((block) => block.type === "text").map((block) => block.text).join("\n");
}


    ; (async () => {
        while (true) {
            const userInput = await rl.question("You: ")

            if (userInput === "exit") {
                rl.close();
                break;
            }

           await getBestResponse(userInput);
        }

        console.log("How was your experience with multi-agent ai")
    })()