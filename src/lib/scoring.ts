// ============================================================
// TPM (Testorum Personality Map) Scoring Engine
// Main Type + Sub Type + Pure Type Determination
// ============================================================

interface AxisScore {
  direction: 'ignite' | 'observe' | 'pulse' | 'prism' | 'self' | 'bond';
  weight: number;
}

interface OptionScores {
  drive?: AxisScore;
  process?: AxisScore;
  compass?: AxisScore;
}

interface TPMResult {
  mainType: TPMType;
  subType: TPMType | null;  // null if Pure Type
  isPure: boolean;
  code: string;             // e.g., "Torch.Architect" or "Torch (Pure)"
  axes: {
    drive: { direction: 'ignite' | 'observe'; score: number; total: number; confidence: number };
    process: { direction: 'pulse' | 'prism'; score: number; total: number; confidence: number };
    compass: { direction: 'self' | 'bond'; score: number; total: number; confidence: number };
  };
}

type TPMType = 'Torch' | 'Spark' | 'Architect' | 'Commander' | 'Empath' | 'Dreamer' | 'Advisor' | 'Sentinel';

// ============================================================
// STEP 1: Accumulate axis scores from all answered options
// ============================================================

function calculateAxisScores(selectedOptions: OptionScores[]): {
  drive: { ignite: number; observe: number };
  process: { pulse: number; prism: number };
  compass: { self: number; bond: number };
} {
  const axes = {
    drive: { ignite: 0, observe: 0 },
    process: { pulse: 0, prism: 0 },
    compass: { self: 0, bond: 0 },
  };

  for (const option of selectedOptions) {
    if (option.drive) {
      axes.drive[option.drive.direction as 'ignite' | 'observe'] += option.drive.weight;
    }
    if (option.process) {
      axes.process[option.process.direction as 'pulse' | 'prism'] += option.process.weight;
    }
    if (option.compass) {
      axes.compass[option.compass.direction as 'self' | 'bond'] += option.compass.weight;
    }
  }

  return axes;
}

// ============================================================
// STEP 2: Determine axis directions + confidence
// ============================================================
// Confidence = winning_side / total_for_axis * 100
// Example: ignite=12, observe=8 → direction=ignite, confidence=60%

function determineAxis(positive: number, negative: number, posLabel: string, negLabel: string) {
  const total = positive + negative;
  if (total === 0) return { direction: posLabel, score: 0, total: 0, confidence: 50 };

  const direction = positive >= negative ? posLabel : negLabel;
  const winningScore = Math.max(positive, negative);
  const confidence = (winningScore / total) * 100;

  return { direction, score: winningScore, total, confidence };
}

// ============================================================
// STEP 3: Map 3-axis combination → TPM Type
// ============================================================

const TYPE_MAP: Record<string, TPMType> = {
  'ignite-pulse-bond': 'Torch',
  'ignite-pulse-self': 'Spark',
  'ignite-prism-bond': 'Architect',
  'ignite-prism-self': 'Commander',
  'observe-pulse-bond': 'Empath',
  'observe-pulse-self': 'Dreamer',
  'observe-prism-bond': 'Advisor',
  'observe-prism-self': 'Sentinel',
};

function getTypeFromAxes(drive: string, process: string, compass: string): TPMType {
  const key = `${drive}-${process}-${compass}`;
  return TYPE_MAP[key] || 'Torch'; // fallback
}

// ============================================================
// STEP 4: Determine Sub Type
// ============================================================
// Sub type = flip the LOWEST confidence axis
// This represents the user's "shadow" or secondary tendency
//
// Example:
//   drive: ignite (80%) ← high confidence
//   process: pulse (55%) ← LOW confidence ← FLIP THIS
//   compass: bond (65%)
//
//   Main: ignite-pulse-bond = Torch
//   Sub:  ignite-PRISM-bond = Architect (flipped process)
//   Code: Torch.Architect

function determineSubType(
  driveResult: { direction: string; confidence: number },
  processResult: { direction: string; confidence: number },
  compassResult: { direction: string; confidence: number }
): { subType: TPMType; flippedAxis: string } {
  // Find the axis with lowest confidence
  const axes = [
    { name: 'drive', ...driveResult },
    { name: 'process', ...processResult },
    { name: 'compass', ...compassResult },
  ];

  const weakest = axes.reduce((min, curr) =>
    curr.confidence < min.confidence ? curr : min
  );

  // Flip the weakest axis
  const flipped = {
    drive: driveResult.direction,
    process: processResult.direction,
    compass: compassResult.direction,
  };

  if (weakest.name === 'drive') {
    flipped.drive = flipped.drive === 'ignite' ? 'observe' : 'ignite';
  } else if (weakest.name === 'process') {
    flipped.process = flipped.process === 'pulse' ? 'prism' : 'pulse';
  } else {
    flipped.compass = flipped.compass === 'self' ? 'bond' : 'bond' === flipped.compass ? 'self' : 'bond';
  }

  const subType = getTypeFromAxes(flipped.drive, flipped.process, flipped.compass);

  return { subType, flippedAxis: weakest.name };
}

// ============================================================
// STEP 5: Determine Pure Type
// ============================================================
// Pure Type: ALL 3 axes have confidence ≥ 70%
// This means the person strongly identifies with all 3 axis directions
// Pure Types are rare (~5-10% of population) and have no sub type

const PURE_THRESHOLD = 70; // percentage

function isPureType(
  driveConf: number,
  processConf: number,
  compassConf: number
): boolean {
  return driveConf >= PURE_THRESHOLD
    && processConf >= PURE_THRESHOLD
    && compassConf >= PURE_THRESHOLD;
}

