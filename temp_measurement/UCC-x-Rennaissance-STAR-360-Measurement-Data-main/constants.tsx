
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

// DIFFICULTY 1 - GRADE 3: READ & ADD
function schema1_1_SalesLog() {
  const mon = rand(5, 15);
  const tue = rand(5, 15);
  const wed = rand(5, 15);
  const total = mon + tue + wed;
  return buildTableProblem(
    "Sales Log", 
    ["Monday Units", "Tuesday Units", "Wednesday Units", "3-Day Total"], 
    [mon, tue, wed, "?"], 
    total, 1, 3, MathOperation.Add,
    ["Sum all the daily units.", "Look at the columns: mon + tue + wed."], "📦",
    "What changed in the total inventory after 3 days?"
  );
}

function schema1_2_ClockDiff() {
  const start = rand(1, 4);
  const duration = rand(2, 6);
  const end = start + duration;
  return buildTableProblem(
    "Travel Duration", 
    ["Departure (PM)", "Arrival (PM)", "Travel Time"], 
    [start, end, "?"], 
    duration, 1, 3, MathOperation.Subtract,
    ["Subtract start time from end time.", "How many hours passed?"], "⏰",
    "How long was the journey?"
  );
}

function schema1_3_HeightChart() {
  const h1 = rand(120, 150);
  const diff = rand(5, 15);
  const h2 = h1 + diff;
  return buildTableProblem(
    "Height Comparison", 
    ["Tree A (cm)", "Tree B (cm)", "Difference"], 
    [h1, h2, "?"], 
    diff, 1, 3, MathOperation.Subtract,
    ["Subtract the shorter height from the taller height.", "Tree B - Tree A = ?"], "🌳",
    "How much taller is the second tree?"
  );
}

// DIFFICULTY 2 - GRADE 4: COMPARE & CONVERT
function schema2_1_TimeConversion() {
  const hours = rand(2, 5);
  const mins = hours * 60;
  return buildTableProblem(
    "Flight Timer", 
    ["Duration (Hours)", "Duration (Minutes)"], 
    [hours, "?"], 
    mins, 2, 4, MathOperation.Multiply,
    ["There are 60 minutes in 1 hour.", "Multiply the hours by 60."], "✈️",
    "How many minutes did the plane stay in the air?"
  );
}

function schema2_2_LengthConvert() {
  const meters = rand(5, 20);
  const cm = meters * 100;
  return buildTableProblem(
    "Field Measure", 
    ["Length (Meters)", "Length (Centimeters)"], 
    [meters, "?"], 
    cm, 2, 4, MathOperation.Multiply,
    ["1 meter equals 100 centimeters.", "Multiply the meter count by 100."], "📏",
    "What is the total length in centimeters?"
  );
}

function schema2_3_WeightCompare() {
  const kg = rand(2, 8);
  const grams = kg * 1000;
  return buildTableProblem(
    "Cargo Weight", 
    ["Box A (kg)", "Box B (g)"], 
    [kg, "?"], 
    grams, 2, 4, MathOperation.Multiply,
    ["1 kg = 1000 g.", "If Box B is identical to Box A, what is its mass in grams?"], "⚖️",
    "How much does Box B weigh in grams?"
  );
}

// DIFFICULTY 3 - GRADE 5: MULTI-STEP
function schema3_1_Reservoir() {
  const start = rand(80, 100);
  const loss1 = rand(10, 20);
  const loss2 = rand(10, 20);
  const final = start - loss1 - loss2;
  return buildTableProblem(
    "Water Reserve", 
    ["Initial (Liters)", "Day 1 Loss", "Day 2 Loss", "Final Volume"], 
    [start, loss1, loss2, "?"], 
    final, 3, 5, MathOperation.Subtract,
    ["Start with the initial amount.", "Subtract both losses to find the remainder."], "💧",
    "How much water is left in the reservoir?"
  );
}

function schema3_2_RoadTrip() {
  const leg1 = rand(40, 60);
  const leg2 = rand(30, 50);
  const leg3 = rand(20, 40);
  const total = leg1 + leg2 + leg3;
  return buildTableProblem(
    "Odometer Reading", 
    ["Leg 1 (km)", "Leg 2 (km)", "Leg 3 (km)", "Total Distance"], 
    [leg1, leg2, leg3, "?"], 
    total, 3, 5, MathOperation.Add,
    ["Sum all segments of the trip.", "L1 + L2 + L3 = Total."], "🚗",
    "How far did the driver travel in total?"
  );
}

