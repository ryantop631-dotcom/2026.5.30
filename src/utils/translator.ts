/**
 * Comprehensive bilingual translator dictionary and fallback translator for Korean -> English
 */

export const phrasesKOtoEN: Record<string, string> = {
  // Title / Mission / About defaults
  "Dreaming Robots, Awakening Spaces": "Dreaming Robots, Awakening Spaces",
  "로봇을 만들고 코딩하는 공간, [주원].lab": "Robotics Engineering & Embedded Coding Lab, Juwon.lab",
  "부품에서 코드로, 생각에서 현실로. 안녕하세요, 로봇을 만들고 코딩하며 문제를 해결하는 과정에서 즐거움을 찾는 개발자 [김주원]입니다. 센서와 모터를 활용해 로봇이 스스로 주변을 인지하고 움직이도록 만드는 것에 깊은 관심을 가지고 있습니다. 실패에 머무르지 않고, 로봇을 끊임없이 수정하고 다시 테스트하며 더 나은 해답을 찾아가는 엔지니어링 과정을 기록하고 있습니다..": "From raw components to clean code, from imagination into physical reality. Hello! I am Kim Ju-won, a passionate robotics developer and coder who finds joy in solving difficult challenges through engineering. I focus deeply on utilizing sensors and motors to empower autonomous robots. Rather than fearing failure, I continuously iterate, debug, and test to find superior engineering solutions.",
  "나는 waw라는 팀의 소속으로 우리 센터의 길이남을 인간, 그저 인간이 아니라 코딩하고 생각하는 인간.": "As a member of team WaW, a lasting person in our robotics center—not just an ordinary person, but a human who codes, creates, and thinks.",
  
  // Skills section headers
  "k.f.c. WaW": "k.f.c. WaW",
  "맨땅에 헤딩하며, 진짜 내 손으로 익힌 기술들이에요.": "Practical engineering technologies mastered through trial, error, and my own hands.",

  // Experiences
  "2025 RoboRave: SUMO": "2025 RoboRave: SUMO",
  "SUMO 종목에 참가했다": "Competed in the international RoboRave Autonomous SUMO Robot tournament.",
  "2025 RoboCup Korea Open": "2025 RoboCup Korea Open",
  "코스페이스 종목 참가, 인간으로 활약, 팀명: K.F.C.WaW": "Competed in the CoSpace Division as a core team engineer. Team: K.F.C.WaW",
  "2025.11.1 Robot Challenge": "2025.11.1 Robot Challenge",
  "스모 종목 참가": "Competed in the autonomous Sumo Robot tournament division.",
  "2022 ~ 2026 Robot Challenge": "2022 ~ 2026 Robot Challenge",

  // Awards & Certifications
  "2025 RoboCup Korea Open (CoSpace U12)": "2025 RoboCup Korea Open (CoSpace U12)",
  "2026 RoboCup Singapore Open (CoSpace U12)": "2026 RoboCup Singapore Open (CoSpace U12)",
  "2st Place": "2nd Place (Runner-up)",
  "2등 수상": "2nd Place (Runner-up)",
  "NO.": "Official Contestant",
  "참가 기록": "Official Contestant",
  "참가": "Contestant",
  "1등": "1st Place (Champion)",
  "2등": "2nd Place (Runner-up)",
  "3등": "3rd Place",
  "장려상": "Honorable Mention",
  "우수상": "Excellence Award",
  "대상": "Grand Prize",

  // Portfolio
  "Line Tracing Robot": "Line Tracing Robot",
  "라인 트레이서 로봇": "Line Tracing Robot",
  "컬러 센서를 사용해 검은 선을 따라가는 로봇 프로젝트입니다.": "Autonomous line follower robot tracking black trajectories using high-precision optical color sensors.",
  "Sumo Robot": "Sumo Robot",
  "스모 로봇": "Sumo Robot",
  "상대 로봇을 감지하고 밀어내는 로봇 프로젝트입니다.": "Autonomous sumo robot designed to detect rival robots and deliver maximum pushing torque.",
  "Mission Robot": "Mission Robot",
  "미션 로봇": "Mission Robot",
  "정해진 미션을 수행하기 위해 구조와 코드를 설계한 프로젝트입니다.": "Multi-stage mission robot programmed to navigate terrain and complete specific arena tasks.",

  // Tags
  "Color Sensor": "Color Sensor",
  "Motor Control": "Motor Control",
  "컬러 센서": "Color Sensor",
  "모터 제어": "Motor Control",
  "초음파 센서": "Ultrasonic Sensor",
  "Ultrasonic Sensor": "Ultrasonic Sensor",
  "모터 파워": "Motor Power",
  "Motor Power": "Motor Power",
  "미션 전략": "Mission Strategy",
  "Mission Strategy": "Mission Strategy",
  "센서 제어": "Sensor Control",
  "Sensor Control": "Sensor Control",
  "적외선 센서": "Infrared Sensor",
  "자율주행": "Autonomous Driving",
  "하드웨어 조립": "Chassis Assembly",
  "알고리즘": "Algorithm",
  "블록 코딩": "Block Coding",
  "파이썬": "Python",

  // Status
  "COMPLETED": "COMPLETED",
  "IN DEVELOPMENT": "IN DEVELOPMENT",
  "PLANNING": "PLANNING",
  "완료": "COMPLETED",
  "완료 (COMPLETED)": "COMPLETED",
  "개발 중": "IN DEVELOPMENT",
  "개발 중 (IN DEV)": "IN DEVELOPMENT"
};

