import fs from "fs";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";

export async function parseContract(filePath) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const splitter = RecursiveCharacterTextSplitter.fromLanguage("sol", {
        chunkSize: 800,
        chunkOverlap: 100,
    });
    const chunks = await splitter.splitText(fileContent);
    return {fileContent, chunks};

}
