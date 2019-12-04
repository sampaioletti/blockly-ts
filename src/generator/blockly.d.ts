
import * as Blockly from "blockly"

declare module "blockly"{
    var Blocks:{[key:string]:{init(this:Blockly.Block):void}}
    interface Block{
        itemCount_:number
        arguments_:any[]
        hasReturnValue_:boolean
    }
    interface Options{
        oneBasedIndex:boolean
    }
    namespace Constants{
        namespace Loops{
            export var CONTROL_FLOW_IN_LOOP_CHECK_MIXIN: {
                LOOP_TYPES: string[];
                suppressPrefixSuffix: boolean;
                getSurroundLoop: (block: any) => any;
                onchange: (_e: any) => void;
            }
        }
    }
    namespace utils{
        namespace string{
            export function startsWith(str:string,prefix:string):boolean
            export function wrap(text:string,limit:number):string
        }
    }
    interface Generator{
        /**
         * Define a function to be included in the generated code.
         * The first time this is called with a given desiredName, the code is
         * saved and an actual name is generated.  Subsequent calls with the
         * same desiredName have no effect but have the same return value.
         *
         * It is up to the caller to make sure the same desiredName is not
         * used for different code values.
         *
         * The code gets output when Blockly.Generator.finish() is called.
         *
         * @param {string} desiredName The desired name of the function (e.g., isPrime).
         * @param {!Array.<string>} code A list of statements.  Use '  ' for indents.
         * @return {string} The actual name of the new function.  This may differ
         *     from desiredName if the former has already been taken by the user.
         * @private
         */
        provideFunction_(desiredName:string,code:string[]):string
         /**
         * This is used as a placeholder in functions defined using
         * Blockly.Generator.provideFunction_.  It must not be legal code that could
         * legitimately appear in a function definition (or comment), and it must
         * not confuse the regular expression parser.
         * @type {string}
         * @private
         */
        FUNCTION_NAME_PLACEHOLDER_:string
    }
}
