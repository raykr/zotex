import { window } from "vscode"
import { getBibliography, pickCiteKeys } from "./api"
import { getBibliographyKeyFromFile, insertCiteKeys } from "./utils"
import { writeFileSync } from "fs"
import { setWorkspaceBibPath } from "./config"

/**
 * 给pandoc以及latex添加citation以及bibliography
 */
export async function addCiteBib(
  bibName: string | undefined = undefined,
  _selected: boolean = false
) {
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

    // get selected keys
    var citeKeys = await pickCiteKeys(_selected)
    insertCiteKeys(citeKeys)

    // 根据bib文件，而不是cite去获取keys。
    var bibKeys = getBibliographyKeyFromFile(bibName)

    // 过滤已经包含的引用
    var uniqueKeys = citeKeys.filter((v, i) => !bibKeys.includes(v))

    // 如果为空，代表不需要添加内容的bib文件里边
    if (uniqueKeys.length === 0) {
      return bibName
    }

    const res = await getBibliography(uniqueKeys)

    writeFileSync(bibName, res, {
      flag: "a",
      encoding: "utf8",
    })
    return bibName
  } catch (err: Error | any) {
    window.showErrorMessage(err.message)
  }
}

export async function addZoteroSelectedCiteBib(
  bibName: string | undefined = undefined
) {
  return addCiteBib(bibName, true)
}
