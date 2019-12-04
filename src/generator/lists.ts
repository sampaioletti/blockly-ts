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
 * @fileoverview Generating JavaScript for list blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

import { TsGen } from "./TsGen";
import Blockly = require("blockly");
export namespace Lists{
export function lists_create_empty(this:TsGen,block:Blockly.Block) {
  // Create an empty list.
  return ['[]', this.ORDER.ATOMIC];
};

export function lists_create_with(this:TsGen,block:Blockly.Block) {
  // Create a list with any number of elements of any type.
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = this.valueToCode(block, 'ADD' + i,
        this.ORDER.COMMA) || 'null';
  }
  var code = '[' + elements.join(', ') + ']';
  return [code, this.ORDER.ATOMIC];
};

export function lists_repeat(this:TsGen,block:Blockly.Block) {
  // Create a list with one element repeated.
  var functionName = this.provideFunction_(
      'listsRepeat',
      ['function ' + this.FUNCTION_NAME_PLACEHOLDER_ +
          '(value, n) {',
       '  var array = [];',
       '  for (var i = 0; i < n; i++) {',
       '    array[i] = value;',
       '  }',
       '  return array;',
       '}']);
  var element = this.valueToCode(block, 'ITEM',
      this.ORDER.COMMA) || 'null';
  var repeatCount = this.valueToCode(block, 'NUM',
      this.ORDER.COMMA) || '0';
  var code = functionName + '(' + element + ', ' + repeatCount + ')';
  return [code, this.ORDER.FUNCTION_CALL];
};

export function lists_length(this:TsGen,block:Blockly.Block) {
  // String or array length.
  var list = this.valueToCode(block, 'VALUE',
      this.ORDER.MEMBER) || '[]';
  return [list + '.length', this.ORDER.MEMBER];
};

export function lists_isEmpty(this:TsGen,block:Blockly.Block) {
  // Is the string null or array empty?
  var list = this.valueToCode(block, 'VALUE',
      this.ORDER.MEMBER) || '[]';
  return ['!' + list + '.length', this.ORDER.LOGICAL_NOT];
};

export function lists_indexOf(this:TsGen,block:Blockly.Block) {
  // Find an item in the list.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  var item = this.valueToCode(block, 'FIND',
      this.ORDER.NONE) || '\'\'';
  var list = this.valueToCode(block, 'VALUE',
      this.ORDER.MEMBER) || '[]';
  var code = list + '.' + operator + '(' + item + ')';
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', this.ORDER.ADDITION];
  }
  return [code, this.ORDER.FUNCTION_CALL];
};

