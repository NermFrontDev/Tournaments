import { RowDataPacket } from 'mysql2';
import { pool } from '../db/connection';

export async function findByTournament(tournamentId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      tt.team_id,
      tt.seed,
      tt.status        AS inscription_status,
      tt.registered_at,
      t.name           AS team_name,
      t.short_name,
      t.logo_url,
      t.contact_email
    FROM tournament_teams tt
    JOIN teams t ON t.id = tt.team_id
    WHERE tt.tournament_id = ?
    ORDER BY tt.seed ASC, t.name ASC
  `, [tournamentId]);
    return rows;
}

export async function findOne(tournamentId: number, teamId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      tt.tournament_id,
      tt.team_id,
      tt.seed,
      tt.status        AS inscription_status,
      tt.registered_at,
      t.name           AS team_name,
      t.short_name
    FROM tournament_teams tt
    JOIN teams t ON t.id = tt.team_id
    WHERE tt.tournament_id = ? AND tt.team_id = ?
  `, [tournamentId, teamId]);
    return rows[0] || null;
}

export async function findTournament(tournamentId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id, status, max_teams FROM tournaments WHERE id = ?',
        [tournamentId]
    );
    return rows[0] || null;
}

export async function findTeam(teamId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id, name FROM teams WHERE id = ?',
        [teamId]
    );
    return rows[0] || null;
}

export async function countTeams(tournamentId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT COUNT(*) AS total FROM tournament_teams WHERE tournament_id = ? AND status = 'confirmed'",
        [tournamentId]
    );
    return rows[0].total;
}

export async function insert(tournamentId: number, teamId: number, seed: any) {
    await pool.query(`
    INSERT INTO tournament_teams (tournament_id, team_id, seed, status)
    VALUES (?, ?, ?, 'confirmed')
  `, [tournamentId, teamId, seed || null]);
}

export async function update(tournamentId: number, teamId: number, fields: any) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const set = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(
        `UPDATE tournament_teams SET ${set} WHERE tournament_id = ? AND team_id = ?`,
        [...values, tournamentId, teamId]
    );
}

export async function remove(tournamentId: number, teamId: number) {
    await pool.query(
        'DELETE FROM tournament_teams WHERE tournament_id = ? AND team_id = ?',
        [tournamentId, teamId]
    );
}
