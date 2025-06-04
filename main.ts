import * as cheerio from 'cheerio';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { requestUrl } from 'obsidian';
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerEvent(this.app.workspace.on('editor-paste', this.handlePaste))
	}
	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	handlePaste = async (e: ClipboardEvent, editor: Editor) => {
		const url = e.clipboardData?.getData('text');
		if (url?.startsWith('http')) {
			const res = await requestUrl({ url: url, method: 'GET' });
			const $ = cheerio.load(res.text);
			const title = $('title').text();
			const cursor = editor.getCursor();
			const from = { line: cursor.line, ch: cursor.ch - url.length };
			const to = { line: cursor.line, ch: cursor.ch };
			// editor.replaceRange(`[${title}](${url})`, from, to);
			editor.replaceRange(`<a href="${url}">${title}</a>`, from, to);
		}
	}
}