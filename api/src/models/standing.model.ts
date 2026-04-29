import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db/connection';

export async function findByTournament(tournamentId: number) {
    const [rows] = await pool.query<RowDataPacket[]>('    SELECT\n' +
        '      s.team_id,\n' +
        '      t.name        AS team_name,\n' +
        '      t.short_name,\n' +
        '      g.name        AS group_name,\n' +
        '      s.played,\n' +
        '      s.won,\n' +
        '      s.drawn,\n' +
        '      s.lost,\n' +
        '      s.points,\n' +
        '      s.goals_for,\n' +
        '      s.goals_against,\n' +
        '      s.goal_diff,\n' +
        '      s.sport_stats,\n' +
        '      s.updated_at\n' +
        '    FROM standings s\n' +
        '    JOIN teams  t ON t.id = s.team_id\n' +
        '    LEFT JOIN `groups` g ON g.id = s.group_id\n' + 
        '    WHERE s.tournament_id = ?\n' +
        '    ORDER BY g.name ASC, s.points DESC, s.goal_diff DESC, s.goals_for DESC\n', [tournamentId]);
    return rows;
}

export async function findByGroup(tournamentId: number, groupId: number) {
    const [rows] = await pool.query(`
    SELECT
      s.team_id,
      t.name        AS team_name,
      t.short_name,
      s.played,
      s.won,
      s.drawn,
      s.lost,
      s.points,
      s.goals_for,
      s.goals_against,
      s.goal_diff,
      s.sport_stats,
      s.updated_at
    FROM standings s
    JOIN teams t ON t.id = s.team_id
    WHERE s.tournament_id = ? AND s.group_id = ?
    ORDER BY s.points DESC, s.goal_diff DESC, s.goals_for DESC
  `, [tournamentId, groupId]);
    return rows;
}

// Se llama automáticamente desde match.service al registrar un resultado
// Hace upsert: si ya existe la fila la actualiza, si no la crea
export async function recalculate(tournamentId: number, homeTeamId: number, awayTeamId: number, scoreHome: any, scoreAway: any, groupId: number, sportStats: any) {
    // Determinar puntos y resultados para cada equipo (reglas soccer/basket)
    // Para volleyball el score ya viene en sets, los puntos se manejan igual
    let homeWon = 0, homeDraw = 0, homeLost = 0, homePoints = 0;
    let awayWon = 0, awayDraw = 0, awayLost = 0, awayPoints = 0;

    if (scoreHome > scoreAway) {
        homeWon = 1; homePoints = 3;
        awayLost = 1; awayPoints = 0;
    } else if (scoreAway > scoreHome) {
        awayWon = 1; awayPoints = 3;
        homeLost = 1; homePoints = 0;
    } else {
        // Empate (soccer)
        homeDraw = 1; homePoints = 1;
        awayDraw = 1; awayPoints = 1;
    }

    // Upsert equipo local
    await upsertStanding(tournamentId, groupId, homeTeamId, {
        won: homeWon, drawn: homeDraw, lost: homeLost, points: homePoints,
        goals_for: scoreHome, goals_against: scoreAway,
    });

    // Upsert equipo visitante
    await upsertStanding(tournamentId, groupId, awayTeamId, {
        won: awayWon, drawn: awayDraw, lost: awayLost, points: awayPoints,
        goals_for: scoreAway, goals_against: scoreHome,
    });
}

async function upsertStanding(tournamentId: number, groupId: number, teamId: number, delta: any) {
    // Si ya existe la fila, suma los deltas. Si no, la crea desde cero.
    const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM standings WHERE tournament_id = ? AND team_id = ? AND (group_id = ? OR (group_id IS NULL AND ? IS NULL))',
        [tournamentId, teamId, groupId, groupId]
    );

    if (existing.length > 0) {
        await pool.query(`
      UPDATE standings SET
        played        = played + 1,
        won           = won   + ?,
        drawn         = drawn + ?,
        lost          = lost  + ?,
        points        = points + ?,
        goals_for     = goals_for     + ?,
        goals_against = goals_against + ?,
        goal_diff     = CAST(goals_for AS SIGNED) - CAST(goals_against AS SIGNED)
      WHERE tournament_id = ? AND team_id = ?
        AND (group_id = ? OR (group_id IS NULL AND ? IS NULL))
    `, [
            delta.won, delta.drawn, delta.lost, delta.points,
            delta.goals_for, delta.goals_against,
            tournamentId, teamId, groupId, groupId,
        ]);
    } else {
        await pool.query(`
      INSERT INTO standings
        (tournament_id, group_id, team_id, played, won, drawn, lost, points, goals_for, goals_against, goal_diff)
      VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
    `, [
            tournamentId, groupId, teamId,
            delta.won, delta.drawn, delta.lost, delta.points,
            delta.goals_for, delta.goals_against,
            delta.goals_for - delta.goals_against,
        ]);
    }
}