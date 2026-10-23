export type Language = 'ko' | 'en';

export interface TranslationDictionary {
  nav: {
    about: string;
    experience: string;
    skills: string;
    awards: string;
    portfolio: string;
    adminMode: string;
    themeToggleLight: string;
    themeToggleDark: string;
    langToggle: string;
    easterEggHint: string;
    bgmPlay: string;
    bgmPause: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    missionLabel: string;
    missionText: string;
    editBtn: string;
  };
  experience: {
    title: string;
    subtitle: string;
    addBtn: string;
    empty: string;
    items: Record<string, { title: string; desc: string }>;
  };
  skills: {
    title: string;
    subtitle: string;
    skillsList: Record<string, { name: string; desc: string }>;
  };
  awards: {
    title: string;
    subtitle: string;
    addBtn: string;
    empty: string;
    results: Record<string, string>;
    items: Record<string, { title: string; result: string }>;
  };
  portfolio: {
    title: string;
    subtitle: string;
    addBtn: string;
    completed: string;
    inDevelopment: string;
    planning: string;
    empty: string;
    items: Record<string, { title: string; desc: string; tags: string[] }>;
  };
  easterEgg: {
    toastTitle: string;
    toastSubtitle: string;
    toastDesc: string;
    playAgain: string;
    close: string;
    counterHint: (count: number) => string;
  };
  admin: {
    activeBanner: string;
    liveSync: string;
    defaultSync: string;
    autoSyncNotice: string;
    changePassword: string;
    exitAdmin: string;
    loginTitle: string;
    enterPassword: string;
    loginBtn: string;
    cancelBtn: string;
    saveBtn: string;
    deleteBtn: string;
    adminFloatingTitleActive: string;
    adminFloatingTitleInactive: string;
    editRecord: string;
    loading: string;
  };
  footer: {
    copyright: string;
    docs: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  ko: {
    nav: {
      about: "소개",
      experience: "경험 이력",
      skills: "기술 스택",
      awards: "수상 및 인증",
      portfolio: "포트폴리오",
      adminMode: "관리자 모드",
      themeToggleLight: "라이트 모드로 변경",
      themeToggleDark: "다크 모드로 변경",
      langToggle: "English",
      easterEggHint: "키보드 1을 5번 누르면 로봇 사운드 이스터에그 발동!",
      bgmPlay: "배경음악 재생 (BGM On)",
      bgmPause: "배경음악 일시정지 (BGM Off)"
    },
    hero: {
      badge: "ROBOT CODING AREA",
      title: "Dreaming Robots, Awakening Spaces",
      subtitle: "로봇을 만들고 코딩하는 공간, [주원].lab",
      description: "부품에서 코드로, 생각에서 현실로. 안녕하세요, 로봇을 만들고 코딩하며 문제를 해결하는 과정에서 즐거움을 찾는 개발자 [김주원]입니다. 센서와 모터를 활용해 로봇이 스스로 주변을 인지하고 움직이도록 만드는 것에 깊은 관심을 가지고 있습니다. 실패에 머무르지 않고, 로봇을 끊임없이 수정하고 다시 테스트하며 더 나은 해답을 찾아가는 엔지니어링 과정을 기록하고 있습니다..",
      missionLabel: "> MISSION_STATEMENT",
      missionText: "나는 waw라는 팀의 소속으로 우리 센터의 길이남을 인간, 그저 인간이 아니라 코딩하고 생각하는 인간.",
      editBtn: "소개 편집"
    },
    experience: {
      title: "Experience",
      subtitle: "로봇 수업과 프로젝트를 통해 경험한 활동들을 정리했습니다.",
      addBtn: "경험 이력 등록",
      empty: "등록된 경험 이력이 없습니다.",
      items: {
        "exp-1": {
          title: "2025 RoboRave: SUMO",
          desc: "SUMO 종목에 참가했다"
        },
        "exp-2": {
          title: "2025 RoboCup Korea Open",
          desc: "코스페이스 종목 참가, 인간으로 활약, 팀명: K.F.C.WaW"
        },
        "exp-3": {
          title: "2025.11.1 Robot Challenge",
          desc: "스모 종목 참가"
        },
        "exp-4": {
          title: "2022 ~ 2026 Robot Challenge",
          desc: "스모 종목 참가"
        }
      }
    },
    skills: {
      title: "k.f.c. WaW",
      subtitle: "맨땅에 헤딩하며, 진짜 내 손으로 익힌 기술들이에요.",
      skillsList: {
        "C Coding": {
          name: "C Coding",
          desc: "C 언어로 아두이노 센서들을 구동하고 로봇 내부 지능을 구현하는 기술"
        },
        "Micro Python Coding": {
          name: "Micro Python Coding",
          desc: "마이크로파이썬을 사용해 스마트 하드웨어 및 보드를 세밀하게 제어하는 기술"
        },
        "Block Coding": {
          name: "Block Coding",
          desc: "스크래치나 엔트리 같은 도구로 직관적인 컴포넌트 알고리즘을 짜는 논리 기술"
        },
        "Robot Building": {
          name: "Robot Building",
          desc: "다양한 프레임, 모터, 센서 브래킷을 완전한 구동 형태로 튼튼히 설계하는 조립 기술"
        },
        "Problem Solving": {
          name: "Problem Solving",
          desc: "로봇 구동 실패나 예외적 오작동의 근본 원인을 끝까지 추적해 수정해 내는 인내심"
        },
        "Teamwork": {
          name: "Teamwork",
          desc: "대회나 로봇 팀 프로젝트에서 동료들과 조화를 이루고 문제를 함께 상의해 해결하는 태도"
        },
        "PPT Presentation": {
          name: "PPT Presentation",
          desc: "우리가 개발한 설계 방식과 성과를 남들에게 간결하고 핵심적으로 보여주는 전달 능력"
        },
        "Instruction Making": {
          name: "Instruction Making",
          desc: "누구든 쉽게 똑같이 작동하는 로봇을 제작할 수 있게 매뉴얼과 조립법을 구조화하는 역량"
        }
      }
    },
    awards: {
      title: "Certifications & Awards",
      subtitle: "제 손으로 만든 로봇이 세상 밖으로 나가 인정받은 발자국들입니다.",
      addBtn: "수상/이력 등록",
      empty: "등록된 수상 내역이 없습니다.",
      results: {
        "2st Place": "2등 수상",
        "NO.": "참가 기록"
      },
      items: {
        "cert-1": {
          title: "2025 RoboCup Korea Open (CoSpace U12)",
          result: "2st Place"
        },
        "cert-2": {
          title: "2026 RoboCup Singapore Open (CoSpace U12)",
          result: "NO."
        }
      }
    },
    portfolio: {
      title: "Portfolio",
      subtitle: "내 손으로 빚어낸 로봇과, 이를 움직이는 소프트웨어 코드들을 모았습니다.",
      addBtn: "포트폴리오 등록",
      completed: "완료됨 (COMPLETED)",
      inDevelopment: "개발 중 (IN DEV)",
      planning: "기획 중 (PLANNING)",
      empty: "등록된 포트폴리오 항목이 없습니다.",
      items: {
        "port-1": {
          title: "Line Tracing Robot",
          desc: "컬러 센서를 사용해 검은 선을 따라가는 로봇 프로젝트입니다.",
          tags: ["컬러 센서", "모터 제어"]
        },
        "port-2": {
          title: "Sumo Robot",
          desc: "상대 로봇을 감지하고 밀어내는 로봇 프로젝트입니다.",
          tags: ["초음파 센서", "모터 파워"]
        },
        "port-3": {
          title: "Mission Robot",
          desc: "정해진 미션을 수행하기 위해 구조와 코드를 설계한 프로젝트입니다.",
          tags: ["미션 전략", "센서 제어"]
        }
      }
    },
    easterEgg: {
      toastTitle: "🎉 히든 이스터에그 발견!",
      toastSubtitle: "11111 ROBOT POWER ACTIVATED",
      toastDesc: "숫자 1을 5번 연속으로 눌러 김주원 로봇 연구소의 비밀 효과음이 작동되었습니다! ⚡🤖",
      playAgain: "효과음 다시 듣기 🔊",
      close: "닫기",
      counterHint: (c: number) => `⚡ 이스터에그 충전 중: [${c}/5] ('1'을 더 누르세요!)`
    },
    admin: {
      activeBanner: "관리자 편집 모드 활성화됨",
      liveSync: "Firebase 실시간 동기화 (Firestore + Storage)",
      defaultSync: "기본 모드 (전체 편집 가능 | 로컬 모드)",
      autoSyncNotice: "* 데스크톱, 모바일, 모든 브라우저에 실시간으로 자동 연동됩니다.",
      changePassword: "비밀번호 변경",
      exitAdmin: "편집 모드 종료",
      loginTitle: "관리자 로그인",
      enterPassword: "비밀번호를 입력하세요",
      loginBtn: "로그인",
      cancelBtn: "취소",
      saveBtn: "저장하기",
      deleteBtn: "삭제하기",
      adminFloatingTitleActive: "편집 모드 종료",
      adminFloatingTitleInactive: "관리자 시스템 설정",
      editRecord: "항목 세부 편집",
      loading: "포트폴리오 연동 정보 확인 중입니다..."
    },
    footer: {
      copyright: "© 2026 Kim Ju-won Robot Portfolio. All rights reserved.",
      docs: "문서 및 가이드"
    }
  },
  en: {
    nav: {
      about: "About",
      experience: "Experience",
      skills: "Skills",
      awards: "Awards & Certs",
      portfolio: "Portfolio",
      adminMode: "Admin Mode",
      themeToggleLight: "Switch to Light Mode",
      themeToggleDark: "Switch to Dark Mode",
      langToggle: "한국어 (KO)",
      easterEggHint: "Press '1' five times for a secret robot sound effect!",
      bgmPlay: "Play Background Music",
      bgmPause: "Pause Background Music"
    },
    hero: {
      badge: "ROBOT CODING AREA",
      title: "Dreaming Robots, Awakening Spaces",
      subtitle: "Robotics Engineering & Embedded Coding Lab, Juwon.lab",
      description: "From raw components to clean code, from imagination into physical reality. Hello! I am Kim Ju-won, a passionate young robotics developer and coder who finds joy in solving difficult challenges through engineering. I focus deeply on utilizing optical sensors, ultrasonic detectors, and motors to empower autonomous robots. Rather than fearing failure, I continuously iterate, debug, and test to find superior engineering solutions.",
      missionLabel: "> MISSION_STATEMENT",
      missionText: "As a member of team WaW, a lasting person in our robotics center—not just an ordinary person, but a human who codes, creates, and thinks.",
      editBtn: "Edit About"
    },
    experience: {
      title: "Experience & Tournaments",
      subtitle: "A curated record of robotics courses, hands-on challenges, and competitive tournament activities.",
      addBtn: "Add Experience",
      empty: "No experience records registered yet.",
      items: {
        "exp-1": {
          title: "2025 RoboRave: SUMO",
          desc: "Competed in the international RoboRave Autonomous SUMO Robot tournament."
        },
        "exp-2": {
          title: "2025 RoboCup Korea Open",
          desc: "Competed in the CoSpace Division as a core team engineer. Team: K.F.C.WaW"
        },
        "exp-3": {
          title: "2025.11.1 Robot Challenge",
          desc: "Competed in the regional Sumo Robot challenge division."
        },
        "exp-4": {
          title: "2022 ~ 2026 Robot Challenge",
          desc: "Continuous participation and multi-season competitor in the Sumo Robot Challenge."
        }
      }
    },
    skills: {
      title: "k.f.c. WaW",
      subtitle: "Practical engineering technologies mastered through trial, error, and my own hands.",
      skillsList: {
        "C Coding": {
          name: "C Coding",
          desc: "Programming Arduino and embedded controllers in C to drive hardware sensors and autonomous logic."
        },
        "Micro Python Coding": {
          name: "Micro Python Coding",
          desc: "Leveraging MicroPython for high-level microcontroller control and rapid hardware prototyping."
        },
        "Block Coding": {
          name: "Block Coding",
          desc: "Structuring core algorithms and game loops intuitively with visual block-based logic environments."
        },
        "Robot Building": {
          name: "Robot Building",
          desc: "Assembling durable robot chassis, mechanical gearboxes, and reinforced sensor mounts."
        },
        "Problem Solving": {
          name: "Problem Solving",
          desc: "Tracing root causes of hardware anomalies and code bugs with persistence and engineering rigor."
        },
        "Teamwork": {
          name: "Teamwork",
          desc: "Collaborating seamlessly with team members during high-pressure tournaments and projects."
        },
        "PPT Presentation": {
          name: "PPT Presentation",
          desc: "Distilling complex mechanical blueprints and algorithmic strategies into impactful slide decks."
        },
        "Instruction Making": {
          name: "Instruction Making",
          desc: "Authoring clear build manuals and schematic guides so anyone can build reliable robots."
        }
      }
    },
    awards: {
      title: "Certifications & Awards",
      subtitle: "Milestones and official honors awarded to my handmade robots across public stages.",
      addBtn: "Add Award / Certification",
      empty: "No certifications or awards listed yet.",
      results: {
        "2st Place": "2nd Place (Runner-up)",
        "NO.": "Official Contestant"
      },
      items: {
        "cert-1": {
          title: "2025 RoboCup Korea Open (CoSpace U12)",
          result: "2nd Place"
        },
        "cert-2": {
          title: "2026 RoboCup Singapore Open (CoSpace U12)",
          result: "Contestant"
        }
      }
    },
    portfolio: {
      title: "Robot Engineering Portfolio",
      subtitle: "Handcrafted robots, autonomous embedded systems, and software source code.",
      addBtn: "Add Project",
      completed: "COMPLETED",
      inDevelopment: "IN DEVELOPMENT",
      planning: "PLANNING",
      empty: "No portfolio projects registered yet.",
      items: {
        "port-1": {
          title: "Line Tracing Robot",
          desc: "Autonomous line follower robot tracking black trajectories using high-precision optical color sensors.",
          tags: ["Color Sensor", "Motor Control"]
        },
        "port-2": {
          title: "Sumo Robot",
          desc: "Autonomous sumo robot designed to detect rival robots and deliver maximum pushing torque.",
          tags: ["Ultrasonic Sensor", "Motor Power"]
        },
        "port-3": {
          title: "Mission Robot",
          desc: "Multi-stage mission robot programmed to navigate terrain and complete specific arena tasks.",
          tags: ["Mission Strategy", "Sensor Control"]
        }
      }
    },
    easterEgg: {
      toastTitle: "🎉 Secret Easter Egg Unlocked!",
      toastSubtitle: "11111 ROBOT POWER ACTIVATED",
      toastDesc: "You pressed '1' five times! Kim Ju-won's Secret Robot Sound Effect has been triggered! ⚡🤖",
      playAgain: "Replay Sound FX 🔊",
      close: "Close",
      counterHint: (c: number) => `⚡ Easter Egg Charging: [${c}/5] (Press '1' again!)`
    },
    admin: {
      activeBanner: "Admin Editing Mode Active",
      liveSync: "Firebase Real-time Sync (Firestore + Storage)",
      defaultSync: "Default Mode (Full Edit Support | Local Mode)",
      autoSyncNotice: "* Automatically syncs across desktop, mobile, and any browser in real-time.",
      changePassword: "Change Password",
      exitAdmin: "Exit Admin Mode",
      loginTitle: "Admin Login",
      enterPassword: "Enter administrator password",
      loginBtn: "Login",
      cancelBtn: "Cancel",
      saveBtn: "Save Changes",
      deleteBtn: "Delete",
      adminFloatingTitleActive: "Exit Editing Mode",
      adminFloatingTitleInactive: "Admin Settings",
      editRecord: "Edit Item",
      loading: "Connecting and verifying portfolio records..."
    },
    footer: {
      copyright: "© 2026 Kim Ju-won Robot Portfolio. All rights reserved.",
      docs: "Documentation & Manuals"
    }
  }
};
