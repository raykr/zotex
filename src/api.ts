import got from "got"
import { serverUrl, bibliograpyStyle } from "./config"

/**
 * 调用zotero citation picker获取citekeys
 * @returns string
 */
export async function pickCiteKeys() {
  // requests citekeys
  const res = await got(`${serverUrl()}/cayw?format=pandoc&brackets=1`)
  console.log(res.body)
  const data = res.body

  const pattern = /@([\w\d]+)/g
  let m
  let citeKeys = []
  while ((m = pattern.exec(data)) !== null) {
    citeKeys.push(m[1])
  }

  // 代表没有选择item，抛出异常。
  if (citeKeys.length === 0) {
    throw new Error("No item is selected.")
  }

  return citeKeys
}

/**
 * 根据key列表获取bibliography列表
 * @param keys string[] key列表
 * @returns string
 */
export async function getBibliography(keys: string[]) {
  let payload = {
    jsonrpc: "2.0",
    method: "item.export",
    params: [keys, "biblatex"],
  }

  // requests bibliography
  const res = await got.post(`${serverUrl()}/json-rpc`, { json: payload })
  const data = JSON.parse(res.body)
  if ("error" in data) {
    let err = data["error"]
    throw new Error(err["message"])
  }

  return data["result"][2]
}

/**
 * 按配置中的格式导出Reference列表，用于直接粘贴在word中
 * @param {string} citeKey citeKey
 * @returns string
 */
export async function getReference(citeKey: string) {
  let payload = {
    jsonrpc: "2.0",
    method: "item.bibliography",
    params: [["@" + citeKey], { id: bibliograpyStyle() }],
  }

  console.log(payload)

  // requests bibliography
  const res = await got.post(`${serverUrl()}/json-rpc`, { json: payload })
  const data = JSON.parse(res.body)
  if ("error" in data) {
    let err = data["error"]
    throw new Error(err["message"])
  }

  return data["result"]
}
