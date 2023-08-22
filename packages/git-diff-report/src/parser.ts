/*
 * @author: yanxianliang
 * @date: 2023-08-18 15:52
 * @desc: comment parser
 *
 * Copyright (c) 2023 by yanxianliang, All Rights Reserved.
 */

import {extend, isArray} from 'lodash';


type Block = { meta: { [key: string]: unknown[] }; from: number; to: number };


/*
  * Get the index of string inside of another
  */
function indexer(str: string, find: string) {
  return (str.indexOf(find) > 0) ? str.indexOf(find) : false
}

/*
 * Check for single-line comment
 *
 * @param (String) line to parse/check
 * @return (Boolean) result of check
 */
function singleLineComment(line: string) {
  return !!line.match(/^\s*\/\//)
}

/*
 * Checks for start of a multi-line comment
 *
 * @param (String) line to parse/check
 * @return (Boolean) result of check
 */
function startMultiLineComment(line: string) {
  return !!line.match(/^\s*\/\*/)
}

/*
 * Check for end of a multi-line comment
 *
 * @parse (String) line to parse/check
 * @return (Boolean) result of check
 */
function endMultiLineComment(line: string) {
  if (singleLineComment(line)) {
    return false
  }
  return !!line.match(/.*\*\//)
}

/*
 * Removes comment identifiers for single-line comments.
 *
 * @param (String) line to parse/check
 * @return (Boolean) result of check
 */
function parseSingleLine(line: string) {
  return line.replace(/\s*\/\//, '')
}

/*
 * Remove comment identifiers for multi-line comments.
 *
 * @param (String) line to parse/check
 * @return (Boolean) result of check
 */
function parseMultiLine(line: string) {
  const cleaned = line.replace(/\s*\/\*/, '')
  return cleaned.replace(/\*\//, '')
}


class DSS {
  parsers: { [key: string]: (line: { contents: string }) => any } = {};
  detect = (line: string) => true;

  detector = (detect: (line: string) => boolean) => {
    this.detect = detect;
  }

  parser = (name: string, fn: (line: { contents: string }) => any) => {
    this.parsers[name] = fn
  }

  alias = (newName: string, oldName: string) => {
    this.parsers[newName] = this.parsers[oldName]
  }

  trim = (str: string, arr?: RegExp[]) => {
    const defaults = [/^\s*:/, /:\s*$/, /^\s\s*/, /\s\s*$/]
    arr = (isArray(arr)) ? arr.concat(defaults) : defaults
    arr.forEach(function (regEx) {
      str = str.replace(regEx, '')
    })
    return str
  }


  squeeze = (str: string, def: string) => {
    return str.replace(/\s{2,}/g, def)
  }

  normalize = (textBlock: string) => {
    // Strip out any preceding [whitespace]* that occurs on every line
    return this.trim(textBlock.replace(/^(\s*\*+)/, ''))
  }

  parse = (lines: string, options: { preserve_whitespace?: boolean }) => {
    // Options
    options = (options) || {}
    options.preserve_whitespace = !!(options.preserve_whitespace)

    // Setup
    let currentBlock = ''
    let insideSingleLineBlock = false
    let insideMultiLineBlock = false
    const _blocks: Array<{ text: string; from: number; to: number }> = []
    let parsed = ''
    const blocks: Block[] = []

    let lineNum = 0
    let from = 0

    lines = lines + ''
    lines.split(/\n/).forEach((line) => {  // 获取每个注释中的内容
      // Iterate line number and ensure line is treaty as a string
      lineNum = lineNum + 1
      line = line + ''

      const isSingleLineComment = singleLineComment(line);
      const isMultiLineStart = startMultiLineComment(line);
      const isMultiLineEnd = endMultiLineComment(line);
      // Store starting line number
      if (isSingleLineComment || isMultiLineStart) {
        from = lineNum
      }

      // Parse Single line comment
      if (isSingleLineComment) {
        parsed = parseSingleLine(line)
        if (insideSingleLineBlock) {
          currentBlock += '\n' + parsed
        } else {
          currentBlock = parsed
          insideSingleLineBlock = true
        }
      }


      // 多行注释，需要考虑换行及

      // Parse multi-line comments
      if (isMultiLineStart || insideMultiLineBlock) {
        parsed = parseMultiLine(line)
        if (insideMultiLineBlock) {
          currentBlock += '\n' + parsed
        } else {
          currentBlock += parsed
          insideMultiLineBlock = true
        }
      }

      // End a multi-line block
      if (isMultiLineEnd) {
        insideMultiLineBlock = false
      }

      // Store current block if done
      if (!isSingleLineComment && !insideMultiLineBlock) {
        if (currentBlock) {
          _blocks.push({text: this.normalize(currentBlock), from, to: lineNum})
        }
        insideSingleLineBlock = false
        currentBlock = ''
      }
    })

    // Create new blocks with custom parsing
    _blocks.forEach((block) => {
      // Store line numbers
      const from = block.from
      const to = block.to

      // Remove extra whitespace
      const blockString = block.text.split('\n').filter((line) => {
        return (this.trim(this.normalize(line)))
      }).join('\n')

      let temp: { [key: string]: unknown[] } = {}
      // Split block into lines
      blockString.split('\n').forEach((line) => {
        if (this.detect(line)) {
          temp = this._parse(temp, this.normalize(line), blockString, lines, from, to, options)
        }
      })
      blocks.push({
        meta: temp,
        from: from,
        to: to
      });
    })

    return blocks;
  }

  _parse = (temp: {
    [key: string]: unknown[]
  }, line: string, block: string, file: string, from: number, to: number, options: {
    preserve_whitespace?: boolean
  }) => {
    const parts = line.replace(/.*@/, '')

    const index = indexer(parts, ":") || indexer(parts, "：") || indexer(parts, ' ') || indexer(parts, '\n') || indexer(parts, '\r') || parts.length
    const name = this.trim(parts.substr(0, index))
    const output = {
      options,
      file,
      name,
      line: {
        contents: this.trim(parts.substr(index)),
        from: block.indexOf(line),
        to: block.indexOf(line)
      },
      block: {
        contents: block,
        from,
        to
      }
    }

    // find the next instance of a parser (if there is one based on the @ symbol)
    // in order to isolate the current multi-line parser
    const nextParserIndex = block.indexOf('* @', output.line.from + 1)
    const markupLength = (nextParserIndex > -1) ? nextParserIndex - output.line.from : block.length
    let contents = block.split('').splice(output.line.from, markupLength).join('')
    const parserMarker = '@' + name
    contents = contents.replace(parserMarker, '')

    // Redefine output contents to support multiline contents
    output.line.contents = ((contents) => {
      const ret: string[] = []
      const lines = contents.split('\n')

      lines.forEach((line, i) => {
        const pattern = '*'
        const index = line.indexOf(pattern)

        if (index >= 0 && index < 10) {
          line = line.split('').splice((index + pattern.length), line.length).join('')
        }

        // Trim whitespace from the the first line in multiline contents
        if (i === 0) {
          line = this.trim(line)
        }

        if (line.trim() && line.indexOf(parserMarker) === -1) {
          ret.push(line)
        }
      })

      return ret.join('\n')
    })(contents)

    const tempContent = (this.parsers[name]) ? this.parsers[name].call(output, output.line) : output.line.contents;
    if (temp[name]) {
      if (!isArray(temp[name])) {
        temp[name] = [temp[name]]
      }
      if (!isArray(tempContent)) {
        temp[name].push(tempContent)
      } else {
        temp[name].push(tempContent[0])
      }
    } else {
      temp = extend(temp, {[name]: tempContent})
    }
    return temp
  };
}


const dss = new DSS();

// Describe default detection pattern
dss.detector((line: string) => {
  if (typeof line !== 'string') {
    return false
  }
  const reference = line.split('\n\n').pop()
  return !!reference?.match(/.*@/)
})

// Describe default parsing of a name
dss.parser('name', (line) => {
  return line.contents;
})

// Describe default parsing of a description
dss.parser('description', function (line) {
  return line.contents
})

// Describe default parsing of a state
dss.parser('state', function (line) {
  const state = line.contents.split(' - ')
  return [{
    name: (state[0]) ? dss.trim(state[0]) : '',
    escaped: (state[0]) ? dss.trim(state[0].replace('.', ' ').replace(':', ' pseudo-class-')) : '',
    description: (state[1]) ? dss.trim(state[1]) : ''
  }]
})

// Describe default parsing of a piece markup
dss.parser('markup', function (line) {
  return [{
    example: line.contents,
    escaped: line.contents.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }]
})

export const parse = dss.parse;
