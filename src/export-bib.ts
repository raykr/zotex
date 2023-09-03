import { dirname } from "path"
import { getBibliographyKeyFromFile, getNestedCitekeys } from "./utils"
import { getBibliography } from "./api"
import { window } from "vscode"
import { writeFileSync } from "fs"
import { setWorkspaceBibPath } from "./config"

/**
 * 根据latex和markdown环境的不同，导出所有的bibliography到文件中
 */
export async function exportBibLatex(bibName: string | undefined = undefined) {
  try {
    const editor = window.activeTextEditor
    if (editor === undefined) {
      throw new Error("No editor is active.")
    }
    var currentlyOpenTabfilePath = editor.document.uri.fsPath

    // Current file tab is not saved.
    if (currentlyOpenTabfilePath.indexOf("Untitled") !== -1) {
      throw new Error("Please SAVE Current Tab.")
    }

    // if workspaceBibPath is not set, ask user to set it.
    if (!bibName) {
      bibName = await setWorkspaceBibPath("") || ""
      if (bibName === undefined || bibName === "") {
        window.showErrorMessage("[Tip]: Please set a .bib file path before use.")
      }
    }

    // Create bib Path
    var parentDir = dirname(currentlyOpenTabfilePath)

    // 获取文档内键列表
    let docKeys: string[] = []
    // 获取当前文档的内容
    let content = editor.document.getText()
    getNestedCitekeys(docKeys, content, parentDir)
    // console.log("docKeys==>", docKeys)

    // 去除文档中重复的键
    var docUniKeys = Array.from(new Set(docKeys))

    // 代表不需要导出
    if (docUniKeys.length === 0) {
      return bibName
    }

    // 还要与bib文件中的条目进行比较，如果已经存在，那么就不需要再次添加了
    let bibKeys = getBibliographyKeyFromFile(bibName)
    let uniqueKeys = docUniKeys.filter((v, _) => !bibKeys.includes(v))

    // 如果为空，代表不需要添加内容的bib文件里边
    if (uniqueKeys.length === 0) {
      return bibName
    }

    const res = await getBibliography(uniqueKeys)

    // try catch
    writeFileSync(bibName, res, {
      flag: "a",
      encoding: "utf-8",
    })

    window.showInformationMessage("Bib exported.")
    console.log("Bib exported.", bibName)
    return bibName
  } catch (err) {
    window.showErrorMessage((err as Error).message)
  }
}

/**
 * 强制刷新bib文件，覆盖、排序
 */
export async function flushBibLatex(bibName: string | undefined = undefined) {
  try {
    const editor = window.activeTextEditor
    if (editor === undefined) {
      throw new Error("No editor is active.")
    }
    var currentlyOpenTabfilePath = editor.document.uri.fsPath

    // Current file tab is not saved.
    if (currentlyOpenTabfilePath.indexOf("Untitled") !== -1) {
      throw new Error("Please SAVE Current Tab.")
    }

    // if workspaceBibPath is not set, ask user to set it.
    if (!bibName) {
      bibName = await setWorkspaceBibPath("") || ""
      if (bibName === undefined || bibName === "") {
        window.showErrorMessage("[Tip]: Please set a .bib file path before use.")
      }
    }

    // Create bib Path
    var parentDir = dirname(currentlyOpenTabfilePath)

    // 获取文档内键列表
    let docKeys: string[] = []
    // 获取当前文档的内容
    let content = editor.document.getText()
    getNestedCitekeys(docKeys, content, parentDir)
    // console.log("docKeys==>", docKeys)
    // 获取bib文件内键列表
    let bibKeys = getBibliographyKeyFromFile(bibName)
    // 合并两个列表
    let keys = (docKeys || []).concat(bibKeys)
    // 去除重复的键
    var uniqueKeys = Array.from(new Set(keys))
    // 如果为空，代表不需要添加内容的bib文件里边
    if (uniqueKeys.length === 0) {
      return bibName
    }
    // 全部重新请求
    const res = await getBibliography(uniqueKeys)
    // 全部清空重写
    writeFileSync(bibName, res, {
      encoding: "utf-8",
    })

    window.showInformationMessage("Bib Flushed.")
    return bibName
  } catch (err) {
    window.showErrorMessage((err as Error).message)
  }
}
