import { SiteContent, Experience, Certification, PortfolioItem } from './types';

export const defaultSiteContent: SiteContent = {
  title: "Dreaming Robots, Awakening Spaces",
  subtitle: "로봇을 만들고 코딩하는 공간, [주원].lab",
  description: "부품에서 코드로, 생각에서 현실로. 안녕하세요, 로봇을 만들고 코딩하며 문제를 해결하는 과정에서 즐거움을 찾는 개발자 [김주원]입니다. 센서와 모터를 활용해 로봇이 스스로 주변을 인지하고 움직이도록 만드는 것에 깊은 관심을 가지고 있습니다. 실패에 머무르지 않고, 로봇을 끊임없이 수정하고 다시 테스트하며 더 나은 해답을 찾아가는 엔지니어링 과정을 기록하고 있습니다..",
  missionStatement: "나는 waw라는 팀의 소속으로 우리 센터의 길이남을 인간, 그저 인간이 아니라 코딩하고 생각하는 인간.",
  heroImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPLNxFAstnATUbypwYmBkz_e7zxni6d3ZMl9Ez-YtnbynxjqO0HwAWRuxYRhfumLbn813Pq4aB65ZbStoZwEQ-xXlSTf74Y4oMKVInLckRAccnasC9RfekCE_UQ28uZqGvs9SMDqcfbqyv2eANxjzwexdpdA8y_ZWDwJ0hZFZ_bsoJOUJQcb5pmNEW6ujUcz6E2UqTCYYgazl3IIStJBLOfSDUnSKhuuzVxjTLivkQivmOyjxlSYDwZY6HumsHHdP32Ze6zAkhU5Q",
  skillsTitle: "k.f.c. WaW",
  skillsSubtitle: "맨땅에 헤딩하며, 진짜 내 손으로 익힌 기술들이에요.",
  skills: [
    "C Coding",
    "Micro Python Coding",
    "Block Coding",
    "Robot Building",
    "Problem Solving",
    "Teamwork",
    "PPT Presentation",
    "Instruction Making"
  ]
};

export const defaultExperiences: Experience[] = [
  {
    id: "exp-1",
    title: "2025 RoboRave: SUMO",
    description: "SUMO 종목에 참가했다",
    icon: "precision_manufacturing",
    color: "blue",
    sortOrder: 1
  },
  {
    id: "exp-2",
    title: "2025 RoboCup Korea Open",
    description: "코스페이스 종목 참가, 인간으로 활약, 팀명: K.F.C.WaW",
    icon: "smart_toy",
    color: "red",
    sortOrder: 2
  },
  {
    id: "exp-3",
    title: "2025.11.1 Robot Challenge",
    description: "스모 종목 참가",
    icon: "memory",
    color: "yellow",
    sortOrder: 3
  },
  {
    id: "exp-4",
    title: "2022 ~ 2026 Robot Challenge",
    description: "스모 종목 참가",
    icon: "engineering",
    color: "blue",
    sortOrder: 4
  }
];

export const defaultCertifications: Certification[] = [
  {
    id: "cert-1",
    title: "2025 RoboCup Korea Open (CoSpace U12)",
    result: "2st Place",
    icon: "emoji_events",
    color: "tertiary",
    sortOrder: 1
  },
  {
    id: "cert-2",
    title: "2026 RoboCup Singapore Open (CoSpace U12)",
    result: "NO.",
    icon: "workspace_premium",
    color: "default",
    sortOrder: 2
  }
];

export const defaultPortfolioItems: PortfolioItem[] = [
  {
    id: "port-1",
    title: "Line Tracing Robot",
    description: "컬러 센서를 사용해 검은 선을 따라가는 로봇 프로젝트입니다.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCG_VGrvnm6ypy3JjBrFeObIQNO4NEOvaIUIKnk0CPKQIhxidEZCwasy6d8-l_aTV_7X7mtjDUyuoSq8T5QaBN5na4EAjRkFErZq6y0eFgMEoQc3PUQFrnik0KztPptAS_mA2CvHAFgLvXfiaJBU24Y2UCwPfY0p9ekt0hG2FI3buhCowM2tVWjH8sqQkgQCxfb6RjVjYkVgvhbU3kFPjkiLwH13o2nqCEJzj_9WdL951KoWRogctRl_4gEiR3IYGKg9pH_f9CYNag",
    status: "COMPLETED",
    tags: ["Color Sensor", "Motor Control"],
    sortOrder: 1
  },
  {
    id: "port-2",
    title: "Sumo Robot",
    description: "상대 로봇을 감지하고 밀어내는 로봇 프로젝트입니다.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZhtmiUsF0XY3apKzYWyJMQn1H3lKgf4wPkAiSIURaxKvS1QZpCF6OfNCPtyXlBx9Ug0yzzv7ReMTMR05DSB9RT_HI51R-zKCrJIPvMpyQPA3CkiAqN4Kv1fmELqE6kqmIq5_lZG1f5W87uK4SnMtmZ2-A_v83GTyIGn1A913BwccqxL5kbA7DW_Weo8E4LTQBiM5tIM0jdEnI2UnLV-wWMuARbSOYgKIxrUZQjTbG5M-O5-d1SWBKz7RiDxZxWtJ0u68UnJEDVaA",
    status: "COMPLETED",
    tags: ["Ultrasonic Sensor", "Motor Power"],
    sortOrder: 2
  },
  {
    id: "port-3",
    title: "Mission Robot",
    description: "정해진 미션을 수행하기 위해 구조와 코드를 설계한 프로젝트입니다.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnxOP7wT-T_RUT5mZRrU1iKJr28SpBUVpt0ZI_GYqmDNSv7SzDlF1EeY5T3dJ4xmCLi6ln1meEOPoW_SH7dkxV_oqlblu67HH9MYvGL4S8K-dRqaSNReEU2hdu81a9nIOMFZuIriOAMno4szkTRtUs7JCnDDU2VMGgit_C0iVA3u3z5SKUxcx63cOugz7yw8X_fq3z_iERLCziTsM_0MNHn2znGrwRdwWkVY8NNsFu0tv-vqJjxFumLsAKmdMU3Fd4phLJPAXRcjE",
    status: "IN DEVELOPMENT",
    tags: ["Mission Strategy", "Sensor Control"],
    sortOrder: 3
  }
];
