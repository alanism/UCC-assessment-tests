
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

// DIFFICULTY 1 - GRADE 3: COUNTABLE SPACE
function schema3_perimeter() {
  const w = rand(3, 7);
  const h = rand(2, 5);
  const perimeter = 2 * (w + h);
  return buildTableProblem(
    "Boundary Map", 
    ["Width (units)", "Height (units)", "Total Boundary"], 
    [w, h, "?"], 
    perimeter, 1, 3, MathOperation.Add,
    ["The boundary is the path all the way around.", "Add up all four sides."], "🧱",
    "How many units go all the way around this shape?"
  );
}

function schema3_tiles() {
  const rows = rand(3, 6);
  const cols = rand(2, 5);
  const total = rows * cols;
  return buildTableProblem(
    "Tile Grid", 
    ["Rows", "Columns", "Total Tiles"], 
    [rows, cols, "?"], 
    total, 1, 3, MathOperation.Multiply,
    ["Count how many tiles are in the floor pattern.", "Multiply rows by columns."], "⬛",
    "How many tiles cover this floor?"
  );
}

function schema3_shapes() {
  const squares = rand(2, 4);
  const triangles = rand(3, 6);
  const totalSides = (squares * 4) + (triangles * 3);
  return buildTableProblem(
    "Shape Collection",
    ["Square Count", "Triangle Count", "Total Sides"],
    [squares, triangles, "?"],
    totalSides, 1, 3, MathOperation.Add,
    ["Squares have 4 sides. Triangles have 3 sides.", "Add them all up."], "📐",
    "How many edges are in this collection?"
  );
}

// DIFFICULTY 2 - GRADE 4: MEASURED SPACE
function schema4_area() {
  const l = rand(4, 10);
  const w = rand(3, 8);
  const area = l * w;
  return buildTableProblem(
    "Surface Measure", 
    ["Length (u)", "Width (u)", "Area"], 
    [l, w, "?"], 
    area, 2, 4, MathOperation.Multiply,
    ["Area is the space inside the rectangle.", "Multiply the length by the width."], "🟦",
    "How many square units fill this space?"
  );
}

function schema4_angle() {
  const a = rand(30, 120);
  const b = rand(30, 120);
  const missing = 360 - (a + b);
  return buildTableProblem(
    "Angle Rotation", 
    ["Known Angle A", "Known Angle B", "Missing Part"], 
    [a, b, "?"], 
    missing, 2, 4, MathOperation.Subtract,
    ["A full circle is 360 degrees.", "Subtract the parts you know from 360."], "🎯",
    "How many degrees are in the missing part?"
  );
}

function schema4_symmetry() {
  const half = rand(5, 12);
  const total = half * 2;
  return buildTableProblem(
    "Mirror Image",
    ["Left Side Width", "Right Side Width", "Full Width"],
    [half, half, "?"],
    total, 2, 4, MathOperation.Add,
    ["The shape is perfectly symmetrical.", "The full width is twice the half."], "🦋",
    "How much space is covered by the full shape?"
  );
}

// DIFFICULTY 3 - GRADE 5: COMBINED SPACE
function schema5_composite_area() {
  const w1 = rand(3, 5);
  const h1 = rand(4, 6);
  const w2 = rand(2, 4);
  const h2 = rand(2, 4);
  const total = (w1 * h1) + (w2 * h2);
  return buildTableProblem(
    "Combined Space", 
    ["Part A Area", "Part B Area", "Total Floor"], 
    [w1 * h1, w2 * h2, "?"], 
    total, 3, 5, MathOperation.Add,
    ["Find the area of each piece first.", "Combine them into one total."], "🏗️",
    "What is the total space of these two joined rooms?"
  );
}

function schema5_coordinates() {
  const x = rand(2, 9);
  const y = rand(2, 9);
  return buildTableProblem(
    "Coordinate Grid", 
    ["Steps Right (x)", "Steps Up (y)", "Combined Distance"], 
    [x, y, "?"], 
    x + y, 3, 5, MathOperation.Add,
    ["Look at the star's position.", "Add the right-move and up-move together."], "⭐",
    "How many units did the star move from the corner?"
  );
}

