type Operator = '+' | '-' | '*' | '/'

export function mathExp(str: string): number {
  const src = str.trim()
  if (src === '') return 0
  const chars = charStream(src)
  return readExpression(chars)
}

/*
<Expression>  ::= <Summand>(("+"|"-")<Summand>)*
<Summand>     ::= <Factor>(("*"|"/")<Factor>)*
<Factor>      ::= <Number>|"("<Expression>")"|<Expression>
<Number>      ::= {"+"|"-"}(<Int>|<Int>"."<Digits>)
<Int>         ::= (<Digit>|<DigitNoZero><Digits>)
<Digits>      ::= <Digit>*
<Digit>       ::= "0"|<DigitNoZero>
<DigitNoZero> ::= "1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"
*/

const charStream = (str: string) => {
  let index = 0
  return {
    peek() {
      return str[index]
    },
    peekIsSummandOp() {
      return str[index] === '+' || str[index] === '-'
    },
    peekIsExpressionOp() {
      return str[index] === '*' || str[index] === '/'
    },
    peekIsInvalid() {
      return !/[0-9\.\+\-\*\/\(\)]/.test(str[index])
    },
    next() {
      return str[index++]
    },
    eof() {
      return index >= str.length
    },
  }
}

type CharStream = ReturnType<typeof charStream>

const operators: Record<Operator, (a: number, b: number) => number> = {
  '+': (a: number, b: number) => a + b,
  '-': (a: number, b: number) => a - b,
  '*': (a: number, b: number) => a * b,
  '/': (a: number, b: number) => a / b,
}

// <Expression>  ::= <Summand>(("+"|"-")<Summand>)*
function readExpression(chars: CharStream): number {
  let firstSummand = readSumand(chars)
  while (!chars.eof() && chars.peekIsSummandOp()) {
    const operator = chars.next() as '+' | '-'
    const summand = readSumand(chars)
    firstSummand = operators[operator](firstSummand, summand)
  }
  return firstSummand
}

// <Summand>     ::= <Factor>(("*"|"/")<Factor>)*
function readSumand(chars: CharStream): number {
  let firstFactor = readFactor(chars)
  while (!chars.eof() && chars.peekIsExpressionOp()) {
    const operator = chars.next() as '*' | '/'
    const factor = readFactor(chars)
    firstFactor = operators[operator](firstFactor, factor)
  }
  return firstFactor
}

// <Factor>      ::= <Value>|"("<Expression>")"|<Expression>
function readFactor(chars: CharStream): number {
  if (chars.eof() || chars.peekIsInvalid()) {
    return Number.NaN
  } else if (isValue(chars.peek())) {
    return readValue(chars)
  } else if (chars.peek() === '(') {
    chars.next()
    const expression = readExpression(chars)
    if (chars.next() !== ')') {
      throw new Error('Invalid close parenthesis')
    }
    return expression
  } else {
    return readExpression(chars)
  }
}

function isValue(char: string): boolean {
  return /[\d\.\+\-]/.test(char)
}

// <Value>      ::= {"+"|"-"}(<Int>|<Int>"."<Digit>*)
function readValue(chars: CharStream): number {
  const sign = chars.peek() === '-' || chars.peek() === '+' ? chars.next() : ''
  const firstDigit = readInt(chars)
  if (chars.peek() === '.') {
    chars.next()
    const restDigits = readDigits(chars)
    return Number(sign + firstDigit + '.' + restDigits)
  } else {
    return Number(sign + firstDigit)
  }
}

// <Int>         ::= (<Digit>|<DigitNoZero><Digits>)
function readInt(chars: CharStream): string {
  const firstDigit = readDigit(chars)
  if (firstDigit === '0') {
    return '0'
  } else {
    return firstDigit + readDigits(chars)
  }
}

// <Digits>      ::= <Digit>*
function readDigits(chars: CharStream): string {
  let digits = ''
  while (!chars.eof() && /[0-9]/.test(chars.peek())) {
    digits += readDigit(chars)
  }
  return digits
}

// <Digit>       ::= "0"|<DigitNoZero>
function readDigit(chars: CharStream): string {
  if (chars.peek() === '0') {
    return chars.next()
  } else {
    return readDigitNoZero(chars)
  }
}

// <DigitNoZero> ::= "1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"
function readDigitNoZero(chars: CharStream): string {
  const digit = chars.next()
  if (digit >= '1' && digit <= '9') {
    return digit
  } else {
    throw new Error('Invalid digit')
  }
}
