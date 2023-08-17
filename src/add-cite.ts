import { window } from "vscode";
import { pickCiteKeys } from "./api";
import { getKeyEnvOffset, insertCiteKeys, insertText } from "./utils";


/**
 * 给pandoc以及latex添加citation，不添加bibentry
 */
export async function addCitation(){
    try{
        var citeKeys = await pickCiteKeys();
        insertCiteKeys(citeKeys);
    }catch(err){
        window.showErrorMessage((err as Error).message);
    }
}