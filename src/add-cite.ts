import { window } from "vscode";
import { pickCiteKeys } from "./api";
import { insertCiteKeys } from "./utils";


/**
 * 给pandoc以及latex添加citation，不添加bibentry
 */
export async function addCitation(_selected: boolean = false){
    try{
        var citeKeys = await pickCiteKeys(_selected);
        insertCiteKeys(citeKeys);
    }catch(err){
        window.showErrorMessage((err as Error).message);
    }
}

/**
 * 添加当前zotero中选中的条目，不再弹出picker，直接插入
 */
export async function addZoteroSelectedCitation(){
    return addCitation(true);
}