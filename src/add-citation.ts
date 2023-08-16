import { window } from "vscode";
import { pickCiteKeys } from "./api";
import { getKeyEnvOffset, insertText } from "./utils";


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

/**
 * 在pandoc以及latex文档编写过程中，将key数组插入到文档中
 * @param {string[]} keyList key数组
 */
function insertCiteKeys(keyList: string[]){
    const editor = window.activeTextEditor;
    if(editor === undefined){
        throw new Error("No editor is active.");
    }
    var addLocation = getKeyEnvOffset();

    // insert latex citation。
    if(editor.document.languageId === 'latex'){
        if(addLocation === null || addLocation === undefined){
            insertText('\\cite{'+keyList.join(', ') + '}');
        }else{
            insertText(', ' + keyList.join(', '), addLocation-1);
        }
    }
    
    // insert pandoc citation
    if(editor.document.languageId === 'markdown'){
        if(addLocation === null || addLocation === undefined){
            insertText('[' + keyList.map( v => '@' + v).join('; ') + ']');
        }else{
            insertText('; ' + keyList.map( v => '@' + v).join('; '), addLocation-1);
        }
    }
}