import { BlocklyDef } from "./decorators/BlocklyDef";
import { MetaData } from "./decorators/Metadata";
export { TsGen } from "./generator/TsGen";
export {ValueInput} from "./decorators/ValueInput"
export {Block} from "./decorators/Block"
export {Output} from "./decorators/Output"

export function GetDef(block:any):BlocklyDef{
    return MetaData.get(block.prototype)
}