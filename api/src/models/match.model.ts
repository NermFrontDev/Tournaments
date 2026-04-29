import { pool } from '../db/connection';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function findByTournament(tournamentId: number, filters: any = {}) {
  let query = `
    SELECT
      m.id,
      m.tournament_id,
      m.round_id,
      r.name          AS round_name,
      r.type          AS round_type,
      m.home_team_id,
      ht.name         AS home_team,
      ht.short_name   AS home_short,
      m.away_team_id,
      at.name         AS away_team,
      at.short_name   AS away_short,
      m.score_home,
      m.score_away,
      m.sport_stats,
      m.winner_team_id,
      m.status,
      m.scheduled_at,
      m.started_at,
      m.finished_at,
      m.venue
    FROM matches m
    JOIN rounds r  ON r.id  = m.round_id
    JOIN teams  ht ON ht.id = m.home_team_id
    JOIN teams  at ON at.id = m.away_team_id
    WHERE m.tournament_id = ?
  `;
  const params = [tournamentId];

  if (filters.status) {
    query += ' AND m.status = ?';
    params.push(filters.status);
  }
  if (filters.round_id) {
    query += ' AND m.round_id = ?';
    params.push(filters.round_id);
  }

  query += ' ORDER BY m.scheduled_at ASC, m.id ASC';

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows;
}

export async function findById(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      m.id,
      m.tournament_id,
      m.round_id,
      r.name          AS round_name,
      r.group_id,
      m.home_team_id,
      ht.name         AS home_team,
      ht.short_name   AS home_short,
      m.away_team_id,
      at.name         AS away_team,
      at.short_name   AS away_short,
      m.score_home,
      m.score_away,
      m.sport_stats,
      m.winner_team_id,
      m.status,
      m.scheduled_at,
      m.started_at,
      m.finished_at,
      m.venue,
      m.notes
    FROM matches m
    JOIN rounds r  ON r.id  = m.round_id
    JOIN teams  ht ON ht.id = m.home_team_id
    JOIN teams  at ON at.id = m.away_team_id
    WHERE m.id = ?
  `, [id]);

  if (!rows[0]) return null;

  // Eventos del partido
  const [events] = await pool.query(`
    SELECT
      me.id,
      me.event_type,
      me.minute,
      me.periods,
      me.payload,
      me.score_home,
      me.score_away,
      me.created_at,
      t.name AS team_name
    FROM match_events me
    JOIN teams t ON t.id = me.team_id
    WHERE me.match_id = ?
    ORDER BY me.id ASC
  `, [id]);

  return { ...rows[0], events };
}

export async function insert(tournamentId: number, data: any) {
  const [result] = await pool.query<ResultSetHeader>(`
    INSERT INTO matches (tournament_id, round_id, home_team_id, away_team_id, scheduled_at, venue)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    tournamentId,
    data.round_id,
    data.home_team_id,
    data.away_team_id,
    data.scheduled_at || null,
    data.venue || null,
  ]);
  return result.insertId;
}

export async function updateResult(id: number, data: any) {
  await pool.query(`
    UPDATE matches
    SET score_home     = ?,
        score_away     = ?,
        sport_stats    = ?,
        winner_team_id = ?,
        status         = 'finished',
        finished_at    = NOW()
    WHERE id = ?
  `, [
    data.score_home,
    data.score_away,
    data.sport_stats ? JSON.stringify(data.sport_stats) : null,
    data.winner_team_id,
    id,
  ]);
}

export async function updateStatus(id: number, status: string, extra = {}) {
  const fields = { status, ...extra };
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const set = keys.map(k => `${k} = ?`).join(', ');
  await pool.query(`UPDATE matches SET ${set} WHERE id = ?`, [...values, id]);
}

export async function updateNextRoundMatch(tournamentId: number, prevMatchId: number, teamId: number) {


  const [rows]: any = await pool.query<RowDataPacket[]>(`
    SELECT id, prev_match_home_id, prev_match_away_id 
    FROM matches 
    WHERE tournament_id = ? 
      AND (prev_match_home_id = ? OR prev_match_away_id = ?)
    LIMIT 1;
  `, [tournamentId, prevMatchId, prevMatchId]);

  if (rows.length === 0) {
    return false;
  }
  const nextMatch = rows[0];
  const nextMatchId = nextMatch.id;
  
  const columnaAActualizar = (nextMatch.prev_match_home_id === prevMatchId)
    ? 'home_team_id'
    : 'away_team_id';

  await pool.query(
    `UPDATE matches SET ${columnaAActualizar} = ? WHERE id = ?`,
    [teamId, nextMatchId]
  );
}