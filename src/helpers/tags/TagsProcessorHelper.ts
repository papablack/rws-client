interface ILineInfo {
    content: string,
    found: boolean
}

type TagsProcessorType = { [key: string]: (cnt: string, key: string) => ILineInfo }

const tagsProcessor = (content: string, tagsProcessorElements: TagsProcessorType = {}): string => {

    for(const tag in tagsProcessorElements){             
        const lineInfo: ILineInfo = tagsProcessorElements[tag](content, tag);

        if(lineInfo.found){        
            content = lineInfo.content;                
        }
    }    

    return content;
}

export { ILineInfo, TagsProcessorType, tagsProcessor };