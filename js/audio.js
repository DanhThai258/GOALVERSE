// GoalVerse Procedural Audio Engine (Disabled)

let isSoundEnabled = false;

export function toggleSound(state) {
  isSoundEnabled = false;
}

export function getSoundStatus() {
  return false;
}

export function playClick() {}
export function playHover() {}
export function playWhistle(isDouble = false) {}
export function playKick() {}
export function playGoalPost() {}
export function playCheer() {}
export function playSuccess() {}
export function playFail() {}
