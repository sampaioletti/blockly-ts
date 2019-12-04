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
 * @fileoverview Generating JavaScript for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

import { TsGen } from "./TsGen";
import Blockly = require("blockly");

export namespace Logic{

export function controls_if(this:TsGen,block:Blockly.Block) {
  // If/elseif/else condition.
  var n = 0;
  var code = '', branchCode, conditionCode;
  if (this.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += this.injectId(this.STATEMENT_PREFIX,
        block);
  }
  do {
    conditionCode = this.valueToCode(block, 'IF' + n,
        this.ORDER.NONE) || 'false';
    branchCode = this.statementToCode(block, 'DO' + n);
    if (this.STATEMENT_SUFFIX) {
      branchCode = this.prefixLines(
          this.injectId(this.STATEMENT_SUFFIX,
          block), this.INDENT) + branchCode;
    }
    code += (n > 0 ? ' else ' : '') +
        'if (' + conditionCode + ') {\n' + branchCode + '}';
    ++n;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || this.STATEMENT_SUFFIX) {
    branchCode = this.statementToCode(block, 'ELSE');
    if (this.STATEMENT_SUFFIX) {
      branchCode = this.prefixLines(
          this.injectId(this.STATEMENT_SUFFIX,
          block), this.INDENT) + branchCode;
    }
    code += ' else {\n' + branchCode + '}';
  }
  return code + '\n';
};

export var controls_ifelse=controls_if

export function logic_compare(this:TsGen,block:Blockly.Block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = (operator == '==' || operator == '!=') ?
      this.ORDER.EQUALITY : this.ORDER.RELATIONAL;
  var argument0 = this.valueToCode(block, 'A', order) || '0';
  var argument1 = this.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

export function logic_operation(this:TsGen,block:Blockly.Block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? this.ORDER.LOGICAL_AND :
      this.ORDER.LOGICAL_OR;
  var argument0 = this.valueToCode(block, 'A', order);
  var argument1 = this.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == '&&') ? 'true' : 'false';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

export function logic_negate(this:TsGen,block:Blockly.Block) {
  // Negation.
  var order = this.ORDER.LOGICAL_NOT;
  var argument0 = this.valueToCode(block, 'BOOL', order) ||
      'true';
  var code = '!' + argument0;
  return [code, order];
};

export function logic_boolean(this:TsGen,block:Blockly.Block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, this.ORDER.ATOMIC];
};

export function logic_null(this:TsGen,block:Blockly.Block) {
  // Null data type.
  return ['null', this.ORDER.ATOMIC];
};

export function logic_ternary(this:TsGen,block:Blockly.Block) {
  // Ternary operator.
  var value_if = this.valueToCode(block, 'IF',
      this.ORDER.CONDITIONAL) || 'false';
  var value_then = this.valueToCode(block, 'THEN',
      this.ORDER.CONDITIONAL) || 'null';
  var value_else = this.valueToCode(block, 'ELSE',
      this.ORDER.CONDITIONAL) || 'null';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, this.ORDER.CONDITIONAL];
};
}