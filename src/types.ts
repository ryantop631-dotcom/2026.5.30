/**
 * TypeScript Type Definitions for Robot Coding Area Webapp
 */

export interface SiteContent {
  title: string;
  subtitle: string;
  description: string;
  missionStatement: string;
  heroImageUrl: string;
  skillsTitle: string;
  skillsSubtitle: string;
  skills: string[];
  backgroundColor: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: 'blue' | 'red' | 'yellow';
  sortOrder: number;
}

export interface Certification {
  id: string;
  title: string;
  result: string;
  icon: string;
  color: 'tertiary' | 'default';
  sortOrder: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: 'COMPLETED' | 'IN DEVELOPMENT';
  tags: string[];
  sortOrder: number;
}