export function lists_getIndex(this:TsGen,block:Blockly.Block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var listOrder = (where == 'RANDOM') ? this.ORDER.COMMA :
      this.ORDER.MEMBER;
  var list = this.valueToCode(block, 'VALUE', listOrder) || '[]';

  switch (where) {
    case ('FIRST'):
      if (mode == 'GET') {
        var code = list + '[0]';
        return [code, this.ORDER.MEMBER];
      } else if (mode == 'GET_REMOVE') {
        var code = list + '.shift()';
        return [code, this.ORDER.MEMBER];
      } else if (mode == 'REMOVE') {
        return list + '.shift();\n';
      }
      break;
    case ('LAST'):
      if (mode == 'GET') {
        var code = list + '.slice(-1)[0]';
        return [code, this.ORDER.MEMBER];
      } else if (mode == 'GET_REMOVE') {
        var code = list + '.pop()';
        return [code, this.ORDER.MEMBER];
      } else if (mode == 'REMOVE') {
        return list + '.pop();\n';
      }
      break;
    case ('FROM_START'):
      var at = this.getAdjusted(block, 'AT');
      if (mode == 'GET') {
        var code = list + '[' + at + ']';
        return [code, this.ORDER.MEMBER];
      } else if (mode == 'GET_REMOVE') {
        var code = list + '.splice(' + at + ', 1)[0]';
        return [code, this.ORDER.FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return list + '.splice(' + at + ', 1);\n';
      }
      break;
    case ('FROM_END'):
      var at = this.getAdjusted(block, 'AT', 1, true);
      if (mode == 'GET') {
        var code = list + '.slice(' + at + ')[0]';
        return [code, this.ORDER.FUNCTION_CALL];
      } else if (mode == 'GET_REMOVE') {
        var code = list + '.splice(' + at + ', 1)[0]';
        return [code, this.ORDER.FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return list + '.splice(' + at + ', 1);';
      }
      break;
    case ('RANDOM'):
      var functionName = this.provideFunction_(
          'listsGetRandomItem',
          ['function ' + this.FUNCTION_NAME_PLACEHOLDER_ +
              '(list, remove) {',
           '  var x = Math.floor(Math.random() * list.length);',
           '  if (remove) {',
           '    return list.splice(x, 1)[0];',
           '  } else {',
           '    return list[x];',
           '  }',
           '}']);
      code = functionName + '(' + list + ', ' + (mode != 'GET') + ')';
      if (mode == 'GET' || mode == 'GET_REMOVE') {
        return [code, this.ORDER.FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + ';\n';
      }
      break;
  }
  throw Error('Unhandled combination (lists_getIndex).');
};

export function lists_setIndex(this:TsGen,block:Blockly.Block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = this.valueToCode(block, 'LIST',
      this.ORDER.MEMBER) || '[]';
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var value = this.valueToCode(block, 'TO',
      this.ORDER.ASSIGNMENT) || 'null';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  function cacheList() {
    if (list.match(/^\w+$/)) {
      return '';
    }
    var listVar = this.variableDB_.getDistinctName(
        'tmpList', Blockly.Variables.NAME_TYPE);
    var code = 'var ' + listVar + ' = ' + list + ';\n';
    list = listVar;
    return code;
  }
  switch (where) {
    case ('FIRST'):
      if (mode == 'SET') {
        return list + '[0] = ' + value + ';\n';
      } else if (mode == 'INSERT') {
        return list + '.unshift(' + value + ');\n';
      }
      break;
    case ('LAST'):
      if (mode == 'SET') {
        var code = cacheList();
        code += list + '[' + list + '.length - 1] = ' + value + ';\n';
        return code;
      } else if (mode == 'INSERT') {
        return list + '.push(' + value + ');\n';
      }
      break;
    case ('FROM_START'):
      var at = this.getAdjusted(block, 'AT');
      if (mode == 'SET') {
        return list + '[' + at + '] = ' + value + ';\n';
      } else if (mode == 'INSERT') {
        return list + '.splice(' + at + ', 0, ' + value + ');\n';
      }
      break;
    case ('FROM_END'):
      var at = this.getAdjusted(block, 'AT', 1, false,
          this.ORDER.SUBTRACTION);
      var code = cacheList();
      if (mode == 'SET') {
        code += list + '[' + list + '.length - ' + at + '] = ' + value + ';\n';
        return code;
      } else if (mode == 'INSERT') {
        code += list + '.splice(' + list + '.length - ' + at + ', 0, ' + value +
            ');\n';
        return code;
      }
      break;
    case ('RANDOM'):
      var code = cacheList();
      var xVar = this.variableDB_.getDistinctName(
          'tmpX', Blockly.Variables.NAME_TYPE);
      code += 'var ' + xVar + ' = Math.floor(Math.random() * ' + list +
          '.length);\n';
      if (mode == 'SET') {
        code += list + '[' + xVar + '] = ' + value + ';\n';
        return code;
      } else if (mode == 'INSERT') {
        code += list + '.splice(' + xVar + ', 0, ' + value + ');\n';
        return code;
      }
      break;
  }
  throw Error('Unhandled combination (lists_setIndex).');
};

/**
 * Returns an expression calculating the index into a list.
 * @param {string} listName Name of the list, used to calculate length.
 * @param {string} where The method of indexing, selected by dropdown in Blockly
 * @param {string=} opt_at The optional offset when indexing from start/end.
 * @return {string} Index expression.
 * @private
 */
export function lists_getIndex_(listName, where, opt_at) {
  if (where == 'FIRST') {
    return '0';
  } else if (where == 'FROM_END') {
    return listName + '.length - 1 - ' + opt_at;
  } else if (where == 'LAST') {
    return listName + '.length - 1';
  } else {
    return opt_at;
  }
};

export function lists_getSublist(this:TsGen,block:Blockly.Block) {
  // Get sublist.
  var list = this.valueToCode(block, 'LIST',
      this.ORDER.MEMBER) || '[]';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = list + '.slice(0)';
  } else if (list.match(/^\w+$/) ||
      (where1 != 'FROM_END' && where2 == 'FROM_START')) {
    // If the list is a variable or doesn't require a call for length, don't
    // generate a helper function.
    var at1:string|number
    var at2:string|number
    switch (where1) {
      case 'FROM_START':
        at1 = this.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        at1 = this.getAdjusted(block, 'AT1', 1, false,
            this.ORDER.SUBTRACTION);
        at1 = list + '.length - ' + at1;
        break;
      case 'FIRST':
        at1 = '0';
        break;
      default:
        throw Error('Unhandled option (lists_getSublist).');
    }
    switch (where2) {
      case 'FROM_START':
        at2 = this.getAdjusted(block, 'AT2', 1);
        break;
      case 'FROM_END':
        at2 = this.getAdjusted(block, 'AT2', 0, false,
            this.ORDER.SUBTRACTION);
        at2 = list + '.length - ' + at2;
        break;
      case 'LAST':
        at2 = list + '.length';
        break;
      default:
        throw Error('Unhandled option (lists_getSublist).');
    }
    code = list + '.slice(' + at1 + ', ' + at2 + ')';
  } else {
    at1 = this.getAdjusted(block, 'AT1');
    at2 = this.getAdjusted(block, 'AT2');
    var getIndex_ = this.lists_getIndex_;
    var wherePascalCase = {'FIRST': 'First', 'LAST': 'Last',
        'FROM_START': 'FromStart', 'FROM_END': 'FromEnd'};
    var functionName = this.provideFunction_(
        'subsequence' + wherePascalCase[where1] + wherePascalCase[where2],
        ['export function ' + this.FUNCTION_NAME_PLACEHOLDER_ +
            '(sequence' +
            // The value for 'FROM_END' and'FROM_START' depends on `at` so
            // we add it as a parameter.
            ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', at1' : '') +
            ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', at2' : '') +
            ') {',
          '  var start = ' + getIndex_('sequence', where1, 'at1') + ';',
          '  var end = ' + getIndex_('sequence', where2, 'at2') + ' + 1;',
          '  return sequence.slice(start, end);',
          '}']);
    var code = functionName + '(' + list +
        // The value for 'FROM_END' and 'FROM_START' depends on `at` so we
        // pass it.
        ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', ' + at1 : '') +
        ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', ' + at2 : '') +
        ')';
  }
  return [code, this.ORDER.FUNCTION_CALL];
};

