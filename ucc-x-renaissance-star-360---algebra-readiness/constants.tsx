
import { Problem, MathOperation, Difficulty, GradeLevel } from './types';

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function buildTableProblem(
  title: string, 
  domain: string,
  labels: string[], 
  values: (number | string)[], 
  answer: number, 
  difficulty: Difficulty, 
  grade: GradeLevel,
  op: MathOperation,
  hints: string[],
  emoji: string,
  question: string
): Problem {
  return {
    difficulty,
    grade,
    title,
    domain,
    tableData: labels.map((label, i) => ({ 
      label, 
      value: values[i] === "?" ? 0 : Number(values[i]),
      displayValue: values[i].toString()
    })),
    question,
    correctAnswer: answer,
    expectedOp: op,
    hints,
    emoji
  };
}

// Grade 3 (Difficulty 1) - Missing Addend
function schema3_missingSum() {
  const a = rand(10, 30);
  const b = rand(10, 30);
  const c = rand(10, 30);
  const total = a + b + c;
  return buildTableProblem(
    "Stickers Collection", 
    "Measurement",
    ["Mon", "Tue", "Wed", "Total"], 
    [a, "?", c, total], 
    b, 1, 3,
    MathOperation.Add, 
    ["Look at the Total first.", `Subtract the known days from ${total}.`, `Total - Mon - Wed = ?`], 
    "🏷️",
    "What is the missing value for Tuesday?"
  );
}

// Grade 4 (Difficulty 2) - Inverse Addition/Subtraction
function schema4_missingDifference() {
  const total = rand(50, 100);
  const a = rand(15, 40);
  const b = total - a;
  return buildTableProblem(
    "Library Books", 
    "Word Problems",
    ["Mia's Books", "Leo's Books", "Total"], 
    [a, "?", total], 
    b, 2, 4,
    MathOperation.Subtract, 
    [`We know the Total is ${total}.`, `If Mia has ${a}, what's left for Leo?`, `${total} - ${a} = ?`], 
    "📚",
    "What is the missing value for Leo's Books?"
  );
}

// Grade 5 (Difficulty 3) - Multiplier/Factor Unknown
function schema5_missingMultiplier() {
  const a = rand(4, 12);
  const b = rand(5, 12);
  const total = a * b;
  return buildTableProblem(
    "Crayon Supplies", 
    "Measurement",
    ["Boxes", "Crayons per Box", "Total Crayons"], 
    [a, "?", total], 
    b, 3, 5,
    MathOperation.Multiply, 
    [`There are ${a} boxes in total.`, `To find 'per box', we need to divide the total.`, `${total} ÷ ${a} = ?`], 
    "🖍️",
    "What is the missing number of crayons in each box?"
  );
}

// Grade 6 (Difficulty 4) - Fractional/Ratio Unknown
function schema6_fractionUnknown() {
  const total = rand(40, 100);
  const evenTotal = total % 2 === 0 ? total : total + 1;
  const left = evenTotal * 0.5;
  return buildTableProblem(
    "Juice Inventory", 
    "Fractions",
    ["Starting Bottles", "Bottles Used", "Bottles Left"], 
    [evenTotal, "?", left], 
    left, 4, 6,
    MathOperation.Fraction, 
    [`Start with ${evenTotal} bottles.`, `If ${left} are left, how many were taken?`, `${evenTotal} - ${left} = ?`], 
    "🧃",
    "What is the missing value for Bottles Used?"
  );
}

// Grade 7 Stretch (Difficulty 5) - Two-Step Algebraic Logic
function schema7_twoStep() {
  const x = rand(15, 45);
  const a = rand(10, 30);
  const constant = 20;
  const total = x + a + constant;
  return buildTableProblem(
    "Event Tickets", 
    "Word Problems",
    ["Sold", "Staff Holds", "Reserved", "Grand Total"], 
    ["?", a, constant, total], 
    x, 5, 7,
    MathOperation.Subtract, 
    [`The grand total is ${total}.`, `Subtract the known Staff and Reserved counts first.`, `${total} - ${a} - ${constant} = ?`], 
    "🎟️",
    "What is the missing value for Tickets Sold?"
  );
}

export function generateProblem(difficulty: Difficulty): Problem {
  const schemas: Record<Difficulty, (() => Problem)[]> = {
    1: [schema3_missingSum],
    2: [schema4_missingDifference],
    3: [schema5_missingMultiplier],
    4: [schema6_fractionUnknown],
    5: [schema7_twoStep]
  };

  const options = schemas[difficulty] || [schema3_missingSum];
  const pick = options[Math.floor(Math.random() * options.length)];
  return pick();
}
