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
 * @fileoverview Generating JavaScript for text blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

import { TsGen } from "./TsGen";
import Blockly = require("blockly");

export namespace Text{
  export function text(this:TsGen,block:Blockly.Block) {
  // Text value.
  var code = this.quote_(block.getFieldValue('TEXT'));
  return [code, this.ORDER.ATOMIC];
};

export function text_multiline(this:TsGen,block:Blockly.Block) {
  // Text value.
  var code = this.multiline_quote_(block.getFieldValue('TEXT'));
  if (code.includes('\n')) {
      code = '(' + code + ')'
  }
  return [code, this.ORDER.ATOMIC];
};

/**
 * Enclose the provided value in 'String(...)' function.
 * Leave string literals alone.
 * @param {string} value Code evaluating to a value.
 * @return {string} Code evaluating to a string.
 * @private
 */
export function text_forceString_(this:TsGen,value:string):string {
  if (this.text_forceString_strRegExp.test(value)) {
    return value;
  }
  return 'String(' + value + ')';
};

/**
 * Regular expression to detect a single-quoted string literal.
 */
export  var text_forceString_strRegExp = /^\s*'([^']|\\')*'\s*$/;

export function text_join(this:TsGen,block:Blockly.Block) {
  // Create a string made up of any number of elements of any type.
  var code:string
  switch (block.itemCount_) {
    case 0:
      return ['\'\'', this.ORDER.ATOMIC];
    case 1:
      var element = this.valueToCode(block, 'ADD0',
          this.ORDER.NONE) || '\'\'';
      code = this.text_forceString_(element);
      return [code, this.ORDER.FUNCTION_CALL];
    case 2:
      var element0 = this.valueToCode(block, 'ADD0',
          this.ORDER.NONE) || '\'\'';
      var element1 = this.valueToCode(block, 'ADD1',
          this.ORDER.NONE) || '\'\'';
      code = this.text_forceString_(element0) + ' + ' +
          this.text_forceString_(element1);
      return [code, this.ORDER.ADDITION];
    default:
      var elements = new Array(block.itemCount_);
      for (var i = 0; i < block.itemCount_; i++) {
        elements[i] = this.valueToCode(block, 'ADD' + i,
            this.ORDER.COMMA) || '\'\'';
      }
      var code = '[' + elements.join(',') + '].join(\'\')';
      return [code, this.ORDER.FUNCTION_CALL];
  }
};

export function text_append(this:TsGen,block:Blockly.Block) {
  // Append to a variable in place.
  var varName = this.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value = this.valueToCode(block, 'TEXT',
      this.ORDER.NONE) || '\'\'';
  return varName + ' += ' + this.text_forceString_(value) + ';\n';
};

export function text_length(this:TsGen,block:Blockly.Block) {
  // String or array length.
  var text = this.valueToCode(block, 'VALUE',
      this.ORDER.FUNCTION_CALL) || '\'\'';
  return [text + '.length', this.ORDER.MEMBER];
};

export function text_isEmpty(this:TsGen,block:Blockly.Block) {
  // Is the string null or array empty?
  var text = this.valueToCode(block, 'VALUE',
      this.ORDER.MEMBER) || '\'\'';
  return ['!' + text + '.length', this.ORDER.LOGICAL_NOT];
};

export function text_indexOf(this:TsGen,block:Blockly.Block) {
  // Search the text for a substring.
  var operator = block.getFieldValue('END') == 'FIRST' ?
      'indexOf' : 'lastIndexOf';
  var substring = this.valueToCode(block, 'FIND',
      this.ORDER.NONE) || '\'\'';
  var text = this.valueToCode(block, 'VALUE',
      this.ORDER.MEMBER) || '\'\'';
  var code = text + '.' + operator + '(' + substring + ')';
  // Adjust index if using one-based indices.
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', this.ORDER.ADDITION];
  }
  return [code, this.ORDER.FUNCTION_CALL];
};

