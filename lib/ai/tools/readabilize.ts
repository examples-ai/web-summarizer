import { PuppeteerBrowser } from '@examples-ai/puppeteer-browser-serverless';
import { Readability } from '@paoramen/cheer-reader';
import { tool } from 'ai';
import { load } from 'cheerio';
import TurndownService from 'turndown';
import { z } from 'zod';

const schema = z.object({
  url: z.string().describe('The URL of the webpage to summarize.'),
});

function create() {
  return tool({
    description: 'Make readability the content of a given URL',
    inputSchema: schema,
    async execute({ url }) {
      const browser = new PuppeteerBrowser();
      await browser.launch();

      try {
        const page = await browser.newPage();
        await page.goto(url);

        const html = await page.html();
        await page.close();

        if (!html) {
          throw new Error('Failed to retrieve content from the URL.');
        }

        const { content } = new Readability(load(html)).parse();
        if (!content) {
          throw new Error('No readable content found at the provided URL.');
        }

        const turndownService = new TurndownService({
          headingStyle: 'atx',
          hr: '---',
          bulletListMarker: '-',
          codeBlockStyle: 'fenced',
          fence: '```',
        });

        return {
          content: turndownService.turndown(content),
        };
      } catch (error) {
        console.error('Error in summarizer tool:', error);
        return {
          content: error instanceof Error ? error.message : 'An unknown error occurred.',
        };
      } finally {
        await browser.browser?.close();
      }
    },
  });
}

export default {
  create,
};
