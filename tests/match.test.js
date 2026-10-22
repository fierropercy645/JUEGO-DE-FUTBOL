import { describe, it, expect } from 'vitest';
import { MatchRules } from '../src/game/MatchRules.js';
import { Ball } from '../src/game/Ball.js';
import { PITCH } from '../src/utils/constants.js';

describe('Match Physics and Rules', () => {
  const fieldLeft = PITCH.FIELD_MARGIN_X || 60;
  const fieldRight = PITCH.WIDTH - fieldLeft;

  it('detects home goal when ball fully crosses right goal line into the goal', () => {
    const ball = new Ball(fieldRight + 15, PITCH.HEIGHT / 2);
    const goal = MatchRules.checkGoal(ball, PITCH.WIDTH, PITCH.HEIGHT, PITCH.GOAL_WIDTH);
    expect(goal).toBe('home');
  });

  it('detects away goal when ball fully crosses left goal line into the goal', () => {
    const ball = new Ball(fieldLeft - 15, PITCH.HEIGHT / 2);
    const goal = MatchRules.checkGoal(ball, PITCH.WIDTH, PITCH.HEIGHT, PITCH.GOAL_WIDTH);
    expect(goal).toBe('away');
  });

  it('does NOT count goal if ball crosses endline outside the goal width', () => {
    const ball = new Ball(fieldLeft - 15, 50); // fuera del marco del arco
    const goal = MatchRules.checkGoal(ball, PITCH.WIDTH, PITCH.HEIGHT, PITCH.GOAL_WIDTH);
    expect(goal).toBeNull();
  });

  it('does NOT count goal if ball is inside field', () => {
    const ball = new Ball(PITCH.WIDTH / 2, PITCH.HEIGHT / 2);
    const goal = MatchRules.checkGoal(ball, PITCH.WIDTH, PITCH.HEIGHT, PITCH.GOAL_WIDTH);
    expect(goal).toBeNull();
  });

  it('detects throw-in when ball crosses top touchline', () => {
    const ball = new Ball(PITCH.WIDTH / 2, 0);
    const outEvent = MatchRules.checkOutOfBounds(ball, PITCH.WIDTH, PITCH.HEIGHT, PITCH.GOAL_WIDTH);
    expect(outEvent).not.toBeNull();
    expect(outEvent.type).toBe('SAQUE_DE_BANDA');
  });

  it('detects corner kick when defending player touches ball over endline', () => {
    const ball = new Ball(fieldRight + 10, 50);
    ball.lastTouchedPlayer = { isHome: false }; // defensor visitante desvía
    const outEvent = MatchRules.checkOutOfBounds(ball, PITCH.WIDTH, PITCH.HEIGHT, PITCH.GOAL_WIDTH);
    expect(outEvent).not.toBeNull();
    expect(outEvent.type).toBe('TIRO_DE_ESQUINA');
    expect(outEvent.awardedSide).toBe('home');
  });

  it('detects goal kick when attacking player touches ball over endline', () => {
    const ball = new Ball(fieldRight + 10, 50);
    ball.lastTouchedPlayer = { isHome: true }; // atacante local dispara desviado
    const outEvent = MatchRules.checkOutOfBounds(ball, PITCH.WIDTH, PITCH.HEIGHT, PITCH.GOAL_WIDTH);
    expect(outEvent).not.toBeNull();
    expect(outEvent.type).toBe('SAQUE_DE_META');
    expect(outEvent.awardedSide).toBe('away');
  });
});
