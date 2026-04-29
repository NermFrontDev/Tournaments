import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db/connection';

export async function findByTournament(tournamentId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      r.id,
      r.tournament_id,
      r.group_id,
      g.name        AS group_name,
      r.name,
      r.round_order,
      r.type,
      r.status,
      r.created_at,
      COUNT(m.id)   AS matches_count
    FROM rounds r
    LEFT JOIN \`groups\` g ON g.id = r.group_id
    LEFT JOIN matches m ON m.round_id = r.id
    WHERE r.tournament_id = ?
    GROUP BY r.id
    ORDER BY r.round_order ASC
  `, [tournamentId]);
    return rows;
}

export async function findById(roundId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      r.id,
      r.tournament_id,
      r.group_id,
      g.name        AS group_name,
      r.name,
      r.round_order,
      r.type,
      r.status,
      r.created_at
    FROM rounds r
    LEFT JOIN groups g ON g.id = r.group_id
    WHERE r.id = ?
  `, [roundId]);

    if (!rows[0]) return null;

    // Partidos de la ronda
    const [matches] = await pool.query(`
    SELECT
      m.id,
      ht.name       AS home_team,
      at.name       AS away_team,
      m.score_home,
      m.score_away,
      m.status,
      m.scheduled_at
    FROM matches m
    JOIN teams ht ON ht.id = m.home_team_id
    JOIN teams at ON at.id = m.away_team_id
    WHERE m.round_id = ?
    ORDER BY m.scheduled_at ASC
  `, [roundId]);

    return { ...rows[0], matches };
}

export async function findTournament(tournamentId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id, status FROM tournaments WHERE id = ?',
        [tournamentId]
    );
    return rows[0] || null;
}

export async function findByOrder(tournamentId: number, roundOrder: any) {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM rounds WHERE tournament_id = ? AND round_order = ?',
        [tournamentId, roundOrder]
    );
    return rows[0] || null;
}

export async function countMatches(roundId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT COUNT(*) AS total FROM matches WHERE round_id = ?',
        [roundId]
    );
    return rows[0].total;
}

export async function insert(tournamentId: any, data: any) {
    const [result] = await pool.query<ResultSetHeader>(`
    INSERT INTO rounds (tournament_id, group_id, name, round_order, type, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `, [
        tournamentId,
        data.group_id || null,
        data.name,
        data.round_order,
        data.type,
    ]);
    return result.insertId;
}

export async function update(roundId: number, fields: any) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const set = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE rounds SET ${set} WHERE id = ?`, [...values, roundId]);
}

export async function remove(roundId: number) {
    await pool.query('DELETE FROM rounds WHERE id = ?', [roundId]);
}