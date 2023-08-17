//将超链接设置为引用

import { Position, env, window } from "vscode"
import { makeid } from "./utils"

// https://stackoverflow.com/questions/54632431/vscode-api-read-clipboard-text-content
export async function addHyperLinkCitation() {
  const editor = window.activeTextEditor
  if (editor === undefined) {
    throw new Error("No editor is active.")
  }
  // 从剪切板获取内容
  let clipContent = await env.clipboard.readText()

  if (clipContent === "") {
    window.showErrorMessage("No Data in Clipboard.")
    return
  }

  //1. 生成一个随机字符串
  var key = makeid(8)
  var keyContent = `[^${key}]`
  var appContent = `\n[^${key}]: <${clipContent}>`

  // insert pandoc citation
  if (editor.document.languageId === "markdown") {
    await insertTextAsync(keyContent)
    await insertTextAsync(appContent, -2)
  }
}

async function insertTextAsync(text: string, location = -1) {
  const editor = window.activeTextEditor
  if (editor === undefined) {
    throw new Error("No editor is active.")
  }
  await editor.edit((editBuilder) => {
    if (location === -1) {
      editBuilder.insert(editor.selection.active, text)
    } else if (location === -2) {
      const lastLine = editor.document.lineAt(editor.document.lineCount - 1)
      editBuilder.insert(new Position(lastLine.lineNumber + 1, 0), text)
    } else {
      var position = editor.document.positionAt(location)
      editBuilder.insert(position, text)
    }
  })
}
