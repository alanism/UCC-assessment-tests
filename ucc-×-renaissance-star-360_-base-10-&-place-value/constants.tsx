
import { Problem, MathOperation, Difficulty, GradeLevel } from './types';

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function buildTableProblem(
  title: string, 
  labels: string[], 
  values: (number | string)[], 
  answer: number | string, 
  difficulty: Difficulty, 
  grade: GradeLevel,
  op: MathOperation = MathOperation.Add,
  hints: string[] = ["Check the tens place.", "Count the single units."],
  emoji: string = "💎",
  question: string = "What is the total value?"
): Problem {
  return {
    difficulty,
    grade,
    title,
    tableData: labels.map((label, i) => ({ 
      label, 
      value: (values[i] === "?" || typeof values[i] === 'string' && isNaN(Number(values[i]))) ? 0 : Number(values[i]),
      displayValue: values[i].toString()
    })),
    question,
    correctAnswer: answer,
    expectedOp: op,
    hints,
    emoji
  };
}

// GRADE 3 - LEVEL 1
function schema3_blocks() {
  const tens = rand(1, 4);
  const ones = rand(1, 9);
  const total = tens * 10 + ones;

  return buildTableProblem(
    "Base-10 Blocks",
    ["Tens", "Ones", "Total Value"],
    [tens, ones, "?"],
    total,
    1,
    3,
    MathOperation.Add,
    ["Each ten block is worth 10.", "Add the ones to the tens total."],
    "🟦",
    "What is the total numeric value represented?"
  );
}

function schema3_compare() {
  const aT = rand(1, 4), aO = rand(1, 9);
  const bT = rand(1, 4), bO = rand(1, 9);
  const a = aT * 10 + aO;
  const b = bT * 10 + bO;

  return buildTableProblem(
    "Value Comparison",
    ["A", "B"],
    [a, b],
    a > b ? "A" : "B",
    1,
    3,
    MathOperation.Add,
    ["Compare the tens first.", "If tens are the same, check the ones."],
    "⚖️",
    "Which group has the higher value? (Enter A or B)"
  );
}

// GRADE 4 - LEVEL 2
function schema4_regroup() {
  const a = rand(20, 49);
  const b = rand(20, 49);
  return buildTableProblem(
    "Regrouping Test",
    ["Number A", "Number B", "Total Sum"],
    [a, b, "?"],
    a + b,
    2,
    4,
    MathOperation.Add,
    ["Add ones first.", "Regroup if the ones exceed 10."],
    "📦",
    "What is the sum of these two values?"
  );
}

function schema4_tens() {
  const n = rand(30, 89);
  return buildTableProblem(
    "Tens Extraction",
    ["Full Number", "Whole Tens"],
    [n, "?"],
    Math.floor(n / 10),
    2,
    4,
    MathOperation.Add,
    ["Divide the number by 10.", "How many full groups of ten are there?"],
    "🥢",
    "How many whole tens are contained in this number?"
  );
}

// GRADE 5 - LEVEL 3
function schema5_missing() {
  const hundreds = rand(1, 9);
  const tens = rand(1, 9);
  const ones = rand(1, 9);
  const number = hundreds * 100 + tens * 10 + ones;

  return buildTableProblem(
    "Missing Place Value",
    ["Hundreds", "Missing Place", "Ones", "Target Number"],
    [hundreds, "?", ones, number],
    tens,
    3,
    5,
    MathOperation.Add,
    ["Look at the digit in the tens place.", "The second column represents the tens."],
    "🔎",
    "What digit is missing from the tens place?"
  );
}

function schema5_compareTens() {
  const a = rand(200, 600);
  const tens = rand(10, 90);
  const b = tens * 10;

  return buildTableProblem(
    "Bulk Comparison",
    ["Amount A", "Amount B (as tens)"],
    [a, `${tens} tens`],
    a > b ? "A" : "B",
    3,
    5,
    MathOperation.Add,
    ["Convert the 'tens' into a number by multiplying by 10.", "Compare Group A and Group B."],
    "💰",
    "Which amount is greater? (Enter A or B)"
  );
}

// GRADE 6 - LEVEL 4
function schema6_decimalValue() {
  const whole = rand(10, 99);
  const d1 = rand(1, 9);
  const d2 = rand(1, 9);
  const num = `${whole}.${d1}${d2}`;
  return buildTableProblem(
    "Decimal Value",
    ["Full Number", "Tenths Digit Value"],
    [num, "?"],
    (d1 * 0.1).toFixed(1),
    4,
    6,
    MathOperation.Fraction,
    ["The first digit after the decimal is the tenths place.", "Value = Digit / 10."],
    "🔬",
    "What is the exact value of the digit in the tenths place?"
  );
}

function schema6_decimalCompare() {
  const aVal = rand(1, 9) / 10;
  const bVal = rand(1, 9) / 100 + 0.5;
  const a = aVal.toFixed(1);
  const b = bVal.toFixed(2);

  return buildTableProblem(
    "Decimal Comparison",
    ["Value A", "Value B"],
    [a, b],
    parseFloat(a) > parseFloat(b) ? "A" : "B",
    4,
    6,
    MathOperation.Fraction,
    ["Align the decimal points.", "Compare place by place starting from the left."],
    "🚥",
    "Which decimal value is larger? (Enter A or B)"
  );
}

// GRADE 7 - LEVEL 5
function schema7_powerTen() {
  const baseVal = rand(10, 99) / 10;
  const base = baseVal.toFixed(1);
  return buildTableProblem(
    "Powers of Ten",
    ["Base Value", "×100 Scaling"],
    [base, "?"],
    (parseFloat(base) * 100).toString(),
    5,
    7,
    MathOperation.Multiply,
    ["Multiplying by 100 shifts the decimal point two places to the right."],
    "⚡",
    "What is the result when the base value is multiplied by 100?"
  );
}

function schema7_tenths() {
  const nVal = rand(10, 99) / 10;
  const n = nVal.toFixed(1);
  return buildTableProblem(
    "Total Tenths",
    ["Number", "Total Tenths Count"],
    [n, "?"],
    Math.round(parseFloat(n) * 10),
    5,
    7,
    MathOperation.Multiply,
    ["How many units of 0.1 fit into this number?", "Multiply by 10."],
    "📏",
    "How many total tenths are in this number?"
  );
}

export function generateProblem(difficulty: Difficulty): Problem {
  const schemas: Record<Difficulty, (() => Problem)[]> = {
    1: [schema3_blocks, schema3_compare],
    2: [schema4_regroup, schema4_tens],
    3: [schema5_missing, schema5_compareTens],
    4: [schema6_decimalValue, schema6_decimalCompare],
    5: [schema7_powerTen, schema7_tenths]
  };

  const options = schemas[difficulty] || [schema3_blocks];
  const pick = options[Math.floor(Math.random() * options.length)];
  return pick();
}
