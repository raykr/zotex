import { Position, Range, window } from "vscode"
import { existsSync, readFileSync } from "fs"
import { toJSON } from "@orcid/bibtex-parse-js"
import * as path from "path"

/**
 * 输入一段正则表达式以及文字，导出匹配的列表
 * 匹配引用键的正则：let p = /\[([@^][\w\d]+(; )?)+\]/g;
 * @param {RegExp} pattern 正则表达式
 * @param {string} text 需要解析的文字
 * @returns 匹配的列表
 */
function getMatchList(pattern: RegExp, text: string) {
  let matchList = []
  let m
  while ((m = pattern.exec(text)) !== null) {
    matchList.push(m)
  }
  return matchList
}

/**
 * 根据key的匹配列表，返回key列表
 * @param {any[]} keyMatchList 匹配的列表
 * @returns key数组
 */
function getCiteKeyList(keyMatchList: any[]) {
  let citeKeyList: string[] = []
  keyMatchList.forEach(
    (/** @type {string[]} */ v: string[], /** @type {any} */ i: any) => {
      // 处理latex的情况
      let a = v[0].replace(/^cite/, "")
      let p = /(\w|\d)+/g
      let keyMatches = getMatchList(p, a)
      keyMatches.forEach((vi) => {
        citeKeyList.push(vi[0])
      })
    }
  )
  return citeKeyList
}

export function getNestedCitekeys(
  keyList: string[],
  content: any,
  dir: string
) {
  // 从内容中获取所有的键
  let keys = getDocumentCiteKeys(content)
  keyList.push(...(keys || []))
  // 从content中找到所有\input{...}的内容
  let inputPattern = /\\input\{(.*)\}/g
  let inputMatches = getMatchList(inputPattern, content)
  let inputPaths = inputMatches.map((v) => v[1])
  // 遍历所有的inputPaths
  inputPaths.forEach((v) => {
    // 如果v没有.tex后缀，那么就加上
    if (path.extname(v) === "") {
      v = v + ".tex"
    }
    // 如果v是相对路径，那么就加上dir
    if (!path.isAbsolute(v)) {
      v = path.join(dir, v)
    }
    // 获取当前文件所在目录路径
    let d = path.dirname(v)
    // 获取内容
    const ctt = readFileSync(v, {
      encoding: "utf8",
    })

    getNestedCitekeys(keyList, ctt, d)
  })
}

/**
 * 获取文档中引用的键列表
 */
export function getDocumentCiteKeys(content: any = undefined) {
  let languageId: string
  let p: RegExp | null = null
  if (content === undefined) {
    const editor = window.activeTextEditor
    if (editor === undefined) {
      throw new Error("No editor is active.")
    }
    content = editor.document.getText()
    languageId = editor.document.languageId
  } else {
    languageId = "latex"
  }

  if (languageId === "markdown") {
    p = /\[([@^][\w\d]+(;| ){0,2})+\]/g
  }

  if (languageId === "latex") {
    p = /cite(\[[^\]]*\])?\{([\w\d]+(,| ){0,2})+\}/g
  }

  if (p !== null && p !== undefined) {
    let ms = getMatchList(p, content)
    return getCiteKeyList(ms)
  }
}

/**
 * 判断鼠标是否在键的环境中，是的话，返回环境的end index，否则为null
 * @returns 键的offset
 */
export function getKeyEnvOffset() {
  const editor = window.activeTextEditor
  if (editor === undefined) {
    throw new Error("No editor is active.")
  }
  const data = getCursorRoundText()
  let p
  let cursorLocation = editor.document.offsetAt(editor.selection.active)

  if (editor.document.languageId === "markdown") {
    p = /\[([@^][\w\d]+(;| ){0,2})+\]/g
  }

  if (editor.document.languageId === "latex") {
    p = /cite(\[[^\]]*\])?\{([\w\d]+(,| ){0,2})+\}/g
  }

  if (p === null || p === undefined) {
    return p
  }

  let matches = getMatchList(p, data.content)
  for (const key in matches) {
    if (Object.hasOwnProperty.call(matches, key)) {
      const m = matches[key]
      let startIndex = m.index + data.startIndex
      let endIndex = m.index + m[0].length + data.startIndex
      if (cursorLocation >= startIndex && cursorLocation <= endIndex) {
        return endIndex
      }
    }
  }

  return null
}

/**
 * 获取鼠标前后目标长度的文字内容
 * @param {number} length 取字范围
 * @returns 目标文字
 */
function getCursorRoundText(length: number = 50) {
  const editor = window.activeTextEditor
  if (editor === undefined) {
    throw new Error("No editor is active.")
  }
  let textLength = editor.document.getText().length

  if (editor.selection.isEmpty) {
    const cursorPosition = editor.selection.active
    const cursorIndex = editor.document.offsetAt(cursorPosition)

    const startIndex = Math.max(cursorIndex - length, 0)
    const endIndex = Math.min(cursorIndex + length, textLength)

    const startPos = editor.document.positionAt(startIndex)
    const endPos = editor.document.positionAt(endIndex)

    let objectRange = new Range(startPos, endPos)
    let objectText = editor.document.getText(objectRange)

    return { startIndex: startIndex, content: objectText }
  }
  return { startIndex: 0, content: "" }
}

/**
 * 将文字输入到目标位置
 * @param {string} text 要输入的文字
 * @param {number} location 输入的位置，-1代表当前位置，-2代表最尾行，其他的代表目标位置
 */
export function insertText(text: string, location: number = -1) {
  const editor = window.activeTextEditor
  if (editor === undefined) {
    throw new Error("No editor is active.")
  }
  editor.edit((editBuilder) => {
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

/**
 * 在pandoc以及latex文档编写过程中，将key数组插入到文档中
 * @param {string[]} keyList key数组
 */
export function insertCiteKeys(keyList: string[]) {
  const editor = window.activeTextEditor
  if (editor === undefined) {
    throw new Error("No editor is active.")
  }
  var addLocation = getKeyEnvOffset()

  // insert latex citation。
  if (editor.document.languageId === "latex") {
    if (addLocation === null || addLocation === undefined) {
      insertText("\\cite{" + keyList.join(", ") + "}")
    } else {
      insertText(", " + keyList.join(", "), addLocation - 1)
    }
  }

  // insert pandoc citation
  if (editor.document.languageId === "markdown") {
    if (addLocation === null || addLocation === undefined) {
      insertText("[" + keyList.map((v) => "@" + v).join("; ") + "]")
    } else {
      insertText("; " + keyList.map((v) => "@" + v).join("; "), addLocation - 1)
    }
  }
}

export function makeid(length: number) {
  var result = ""
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

/**
 * 根据bib文件的路径，获取其中的bibentry的key数组
 * @param {string} bibPath bib文件的路径
 * @returns string[]
 */
export function getBibliographyKeyFromFile(bibPath: string) {
  // 代表文件不存在，返回空数组
  if (!existsSync(bibPath)) {
    return new Array()
  }

  var content = readFileSync(bibPath, {
    encoding: "utf8",
  })

  var jsonBibs = toJSON(content)

  return jsonBibs.map((jb: { [x: string]: any }) => jb["citationKey"])
}
