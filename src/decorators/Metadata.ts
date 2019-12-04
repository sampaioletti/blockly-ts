import { BlocklyDef } from "./BlocklyDef"

export const MetaDataKey="blockly"

export namespace MetaData{
    export function get(target:any):BlocklyDef{
        let def=Reflect.getMetadata(MetaDataKey,target) as BlocklyDef||new BlocklyDef()
        Reflect.defineMetadata(MetaDataKey,def,target)
        return def
    }
}