function schema3_3_Inventory() {
  const weightPerUnit = rand(2, 5);
  const count = rand(5, 10);
  const boxWeight = rand(1, 3);
  const total = (weightPerUnit * count) + boxWeight;
  return buildTableProblem(
    "Shipping Container", 
    ["Item Weight", "Item Count", "Empty Box Weight", "Gross Weight"], 
    [weightPerUnit, count, boxWeight, "?"], 
    total, 3, 5, MathOperation.Add,
    ["Multiply item weight by count.", "Add the weight of the empty box."], "📦",
    "What is the total weight of the loaded container?"
  );
}

// DIFFICULTY 4 - GRADE 6: FRACTION OF QUANTITY
function schema4_1_FuelTank() {
  const capacity = rand(10, 20) * 4;
  const used = (capacity * 3) / 4;
  const left = capacity - used;
  return buildTableProblem(
    "Fuel Gauge", 
    ["Max Capacity (L)", "Fraction Consumed", "Fuel Remaining"], 
    [capacity, "3/4", "?"], 
    left, 4, 6, MathOperation.Fraction,
    ["Calculate 3/4 of the capacity.", "Subtract that from the total capacity."], "⛽",
    "How much fuel is still in the tank?"
  );
}

function schema4_2_WorkshopTime() {
  const totalTime = rand(2, 6) * 30; // 60, 90, 120, 150, 180...
  const finished = (totalTime * 2) / 3;
  const remaining = totalTime - finished;
  return buildTableProblem(
    "Project Timer", 
    ["Total Time (min)", "Fraction Complete", "Time Remaining"], 
    [totalTime, "2/3", "?"], 
    remaining, 4, 6, MathOperation.Fraction,
    ["Find 2/3 of the total time.", "How many minutes are left until completion?"], "🛠️",
    "How long until the project is finished?"
  );
}

function schema4_3_TrailMap() {
  const length = rand(10, 30) * 5;
  const completed = (length * 2) / 5;
  return buildTableProblem(
    "Hiking Progress", 
    ["Trail Length (km)", "Fraction Traveled", "Distance Walked"], 
    [length, "2/5", "?"], 
    completed, 4, 6, MathOperation.Fraction,
    ["Multiply the total length by the fraction.", "Find 2/5 of the total distance."], "🥾",
    "How far has the hiker traveled so far?"
  );
}

// DIFFICULTY 5 - GRADE 7: RATES & MODELING
function schema5_1_Velocity() {
  const time = rand(2, 5);
  const speed = rand(60, 90);
  const dist = speed * time;
  return buildTableProblem(
    "Express Route", 
    ["Speed (km/h)", "Time (hours)", "Distance"], 
    [speed, time, "?"], 
    dist, 5, 7, MathOperation.Multiply,
    ["Distance = Speed × Time.", "Calculate total travel based on the rate."], "🚅",
    "How far did the train travel?"
  );
}

function schema5_2_FlowRate() {
  const rate = rand(5, 12);
  const time = rand(10, 20);
  const total = rate * time;
  return buildTableProblem(
    "Pipeline Output", 
    ["Rate (L/min)", "Duration (min)", "Total Volume"], 
    [rate, time, "?"], 
    total, 5, 7, MathOperation.Multiply,
    ["Multiply the flow rate by the duration.", "Liters per minute × Minutes."], "🌊",
    "How much water passed through the pipe?"
  );
}

function schema5_3_ModelEfficiency() {
  const fuel = rand(20, 40);
  const efficiency = rand(8, 12); // km per liter
  const range = fuel * efficiency;
  return buildTableProblem(
    "Range Estimation", 
    ["Fuel (Liters)", "Efficiency (km/L)", "Max Range"], 
    [fuel, efficiency, "?"], 
    range, 5, 7, MathOperation.Multiply,
    ["Multiply fuel by efficiency rate.", "Calculate the total distance possible."], "🏎️",
    "What is the maximum distance the vehicle can travel?"
  );
}

export function generateProblem(difficulty: Difficulty): Problem {
  const schemas: Record<Difficulty, (() => Problem)[]> = {
    1: [schema1_1_SalesLog, schema1_2_ClockDiff, schema1_3_HeightChart],
    2: [schema2_1_TimeConversion, schema2_2_LengthConvert, schema2_3_WeightCompare],
    3: [schema3_1_Reservoir, schema3_2_RoadTrip, schema3_3_Inventory],
    4: [schema4_1_FuelTank, schema4_2_WorkshopTime, schema4_3_TrailMap],
    5: [schema5_1_Velocity, schema5_2_FlowRate, schema5_3_ModelEfficiency]
  };

  const options = schemas[difficulty] || [schema1_1_SalesLog];
  const pick = options[Math.floor(Math.random() * options.length)];
  return pick();
}
