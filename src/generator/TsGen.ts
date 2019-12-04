import Blockly from "blockly";
import { Base } from "./base";
import { Colour } from "./colour"
import { Lists } from "./lists"
import { Logic } from "./logic"
import { Loops } from "./loops"
import { Math_ } from "./math"
import { Procedures } from "./procedures"
import { Text } from "./text"
import { Variables } from "./variables"
import { VariablesDynamic } from "./variables_dynamic"
export class TsGen extends Blockly.Generator {
    constructor() {
        super("Typescript")
        this.addReservedWords(Base.RESERVED_WORDS_)
    }
    //base
    RESERVED_WORDS_ = Base.RESERVED_WORDS_
    definitions_: {}
    functionNames_: {}
    variableDB_: Blockly.Names
    ORDER = Base.ORDER
    ORDER_OVERRIDES = Base.ORDER_OVERRIDES
    init = Base.init.bind(this)
    finish = Base.finish.bind(this)
    scrubNakedValue = Base.scrubNakedValue.bind(this)
    quote_ = Base.quote_.bind(this)
    multiline_quote_ = Base.multiline_quote_.bind(this)
    scrub_ = Base.scrub_.bind(this)
    getAdjusted = Base.getAdjusted.bind(this)
    //colour
    color_picker = Colour.color_picker.bind(this)
    colour_random = Colour.colour_random.bind(this)
    colour_rgp = Colour.colour_rgb.bind(this)
    colour_blend = Colour.colour_blend.bind(this)
    //lists
    lists_create_empty = Lists.lists_create_empty.bind(this)
    lists_create_with = Lists.lists_create_with.bind(this)
    lists_repeat = Lists.lists_repeat.bind(this)
    lists_length = Lists.lists_length.bind(this)
    lists_isEmpty = Lists.lists_isEmpty.bind(this)
    lists_indexOf = Lists.lists_indexOf.bind(this)
    lists_getIndex = Lists.lists_getIndex.bind(this)
    lists_setIndex = Lists.lists_setIndex.bind(this)
    lists_getIndex_ = Lists.lists_getIndex_.bind(this)
    lists_getSublist = Lists.lists_getSublist.bind(this)
    lists_sort = Lists.lists_sort.bind(this)
    lists_split = Lists.lists_split.bind(this)
    lists_reverse = Lists.lists_reverse.bind(this)
    //logic
    controls_if = Logic.controls_if.bind(this)
    controls_ifelse = Logic.controls_ifelse.bind(this)
    logic_compare = Logic.logic_compare.bind(this)
    logic_operation = Logic.logic_operation.bind(this)
    logic_negate = Logic.logic_negate.bind(this)
    logic_boolean = Logic.logic_boolean.bind(this)
    logic_null = Logic.logic_null.bind(this)
    logic_ternary = Logic.logic_ternary.bind(this)
    //loops
    controls_repeat_ext = Loops.controls_repeat_ext.bind(this)
    controls_repeat = Loops.controls_repeat.bind(this)
    controls_whileUntil = Loops.controls_whileUntil.bind(this)
    controls_for = Loops.controls_for.bind(this)
    controls_forEach = Loops.controls_forEach.bind(this)
    controls_flow_statements = Loops.controls_flow_statements.bind(this)
    //math
    math_number = Math_.math_number.bind(this)
    math_arithmetic = Math_.math_arithmetic.bind(this)
    math_single = Math_.math_single.bind(this)
    math_constant = Math_.math_constant.bind(this)
    math_number_property = Math_.math_number_property.bind(this)
    math_change = Math_.math_change.bind(this)
    math_round = Math_.math_round.bind(this)
    math_trig = Math_.math_trig.bind(this)
    math_on_list = Math_.math_on_list.bind(this)
    math_modulo = Math_.math_modulo.bind(this)
    math_constrain = Math_.math_constrain.bind(this)
    math_random_int = Math_.math_random_int.bind(this)
    math_random_float = Math_.math_random_float.bind(this)
    math_atan2 = Math_.math_atan2.bind(this)
    //procedures
    procedures_defreturn = Procedures.procedures_defreturn.bind(this)
    procedures_defnoreturn = Procedures.procedures_defnoreturn.bind(this)
    procedures_callreturn = Procedures.procedures_callreturn.bind(this)
    procedures_callnoreturn = Procedures.procedures_callnoreturn.bind(this)
    procedures_ifreturn = Procedures.procedures_ifreturn.bind(this)
    //text
    text = Text.text.bind(this)
    text_multiline = Text.text_multiline.bind(this)
    text_forceString_ = Text.text_forceString_.bind(this)
    text_forceString_strRegExp = Text.text_forceString_strRegExp
    text_join = Text.text_join.bind(this)
    text_append = Text.text_append.bind(this)
    text_length = Text.text_length.bind(this)
    text_isEmpty = Text.text_isEmpty.bind(this)
    text_indexOf = Text.text_indexOf.bind(this)
    text_charAt = Text.text_charAt.bind(this)
    text_getIndex_ = Text.text_getIndex_.bind(this)
    text_getSubstring = Text.text_getSubstring.bind(this)
    text_changeCase = Text.text_changeCase.bind(this)
    text_trim = Text.text_trim.bind(this)
    text_print = Text.text_print.bind(this)
    text_prompt_ext = Text.text_prompt_ext.bind(this)
    text_prompt = Text.text_prompt.bind(this)
    text_count = Text.text_count.bind(this)
    text_replace = Text.text_replace.bind(this)
    text_reverse = Text.text_reverse.bind(this)
    //variables
    variables_get = Variables.variables_get.bind(this)
    variables_set = Variables.variables_set.bind(this)
    //variables_dynamic
    variables_get_dynamic = VariablesDynamic.variables_get_dynamic.bind(this)
    variables_set_dynamic = VariablesDynamic.variables_set_dynamic.bind(this)
}