export function text_charAt(this:TsGen,block:Blockly.Block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var textOrder = (where == 'RANDOM') ? this.ORDER.NONE :
      this.ORDER.MEMBER;
  var text = this.valueToCode(block, 'VALUE',
      textOrder) || '\'\'';
  switch (where) {
    case 'FIRST':
      var code = text + '.charAt(0)';
      return [code, this.ORDER.FUNCTION_CALL];
    case 'LAST':
      var code = text + '.slice(-1)';
      return [code, this.ORDER.FUNCTION_CALL];
    case 'FROM_START':
      var at = this.getAdjusted(block, 'AT');
      // Adjust index if using one-based indices.
      var code = text + '.charAt(' + at + ')';
      return [code, this.ORDER.FUNCTION_CALL];
    case 'FROM_END':
      var at = this.getAdjusted(block, 'AT', 1, true);
      var code = text + '.slice(' + at + ').charAt(0)';
      return [code, this.ORDER.FUNCTION_CALL];
    case 'RANDOM':
      var functionName = this.provideFunction_(
          'textRandomLetter',
          ['function ' + this.FUNCTION_NAME_PLACEHOLDER_ +
              '(text) {',
           '  var x = Math.floor(Math.random() * text.length);',
           '  return text[x];',
           '}']);
      var code = functionName + '(' + text + ')';
      return [code, this.ORDER.FUNCTION_CALL];
  }
  throw Error('Unhandled option (text_charAt).');
};

/**
 * Returns an expression calculating the index into a string.
 * @param {string} stringName Name of the string, used to calculate length.
 * @param {string} where The method of indexing, selected by dropdown in Blockly
 * @param {string=} opt_at The optional offset when indexing from start/end.
 * @return {string} Index expression.
 * @private
 */
export function text_getIndex_(this:TsGen,stringName:string, where:string, opt_at:string):string {
  if (where == 'FIRST') {
    return '0';
  } else if (where == 'FROM_END') {
    return stringName + '.length - 1 - ' + opt_at;
  } else if (where == 'LAST') {
    return stringName + '.length - 1';
  } else {
    return opt_at;
  }
};

export function text_getSubstring(this:TsGen,block:Blockly.Block) {
  // Get substring.
  var text = this.valueToCode(block, 'STRING',
      this.ORDER.FUNCTION_CALL) || '\'\'';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = text;
  } else if (text.match(/^'?\w+'?$/) ||
      (where1 != 'FROM_END' && where1 != 'LAST' &&
      where2 != 'FROM_END' && where2 != 'LAST')) {
    // If the text is a variable or literal or doesn't require a call for
    // length, don't generate a helper function.
    var at1:string|number
    var at2:string|number
    switch (where1) {
      case 'FROM_START':
        at1 = this.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        at1 = this.getAdjusted(block, 'AT1', 1, false,
            this.ORDER.SUBTRACTION);
        at1 = text + '.length - ' + at1;
        break;
      case 'FIRST':
        at1 = '0';
        break;
      default:
        throw Error('Unhandled option (text_getSubstring).');
    }
    switch (where2) {
      case 'FROM_START':
        at2 = this.getAdjusted(block, 'AT2', 1);
        break;
      case 'FROM_END':
        at2 = this.getAdjusted(block, 'AT2', 0, false,
            this.ORDER.SUBTRACTION);
        at2 = text + '.length - ' + at2;
        break;
      case 'LAST':
        at2 = text + '.length';
        break;
      default:
        throw Error('Unhandled option (text_getSubstring).');
    }
    code = text + '.slice(' + at1 + ', ' + at2 + ')';
  } else {
    at1 = this.getAdjusted(block, 'AT1');
    at2 = this.getAdjusted(block, 'AT2');
    var getIndex_ = this.text_getIndex_;
    var wherePascalCase = {'FIRST': 'First', 'LAST': 'Last',
      'FROM_START': 'FromStart', 'FROM_END': 'FromEnd'};
    var functionName = this.provideFunction_(
        'subsequence' + wherePascalCase[where1] + wherePascalCase[where2],
        ['function ' + this.FUNCTION_NAME_PLACEHOLDER_ +
        '(sequence' +
        // The value for 'FROM_END' and'FROM_START' depends on `at` so
        // we add it as a parameter.
        ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', at1' : '') +
        ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', at2' : '') +
        ') {',
          '  var start = ' + getIndex_.call(this,'sequence', where1, 'at1') + ';',
          '  var end = ' + getIndex_.call(this,'sequence', where2, 'at2') + ' + 1;',
          '  return sequence.slice(start, end);',
          '}']);
    var code = functionName + '(' + text +
        // The value for 'FROM_END' and 'FROM_START' depends on `at` so we
        // pass it.
        ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', ' + at1 : '') +
        ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', ' + at2 : '') +
        ')';
  }
  return [code, this.ORDER.FUNCTION_CALL];
};

