import { ExaSearchResults } from "@langchain/exa";
import Exa from "exa-js";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.EXASEARCH_API_KEY) {
  throw new Error("EXASEARCH_API_KEY is not set in .env");
}

const client = new Exa(process.env.EXASEARCH_API_KEY);

export const webSearch = new ExaSearchResults({
  client,
  searchArgs: {
    numResults: 5,
  },
});