export function lists_sort(this:TsGen,block:Blockly.Block) {
  // Block for sorting a list.
  var list = this.valueToCode(block, 'LIST',
      this.ORDER.FUNCTION_CALL) || '[]';
  var direction = block.getFieldValue('DIRECTION') === '1' ? 1 : -1;
  var type = block.getFieldValue('TYPE');
  var getCompareFunctionName = this.provideFunction_(
      'listsGetSortCompare',
      ['function ' + this.FUNCTION_NAME_PLACEHOLDER_ +
          '(type, direction) {',
       '  var compareFuncs = {',
       '    "NUMERIC": function(a, b) {',
       '        return Number(a) - Number(b); },',
       '    "TEXT": function(a, b) {',
       '        return a.toString() > b.toString() ? 1 : -1; },',
       '    "IGNORE_CASE": function(a, b) {',
       '        return a.toString().toLowerCase() > ' +
          'b.toString().toLowerCase() ? 1 : -1; },',
       '  };',
       '  var compare = compareFuncs[type];',
       '  return function(a, b) { return compare(a, b) * direction; }',
       '}']);
  return [list + '.slice().sort(' +
      getCompareFunctionName + '("' + type + '", ' + direction + '))',
      this.ORDER.FUNCTION_CALL];
};

export function lists_split(this:TsGen,block:Blockly.Block) {
  // Block for splitting text into a list, or joining a list into text.
  var input = this.valueToCode(block, 'INPUT',
      this.ORDER.MEMBER);
  var delimiter = this.valueToCode(block, 'DELIM',
      this.ORDER.NONE) || '\'\'';
  var mode = block.getFieldValue('MODE');
  if (mode == 'SPLIT') {
    if (!input) {
      input = '\'\'';
    }
    var functionName = 'split';
  } else if (mode == 'JOIN') {
    if (!input) {
      input = '[]';
    }
    var functionName = 'join';
  } else {
    throw Error('Unknown mode: ' + mode);
  }
  var code = input + '.' + functionName + '(' + delimiter + ')';
  return [code, this.ORDER.FUNCTION_CALL];
};

export function lists_reverse(this:TsGen,block:Blockly.Block) {
  // Block for reversing a list.
  var list = this.valueToCode(block, 'LIST',
      this.ORDER.FUNCTION_CALL) || '[]';
  var code = list + '.slice().reverse()';
  return [code, this.ORDER.FUNCTION_CALL];
};
}