export function text_changeCase(this:TsGen,block:Blockly.Block) {
  // Change capitalization.
  var OPERATORS = {
    'UPPERCASE': '.toUpperCase()',
    'LOWERCASE': '.toLowerCase()',
    'TITLECASE': null
  };
  var operator = OPERATORS[block.getFieldValue('CASE')];
  var textOrder = operator ? this.ORDER.MEMBER :
      this.ORDER.NONE;
  var text = this.valueToCode(block, 'TEXT',
      textOrder) || '\'\'';
  if (operator) {
    // Upper and lower case are functions built into JavaScript.
    var code = text + operator;
  } else {
    // Title case is not a native JavaScript function.  Define one.
    var functionName = this.provideFunction_(
        'textToTitleCase',
        ['function ' + this.FUNCTION_NAME_PLACEHOLDER_ +
            '(str) {',
         '  return str.replace(/\\S+/g,',
         '      function(txt) {return txt[0].toUpperCase() + ' +
            'txt.substring(1).toLowerCase();});',
         '}']);
    var code = functionName + '(' + text + ')';
  }
  return [code, this.ORDER.FUNCTION_CALL];
};

export function text_trim(this:TsGen,block:Blockly.Block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': ".replace(/^[\\s\\xa0]+/, '')",
    'RIGHT': ".replace(/[\\s\\xa0]+$/, '')",
    'BOTH': '.trim()'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var text = this.valueToCode(block, 'TEXT',
      this.ORDER.MEMBER) || '\'\'';
  return [text + operator, this.ORDER.FUNCTION_CALL];
};

export function text_print(this:TsGen,block:Blockly.Block) {
  // Print statement.
  var msg = this.valueToCode(block, 'TEXT',
      this.ORDER.NONE) || '\'\'';
  return 'window.alert(' + msg + ');\n';
};

export function text_prompt_ext(this:TsGen,block:Blockly.Block) {
  var msg:string
  // Prompt function.
  if (block.getField('TEXT')) {
    // Internal message.
    msg = this.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    msg = this.valueToCode(block, 'TEXT',
        this.ORDER.NONE) || '\'\'';
  }
  var code = 'window.prompt(' + msg + ')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = 'Number(' + code + ')';
  }
  return [code, this.ORDER.FUNCTION_CALL];
};

export var text_prompt=text_prompt_ext

export function text_count(this:TsGen,block:Blockly.Block) {
  var text = this.valueToCode(block, 'TEXT',
      this.ORDER.MEMBER) || '\'\'';
  var sub = this.valueToCode(block, 'SUB',
      this.ORDER.NONE) || '\'\'';
  var functionName = this.provideFunction_(
      'textCount',
      ['function ' + this.FUNCTION_NAME_PLACEHOLDER_ +
          '(haystack, needle) {',
       '  if (needle.length === 0) {',
       '    return haystack.length + 1;',
       '  } else {',
       '    return haystack.split(needle).length - 1;',
       '  }',
       '}']);
  var code = functionName + '(' + text + ', ' + sub + ')';
  return [code, this.ORDER.SUBTRACTION];
};

export function text_replace(this:TsGen,block:Blockly.Block) {
  var text = this.valueToCode(block, 'TEXT',
      this.ORDER.MEMBER) || '\'\'';
  var from = this.valueToCode(block, 'FROM',
      this.ORDER.NONE) || '\'\'';
  var to = this.valueToCode(block, 'TO',
      this.ORDER.NONE) || '\'\'';
  // The regex escaping code below is taken from the implementation of
  // goog.string.regExpEscape.
  var functionName = this.provideFunction_(
      'textReplace',
      ['function ' + this.FUNCTION_NAME_PLACEHOLDER_ +
          '(haystack, needle, replacement) {',
       '  needle = ' +
           'needle.replace(/([-()\\[\\]{}+?*.$\\^|,:#<!\\\\])/g,"\\\\$1")',
       '                 .replace(/\\x08/g,"\\\\x08");',
       '  return haystack.replace(new RegExp(needle, \'g\'), replacement);',
       '}']);
  var code = functionName + '(' + text + ', ' + from + ', ' + to + ')';
  return [code, this.ORDER.MEMBER];
};

export function text_reverse(this:TsGen,block:Blockly.Block) {
  var text = this.valueToCode(block, 'TEXT',
      this.ORDER.MEMBER) || '\'\'';
  var code = text + '.split(\'\').reverse().join(\'\')';
  return [code, this.ORDER.MEMBER];
};
}