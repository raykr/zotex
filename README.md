# Zotex README

This is a Zotero Cite plugin that is used to conveniently reference and manage literature in Zotero within VSCode. It supports multiple file formats and can automatically import bib files (such as ref.bib).

## Features

### Supports multiple file formats
* Support markdown, pandoc, and LaTeX file insertion references.
* Support for multiple citation formats, such as pandoc's `[@citekey]`, LaTeX's `\cite{citekey}`, markdown footnotes `[^citekey]`, etc.
* Support inserting the content in the clipboard as a markdown hyperlink, for example [^wbndRgHX]: <keyContent>, where keyContent is the content in the clipboard and key is automatically generated.
* Open current cite item in Zotero.

### Automatically import bib files.
* You can automatically import bib files based on citekey without the need to export a batch of bib entries in advance, making it more flexible to use.

## Usage

### Add Citations in Latex/Pandoc.
* Activate via Command Palette (command + shift + P): Type "`Zotex: Add Citation`" and press enter.
* Select the item you want to cite in Zotero Citation Picker.
* The plugin will automatically select the appropriate citation format based on the file extension of the current document, such as `\cite{citekey}` for LaTeX and `[@citekey]` for Pandoc footnotes.

> Tip: This operation does not automatically import bib entries. If you need to automatically import bib entries, please use the following method.

### Insert citations and automatically import bib entries in Latex/Pandoc.
* Activate via Command Palette (command + shift + P): Type "`Zotex: Cite and Create Bibliography for Latex/Pandoc`" and press enter.

### Insert footnotes in Markdown.
* Activate via Command Palette (command + shift + P): Type "`Zotex: Cite and Create Bibliography for Markdown`" and press enter.

Example:
> [^andrychowicz2018hindsight][^andrychowicz2018hindsight]: Andrychowicz, M., Wolski, F., Ray, A., Schneider, J., Fong, R., Welinder, P., McGrew, B., Tobin, J., Abbeel, P., & Zaremba, W. (2018). Hindsight Experience Replay (arXiv:1707.01495). arXiv. https://doi.org/10.48550/arXiv.1707.01495

### Insert clipboard content as a hyperlink in Markdown.
* Activate via Command Palette (command + shift + P): Type "`Zotex: Add Hyperlink Citation`" and press enter.

### Open the currently cited item in Zotero.
* Activate via Command Palette (command + shift + P): Type "`Zotex: Open in Zotero`" and press enter.

### Keyboard shortcuts
* Pressing `ctrl+s` will open the Zotero Citation Picker to insert a citation.
* By default, `ctrl+alt+s` directly inserts the citation of the currently selected item in Zotero client and automatically imports the bib entry without needing to initiate Zotero Citation Picker.

## Requirements

You need to have Zotero installed, along with the Better BibTex extension. You'll probably also want some kind of LaTeX editor extension installed, such as LaTeX Workshop.

## Extension Settings

Include if your extension adds any VS Code settings through the `zotex.configuration` extension point.

For example:

This extension contributes the following settings:

* `zotex.serverUrl`: URL of the Zotero server.
* `zotex.bibliograpyStyle`: URL of bibliography style, see: https://www.zotero.org/styles.
* `zotex.defaultBibName`: Default bib file name
* `zotero.minimizeAfterPicking`: Minimize all Zotero windows after picking a citation.

## Known Issues

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Initial release of Zotex.

### 0.0.2

Improved README.md.

### 0.0.3

Fix a menu bug about minimizeAfterPicking. `minimizeAfterPicking` must be require Zotero BBT extension build 4926 or later.

### 1.0.0

Fix: insert incorrectly citation into `\cite[]{}`.

### 1.0.1

Fixed the problem that the original bib entry was overwritten when Exporting BibLaTex.

### 1.0.2

New Feature: Add `Flush BibLaTex` command to reforce fresh bib items and sort.

### 1.0.3

Update icon.

---

**Enjoy!**
