import { window } from "vscode";
import { getReference, pickCiteKeys } from "./api";
import { getDocumentCiteKeys, insertText } from "./utils";

/**
 * 对于markdown文件的书写，选择key，然后插入bibliography，
 * key的格式为：[^k1][^k2]
 * bibliography的格式：
 *   [^k1]: content
 *   [^k2]: content
 */
export async function addMdCiteBib(){
    try{
        // 获取键列表
        var existKeys = getDocumentCiteKeys() as string[];
    
        // 获取键值
        var citeKeys = await pickCiteKeys(); 
    
        // insert markdown citation
        insertText('[^' + citeKeys.join('][^') + ']');
        
        // 插入插入bibliography，并过滤已经插入的
        citeKeys.forEach(e => {
            if(!existKeys.includes(e)){
                insertMarkdownBibliography(e)
            }
        });
    
    }catch(err: Error | any){
        window.showErrorMessage(err.message);
    }
}

/**
 * 根据item的key，插入markdown格式的bibliography
 * @param {string} citeKey item的Key
 */
async function insertMarkdownBibliography(citeKey: string){

    // 获取bibliography的格式
    const ref = await getReference(citeKey)

    const bibliographyText = '[^' + citeKey + "]: " + ref;
        
    // enter text to the file end.
    insertText(bibliographyText, -2);

}