// ============================================================
// MAIN SCORING FUNCTION
// ============================================================

function calculateTPMResult(selectedOptions: OptionScores[]): TPMResult {
  // Step 1: Accumulate
  const raw = calculateAxisScores(selectedOptions);

  // Step 2: Determine directions + confidence
  const drive = determineAxis(raw.drive.ignite, raw.drive.observe, 'ignite', 'observe');
  const process = determineAxis(raw.process.pulse, raw.process.prism, 'pulse', 'prism');
  const compass = determineAxis(raw.compass.self, raw.compass.bond, 'self', 'bond');

  // Step 3: Main type
  const mainType = getTypeFromAxes(drive.direction, process.direction, compass.direction);

  // Step 5: Check Pure Type first
  const pure = isPureType(drive.confidence, process.confidence, compass.confidence);

  // Step 4: Sub type (only if not pure)
  let subType: TPMType | null = null;
  if (!pure) {
    const sub = determineSubType(drive, process, compass);
    subType = sub.subType;
    // Sub type must differ from main type
    if (subType === mainType) {
      subType = null; // Edge case: shouldn't happen with correct logic
    }
  }

  // Generate code
  const code = pure
    ? `${mainType} (Pure)`
    : subType
      ? `${mainType}.${subType}`
      : mainType;

  return {
    mainType,
    subType,
    isPure: pure,
    code,
    axes: {
      drive: { ...drive, direction: drive.direction as 'ignite' | 'observe' },
      process: { ...process, direction: process.direction as 'pulse' | 'prism' },
      compass: { ...compass, direction: compass.direction as 'self' | 'bond' },
    },
  };
}

// ============================================================
// RESOLVE RESULT — Bridge between TestClient and TPM engine
// ============================================================
// Maps user's selected answers → axis directions → matching result ID
//
// TestClient calls: resolveResult(testData, selectedAnswers)
// Returns: result ID string (e.g., "A", "warrior", "bard")

interface TPMProfile {
  drive: string;
  process: string;
  compass: string;
}

interface ResultWithTPM {
  id: string;
  tpm_profile?: TPMProfile;
}

interface TestDataLike {
  results: ResultWithTPM[];
}

function resolveResult(
  testData: TestDataLike,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answers: { scores: any }[]
): string {
  // 1. Extract OptionScores from each answer
  //    Runtime shape: { drive: { direction, weight }, process: {...}, compass: {...} }
  const optionScores: OptionScores[] = answers.map((a) => a.scores as OptionScores);

  // 2. Calculate TPM result (axis directions)
  const tpm = calculateTPMResult(optionScores);
  const drive = tpm.axes.drive.direction;
  const process = tpm.axes.process.direction;
  const compass = tpm.axes.compass.direction;

  // 3. Find matching result by tpm_profile
  const match = testData.results.find((r) => {
    const p = r.tpm_profile;
    if (!p) return false;
    return p.drive === drive && p.process === process && p.compass === compass;
  });

  if (match) return match.id;

  // 4. Fallback: if no exact match (shouldn't happen with correct data),
  //    find closest match by most axes matching
  let bestMatch = testData.results[0];
  let bestScore = 0;

  for (const r of testData.results) {
    const p = r.tpm_profile;
    if (!p) continue;
    let score = 0;
    if (p.drive === drive) score++;
    if (p.process === process) score++;
    if (p.compass === compass) score++;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = r;
    }
  }

  return bestMatch?.id ?? testData.results[0]?.id ?? 'unknown';
}

// ============================================================
// EXAMPLES
// ============================================================

/*
Example 1: Clear type with sub type
  Raw: drive(ignite=14, observe=6) process(pulse=11, prism=9) compass(bond=12, self=8)
  Drive: ignite, conf=70%
  Process: pulse, conf=55% ← weakest
  Compass: bond, conf=60%
  Main: IPB = Torch
  Sub: flip process → IRB = Architect
  Code: "Torch.Architect"

Example 2: Pure type
  Raw: drive(observe=16, ignite=4) process(prism=15, pulse=5) compass(self=14, bond=6)
  Drive: observe, conf=80%
  Process: prism, conf=75%
  Compass: self, conf=70%
  All ≥ 70% → Pure!
  Main: ORS = Sentinel
  Code: "Sentinel (Pure)"

Example 3: Very balanced (sub type = diagonal opposite)
  Raw: drive(ignite=11, observe=9) process(pulse=10, prism=10) compass(self=10, bond=10)
  Drive: ignite, conf=55%
  Process: pulse, conf=50% ← weakest (tie-broken by order)
  Compass: self, conf=50% ← also weakest
  Main: IPS = Spark
  Sub: flip process (50% tie → process wins) → IRS = Commander
  Code: "Spark.Commander"
*/

// ============================================================
// 56 COMBINATION REFERENCE
// ============================================================
// 8 main × 7 sub = 56 combinations
// Each main type can pair with any of the other 7 as sub type
// Plus 8 Pure Types = 64 total possible outcomes
//
// Most common sub types (predicted):
//   - Adjacent types (differ by 1 axis) are most likely sub types
//   - Diagonal types (differ by 3 axes) are rarest sub types
//   - Example: Torch(IPB) most likely sub = Spark(IPS), Architect(IRB), Empath(OPB)
//              Torch(IPB) rarest sub = Sentinel(ORS) — all 3 axes flipped

export { calculateTPMResult, resolveResult, type TPMResult, type TPMType };