/**
 * Keyword-based or phrase-based dynamic translation helper
 */
export function translateTextToEnglish(text: string | undefined): string {
  if (!text) return '';
  const trimmed = text.trim();

  // 1. Direct dictionary match
  if (phrasesKOtoEN[trimmed]) {
    return phrasesKOtoEN[trimmed];
  }

  // 2. Check case-insensitive / punctuation-stripped
  const cleanTrimmed = trimmed.replace(/\.+$/, '');
  for (const [ko, en] of Object.entries(phrasesKOtoEN)) {
    if (cleanTrimmed === ko.replace(/\.+$/, '')) {
      return en;
    }
  }

  // 3. Heuristic phrase replacements if contains Korean
  let result = trimmed;
  if (/스모 종목 참가/.test(result)) {
    result = result.replace(/스모 종목 참가/g, "Competed in the autonomous Sumo division");
  }
  if (/SUMO 종목에 참가했다/.test(result)) {
    result = result.replace(/SUMO 종목에 참가했다/g, "Competed in the international RoboRave SUMO Robot division");
  }
  if (/코스페이스 종목 참가.*K\.F\.C\.WaW/.test(result)) {
    return "Competed in the CoSpace Division as a core team engineer. Team: K.F.C.WaW";
  }
  if (/2등/.test(result) || /2st Place/i.test(result)) {
    return "2nd Place";
  }
  if (/1등/.test(result) || /1st Place/i.test(result)) {
    return "1st Place";
  }
  if (/3등/.test(result) || /3rd Place/i.test(result)) {
    return "3rd Place";
  }
  if (/참가/.test(result) || result === 'NO.') {
    return "Official Contestant";
  }

  // 4. Return translated or original
  return result;
}

/**
 * Translates a portfolio tag
 */
export function translateTag(tag: string): string {
  if (phrasesKOtoEN[tag]) return phrasesKOtoEN[tag];
  const lower = tag.toLowerCase();
  if (lower.includes('컬러') || lower.includes('color')) return 'Color Sensor';
  if (lower.includes('초음파') || lower.includes('ultrasonic')) return 'Ultrasonic Sensor';
  if (lower.includes('적외선') || lower.includes('ir') || lower.includes('infrared')) return 'IR Sensor';
  if (lower.includes('모터') && lower.includes('제어')) return 'Motor Control';
  if (lower.includes('모터') && lower.includes('파워')) return 'Motor Power';
  if (lower.includes('미션')) return 'Mission Strategy';
  if (lower.includes('센서')) return 'Sensor Control';
  if (lower.includes('블록')) return 'Block Coding';
  if (lower.includes('파이썬')) return 'MicroPython';
  if (lower.includes('하드웨어') || lower.includes('조립')) return 'Chassis Assembly';
  return tag;
}
