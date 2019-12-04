/**
 * @license
 * Copyright 2012 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating JavaScript for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

import { TsGen } from "./TsGen";
import Blockly = require("blockly");

export namespace Procedures{
  export function procedures_defreturn(this:TsGen,block:Blockly.Block) {
  // Define a procedure with a return value.
  var funcName = this.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var xfix1 = '';
  if (this.STATEMENT_PREFIX) {
    xfix1 += this.injectId(this.STATEMENT_PREFIX,
        block);
  }
  if (this.STATEMENT_SUFFIX) {
    xfix1 += this.injectId(this.STATEMENT_SUFFIX,
        block);
  }
  if (xfix1) {
    xfix1 = this.prefixLines(xfix1, this.INDENT);
  }
  var loopTrap = '';
  if (this.INFINITE_LOOP_TRAP) {
    loopTrap = this.prefixLines(
        this.injectId(this.INFINITE_LOOP_TRAP,
        block), this.INDENT);
  }
  var branch = this.statementToCode(block, 'STACK');
  var returnValue = this.valueToCode(block, 'RETURN',
      this.ORDER.NONE) || '';
  var xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = this.INDENT + 'return ' + returnValue + ';\n';
  }
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = this.variableDB_.getName(block.arguments_[i],
        Blockly.Variables.NAME_TYPE);
  }
  var code = 'function ' + funcName + '(' + args.join(', ') + ') {\n' +
      xfix1 + loopTrap + branch + xfix2 + returnValue + '}';
  code = this.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  this.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
export var procedures_defnoreturn=procedures_defreturn

export function procedures_callreturn(this:TsGen,block:Blockly.Block) {
  // Call a procedure with a return value.
  var funcName = this.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = this.valueToCode(block, 'ARG' + i,
        this.ORDER.COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, this.ORDER.FUNCTION_CALL];
};

export function procedures_callnoreturn(this:TsGen,block:Blockly.Block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  var tuple = this['procedures_callreturn'](block);
  return tuple[0] + ';\n';
};

export function procedures_ifreturn(this:TsGen,block:Blockly.Block) {
  // Conditionally return value from a procedure.
  var condition = this.valueToCode(block, 'CONDITION',
      this.ORDER.NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (this.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code += this.prefixLines(
        this.injectId(this.STATEMENT_SUFFIX, block),
        this.INDENT);
  }
  if (block.hasReturnValue_) {
    var value = this.valueToCode(block, 'VALUE',
        this.ORDER.NONE) || 'null';
    code += this.INDENT + 'return ' + value + ';\n';
  } else {
    code += this.INDENT + 'return;\n';
  }
  code += '}\n';
  return code;
};
}