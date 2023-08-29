import { extname, dirname, join } from "path"
import { getDocumentCiteKeys } from "./utils"
import { getBibliography } from "./api"
import { window } from "vscode"
import { writeFileSync } from "fs"
import { getLatestBibName, setLatestBibName } from "./config"

/**
 * 根据latex和markdown环境的不同，导出所有的bibliography到文件中
 */
export async function exportBibLatex() {
  try {
    const editor = window.activeTextEditor
    if (editor === undefined) {
      throw new Error("No editor is active.")
    }
    var currentlyOpenTabfilePath = editor.document.uri.fsPath
    var bibName = ""

    // Current file tab is not saved.
    if (currentlyOpenTabfilePath.indexOf("Untitled") !== -1) {
      throw new Error("Please SAVE Current Tab.")
    }

    // Ask for bib file name
    await window
      .showInputBox({ value: getLatestBibName(), prompt: "File Name:" })
      .then((value) => {
        bibName = value || ""
      })

    if (bibName === undefined) {
      throw new Error("Cancelled.")
    }

    if (bibName.length < 5 || extname(bibName) !== ".bib") {
      throw new Error("bibName is invalid or its length is less than 5.")
    }

    // Create bib Path
    var parentDir = dirname(currentlyOpenTabfilePath)
    var bibPath = join(parentDir, bibName)

    // 获取键列表
    const keys = getDocumentCiteKeys()

    // 去除重复的问题
    var uniqueKeys = Array.from(new Set(keys))

    // 代表不需要导出
    if (uniqueKeys.length === 0) {
      throw new Error("No key detected.")
    }

    const res = await getBibliography(uniqueKeys)

    // try catch
    writeFileSync(bibPath, res, {
      encoding: "utf-8",
    })

    // 如果用户重新输入了bib文件名，那么就更新保持最后修改的名称
    setLatestBibName(bibName)
  } catch (err) {
    window.showErrorMessage((err as Error).message)
  }
}
