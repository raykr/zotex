import { extname, dirname, join } from "path"
import { getBibliographyKeyFromFile, getNestedCitekeys } from "./utils"
import { getBibliography } from "./api"
import { window, ExtensionContext } from "vscode"
import { writeFileSync } from "fs"
import { getLatestBibName, setLatestBibName } from "./config"

/**
 * 根据latex和markdown环境的不同，导出所有的bibliography到文件中
 */
export async function exportBibLatex(context: ExtensionContext) {
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
      .showInputBox({ value: getLatestBibName(context), prompt: "File Name:" })
      .then((value) => {
        bibName = value || ""
      })

    if (bibName === undefined) {
      throw new Error("Cancelled.")
    }

    if (bibName.length < 5 || extname(bibName) !== ".bib") {
      return
    }

    // Create bib Path
    console.log("currentlyOpenTabfilePath==>", currentlyOpenTabfilePath)
    var parentDir = dirname(currentlyOpenTabfilePath)
    console.log("parentDir==>", parentDir)
    var bibPath = join(parentDir, bibName)
    console.log("bibName==>", bibName)
    console.log("bibPath==>", bibPath)

    // 获取文档内键列表
    let docKeys: string[] = []
    // 获取当前文档的内容
    let content = editor.document.getText()
    getNestedCitekeys(docKeys, content, parentDir)
    console.log("docKeys==>", docKeys)

    // 去除文档中重复的键
    var docUniKeys = Array.from(new Set(docKeys))

    // 代表不需要导出
    if (docUniKeys.length === 0) {
      return
    }

    // 还要与bib文件中的条目进行比较，如果已经存在，那么就不需要再次添加了
    let bibKeys = getBibliographyKeyFromFile(bibPath)
    console.log("bibPath==>", bibPath)
    console.log("bibKeys==>", bibKeys)
    let uniqueKeys = docUniKeys.filter((v, _) => !bibKeys.includes(v))
    console.log("uniqueKeys==>", uniqueKeys)

    // 如果为空，代表不需要添加内容的bib文件里边
    if (uniqueKeys.length === 0) {
      return
    }

    const res = await getBibliography(uniqueKeys)

    // try catch
    writeFileSync(bibPath, res, {
      flag: "a",
      encoding: "utf-8",
    })

    // 如果用户重新输入了bib文件名，那么就更新保持最后修改的名称
    setLatestBibName(context, bibName)

    window.showInformationMessage("Bib exported.")
  } catch (err) {
    window.showErrorMessage((err as Error).message)
  }
}

/**
 * 强制刷新bib文件，覆盖、排序
 */
export async function flushBibLatex(context: ExtensionContext) {
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
      .showInputBox({ value: getLatestBibName(context), prompt: "File Name:" })
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

    // 获取文档内键列表
    let docKeys: string[] = []
    // 获取当前文档的内容
    let content = editor.document.getText()
    getNestedCitekeys(docKeys, content, parentDir)
    console.log("docKeys==>", docKeys)
    // 获取bib文件内键列表
    let bibKeys = getBibliographyKeyFromFile(bibPath)
    // 合并两个列表
    let keys = (docKeys || []).concat(bibKeys)
    // 去除重复的键
    var uniqueKeys = Array.from(new Set(keys))
    console.log("uniqueKeys==>", uniqueKeys)
    // 如果为空，代表不需要添加内容的bib文件里边
    if (uniqueKeys.length === 0) {
      return
    }
    // 全部重新请求
    const res = await getBibliography(uniqueKeys)
    // 全部清空重写
    writeFileSync(bibPath, res, {
      encoding: "utf-8",
    })

    // 如果用户重新输入了bib文件名，那么就更新保持最后修改的名称
    setLatestBibName(context, bibName)

    window.showInformationMessage("Bib Flushed.")
  } catch (err) {
    window.showErrorMessage((err as Error).message)
  }
}