function schema5_prism() {
  const baseArea = rand(10, 20);
  const height = rand(3, 6);
  const volume = baseArea * height;
  return buildTableProblem(
    "Prism Volume",
    ["Base Area (sq u)", "Height (u)", "Volume"],
    [baseArea, height, "?"],
    volume, 3, 5, MathOperation.Multiply,
    ["Volume is base area times height.", "Imagine layers of tiles stacked up."], "🧊",
    "How many cubes fill this shape?"
  );
}

// DIFFICULTY 4 - GRADE 6: SCALED & 3D
function schema6_scale() {
  const scale = rand(5, 15);
  const mapDist = rand(3, 8);
  const realDist = scale * mapDist;
  return buildTableProblem(
    "Map Scale", 
    ["Scale (1u = ?km)", "Map Distance", "Real Distance"], 
    [scale, mapDist, "?"], 
    realDist, 4, 6, MathOperation.Multiply,
    ["Every map unit represents several real kilometers.", "Multiply by the scale factor."], "🗺️",
    "What is the real distance across the territory?"
  );
}

function schema6_volume() {
  const l = rand(3, 5);
  const w = rand(2, 4);
  const h = rand(2, 4);
  const vol = l * w * h;
  return buildTableProblem(
    "Container Volume", 
    ["L", "W", "H", "Unit Cubes"], 
    [l, w, h, "?"], 
    vol, 4, 6, MathOperation.Multiply,
    ["Volume = L × W × H.", "Count how many unit cubes fit inside the box."], "📦",
    "How many unit cubes fill this entire space?"
  );
}

function schema6_surface() {
  const side = rand(3, 5);
  const faces = 6;
  const area = (side * side) * faces;
  return buildTableProblem(
    "Cube Surface",
    ["One Face Area", "Face Count", "Total Skin"],
    [side * side, faces, "?"],
    area, 4, 6, MathOperation.Multiply,
    ["A cube has 6 identical faces.", "Find one face and multiply by 6."], "🎲",
    "How much wrapping paper is needed to cover this cube?"
  );
}

// DIFFICULTY 5 - GRADE 7: ENGINEERING SPACE
function schema7_cutout() {
  const outerW = rand(10, 15);
  const outerH = rand(8, 12);
  const innerW = rand(3, 5);
  const innerH = rand(2, 4);
  const area = (outerW * outerH) - (innerW * innerH);
  return buildTableProblem(
    "Metal Frame", 
    ["Outer Plate Area", "Hole Cutout Area", "Remaining Metal"], 
    [outerW * outerH, innerW * innerH, "?"], 
    area, 5, 7, MathOperation.Subtract,
    ["Find the big area first.", "Subtract the part that was cut out."], "⚙️",
    "How much material remains after the hole is cut?"
  );
}

function schema7_packing() {
  const boxV = rand(50, 100);
  const itemV = rand(2, 5);
  const maxItems = Math.floor(boxV / itemV);
  return buildTableProblem(
    "Efficiency Packing", 
    ["Cargo Space", "Item Size", "Max Items"], 
    [boxV, itemV, "?"], 
    maxItems, 5, 7, MathOperation.Subtract, // Using subtract logic context for remainder/fitting
    ["Divide the total space by the size of one item.", "How many times does the item fit?"], "🚛",
    "How many items can fit inside the cargo space?"
  );
}

function schema7_cylindrical() {
  const baseRadiusSq = rand(2, 5); // Simulating r^2
  const piEstimate = 3;
  const height = rand(5, 10);
  const volume = piEstimate * baseRadiusSq * height;
  return buildTableProblem(
    "Fluid Silo",
    ["Base Factor (πr²)", "Height", "Volume Cap"],
    [piEstimate * baseRadiusSq, height, "?"],
    volume, 5, 7, MathOperation.Multiply,
    ["Volume is the cross-section area times the height.", "Imagine a circular stack."], "🏭",
    "What is the total capacity of this storage tower?"
  );
}

export function generateProblem(difficulty: Difficulty): Problem {
  const schemas: Record<Difficulty, (() => Problem)[]> = {
    1: [schema3_perimeter, schema3_tiles, schema3_shapes],
    2: [schema4_area, schema4_angle, schema4_symmetry],
    3: [schema5_composite_area, schema5_coordinates, schema5_prism],
    4: [schema6_scale, schema6_volume, schema6_surface],
    5: [schema7_cutout, schema7_packing, schema7_cylindrical]
  };

  const options = schemas[difficulty] || [schema3_perimeter];
  const pick = options[Math.floor(Math.random() * options.length)];
  return pick();
}
