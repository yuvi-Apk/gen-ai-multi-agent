
import OpenAI from "openai"
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from "@google/genai";

export const getResponseFromOpenAi = async (userInput: string) => {
    try {
        const openAiClient = new OpenAI();

        const response = await openAiClient.responses.create({
            model: "gpt-5-nano",
            input: userInput,
        });

        // console.log("Response of Open AI:", response)
        // console.log(response.output_text)

        return response.output_text;
    } catch (error) {
        console.error(`Error Arise while calling Openai Apis`, error)
        throw error;
    }
}

export const getResponseFromClaude = async (userInput: string) => {
    try {
        const anthropicClient = new Anthropic();

        const response = await anthropicClient.messages.create({
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: userInput
                }
            ],
            model: "claude-haiku-4-5"
        });

        // console.log("Response of Claude:", response)

        // for (const block of response.content) {
        //     if (block.type === "text") {
        //         console.log(block.text);
        //     }
        // }

        return response.content.filter((block) => block.type === "text").map((block) => block.text).join("\n");
    } catch (error) {
        console.error(`Error Arise while calling Anthropic Apis`, error)
        throw error;
    }
}

export const getResponseFromGemini = async (userInput: string) => {

    try {
        const googleGemini = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY!
        })

        const response = await googleGemini.interactions.create({
            model: "gemini-3.1-flash-lite",
            input: userInput,
        });

        // console.log("Response of Gemini ai:", response)
        return response.output_text;
    } catch (error) {
        console.error(`Error Arise while calling Gemini Apis`, error)
        throw error;
    }
}