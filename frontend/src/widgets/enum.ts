export enum UserIsActiveStatus {
  ALL = 10,
  ACTIVE = 20,
  INACTIVE = 30,
}

export enum UserType {
  ALL = 10,
  ADMIN = 20,
  INSTRUCTOR = 30,
  STUDENT = 40,
}

export enum DateRange {
  LAST_30_DAYS = 10,
  LAST_90_DAYS = 20,
  LAST_YEAR = 30,
  ALL_TIME = 40,
  CUSTOM = 50,
}

export const ChartColors = {
  RED: "#FF0000",
  BLUE: "#0000FF",
  GREEN: "#00FF00",
  ORANGE: "#FFA500",
  YELLOW: "#FFFF00",
  PURPLE: "#800080",
  PINK: "#FFC0CB",
  CYAN: "#00FFFF",
  GRAY: "#808080",
  BLACK: "#000000",
  WHITE: "#FFFFFF",
  BROWN: "#A52A2A",
  DARK_RED: "#8B0000",
  DARK_BLUE: "#00008B",
  DARK_GREEN: "#006400",
  DARK_ORANGE: "#FF8C00",
  LIGHT_BLUE: "#ADD8E6",
  LIGHT_GREEN: "#90EE90",
  LIGHT_GRAY: "#D3D3D3",
} as const;

export const predefinedColors = [
  "#F47560",
  "#E8A838",
  "#F1E15B",
  "#97E3D5",
  "#E8C1A0",
  "#61CDBB",
  "#C3A8E3",
  "#FFB5A7",
  "#FFD6A5",
  "#B5E48C",
  "#A1CFF0",
  "#C9ADA7",
  "#FFC09F",
  "#ADF7B6",
  "#FFDAC1",
];
