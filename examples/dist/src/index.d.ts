import * as Blockly from "blockly";
declare module "blockly" {
    var Blocks: {
        [key: string]: {
            init(this: Blockly.Block): void;
        };
    };
}
export declare type ToolBoxItems = ToolBoxItem[];
export declare type ToolBoxCategorys = ToolBoxCategory[];
export interface ToolBoxItem {
    type: string;
}
export interface ToolBoxCategory {
    name: string;
    sub?: ToolBoxCategorys;
    custom?: string;
    items?: ToolBoxItems | string[];
}
