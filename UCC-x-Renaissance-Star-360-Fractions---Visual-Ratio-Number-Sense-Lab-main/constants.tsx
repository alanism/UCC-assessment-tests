
import { Problem, MathOperation, Difficulty, GradeLevel } from './types';

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function buildTableProblem(
  title: string, 
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

// Grade 3 (Difficulty 1) - Fractions as parts of a whole
function schema3_missingPartCount() {
  const total = rand(10, 20);
  const partA = rand(2, Math.floor(total / 2));
  const partB = rand(2, total - partA - 1);
  const missing = total - partA - partB;
  
  return buildTableProblem(
    "Tile Collection", 
    ["Blue Tiles", "Red Tiles", "Green Tiles", "Total Set"], 
    [partA, partB, "?", total], 
    missing, 1, 3,
    MathOperation.Add, 
    [`The total number of items is ${total}.`, `Subtract the known colors from the total.`, `${total} - ${partA} - ${partB} = ?`], 
    "🟦",
    "How many tiles are missing from the collection?"
  );
}

// Grade 4 (Difficulty 2) - Fractions as numbers (Equivalence)
function schema4_equivalence() {
  const multipliers = [2, 3, 4, 5];
  const mult = multipliers[rand(0, multipliers.length - 1)];
  const numerator = rand(1, 4);
  const denominator = rand(numerator + 1, 10);
  const equivalentNumerator = numerator * mult;
  const equivalentDenominator = denominator * mult;

  return buildTableProblem(
    "Fraction Scaling", 
    ["Original Numerator", "Original Denominator", "Scaled Numerator", "Scaled Denominator"], 
    [numerator, denominator, "?", equivalentDenominator], 
    equivalentNumerator, 2, 4,
    MathOperation.Multiply, 
    [`To scale a fraction, multiply top and bottom by the same number.`, `Look at the denominators: ${denominator} becomes ${equivalentDenominator}.`, `What number was ${denominator} multiplied by?`], 
    "📏",
    "What is the missing numerator for the equivalent fraction?"
  );
}

// Grade 5 (Difficulty 3) - Fractions as operators
function schema5_operator() {
  const unit = rand(4, 12);
  const denom = rand(2, 5);
  const num = rand(1, denom - 1);
  const total = unit * denom;
  const taken = unit * num;
  const remaining = total - taken;

  return buildTableProblem(
    "Garden Harvest", 
    ["Total Fruits", "Fraction Taken", "Fruits Remaining"], 
    [total, `${num}/${denom}`, "?"], 
    remaining, 3, 5,
    MathOperation.Fraction, 
    [`First, find 1/${denom} of ${total} by dividing.`, `If ${num}/${denom} are taken, then ${denom-num}/${denom} are left.`, `Multiply the unit value by the remaining parts.`], 
    "🍎",
    "How many fruits are remaining in the basket?"
  );
}

// Grade 6 (Difficulty 4) - Fractions as ratios
function schema6_ratio() {
  const unit = rand(3, 8);
  const ratioA = rand(2, 5);
  const ratioB = rand(ratioA + 1, 7);
  const countA = unit * ratioA;
  const countB = unit * ratioB;
  const total = countA + countB;

  return buildTableProblem(
    "Color Mix", 
    ["Yellow Paint (Parts)", "Blue Paint (Parts)", "Total Liters"], 
    [ratioA, ratioB, total], 
    countB, 4, 6,
    MathOperation.Multiply, 
    [`The ratio is ${ratioA}:${ratioB}. This means there are ${ratioA + ratioB} total parts.`, `Divide the total liters (${total}) by the total parts.`, `Multiply the liters per part by the blue parts (${ratioB}).`], 
    "🎨",
    "How many liters of Blue Paint were used in the mix?"
  );
}

// Grade 7 (Difficulty 5) - Algebraic Fractions
function schema7_algebraic() {
  // x + 3/4x = total => 1.75x = total
  // Let x be a multiple of 4 to keep things whole
  const unitX = rand(5, 15) * 4;
  const fractionNum = 3;
  const fractionDenom = 4;
  const groupB = (unitX * fractionNum) / fractionDenom;
  const total = unitX + groupB;

  return buildTableProblem(
    "Population Study", 
    ["Group A (Full)", "Group B (3/4 of A)", "Total Combined"], 
    ["?", groupB, total], 
    unitX, 5, 7,
    MathOperation.Subtract, 
    [`Group B is 3/4 the size of Group A.`, `If you know the total and Group B, subtraction is the fastest logic path.`, `${total} - ${groupB} = ?`], 
    "👥",
    "What is the missing count for Group A?"
  );
}

export function generateProblem(difficulty: Difficulty): Problem {
  const schemas: Record<Difficulty, (() => Problem)[]> = {
    1: [schema3_missingPartCount],
    2: [schema4_equivalence],
    3: [schema5_operator],
    4: [schema6_ratio],
    5: [schema7_algebraic]
  };

  const options = schemas[difficulty] || [schema3_missingPartCount];
  const pick = options[Math.floor(Math.random() * options.length)];
  return pick();
}
