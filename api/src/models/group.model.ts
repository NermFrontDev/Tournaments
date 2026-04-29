import { pool } from '../db/connection';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function findByTournament(tournamentId: number) {
    const [groups] = await pool.query<RowDataPacket[]>(`
    SELECT
      g.id,
      g.name,
      g.tournament_id,
      COUNT(gt.team_id) AS teams_count
    FROM groups g
    LEFT JOIN group_teams gt ON gt.group_id = g.id
    WHERE g.tournament_id = ?
    GROUP BY g.id
    ORDER BY g.name ASC
  `, [tournamentId]);
    return groups;
}

export async function findById(groupId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id, tournament_id, name FROM groups WHERE id = ?',
        [groupId]
    );
    if (!rows[0]) return null;

    const [teams] = await pool.query(`
    SELECT
      t.id,
      t.name,
      t.short_name,
      t.logo_url
    FROM group_teams gt
    JOIN teams t ON t.id = gt.team_id
    WHERE gt.group_id = ?
    ORDER BY t.name ASC
  `, [groupId]);

    return { ...rows[0], teams };
}

export async function findTournament(tournamentId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id, status FROM tournaments WHERE id = ?',
        [tournamentId]
    );
    return rows[0] || null;
}

export async function findInscription(tournamentId: number, teamId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT 1 FROM tournament_teams WHERE tournament_id = ? AND team_id = ? AND status = 'confirmed'",
        [tournamentId, teamId]
    );
    return rows[0] || null;
}

export async function findTeamInTournamentGroups(tournamentId: number, teamId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT 1 FROM group_teams WHERE tournament_id = ? AND team_id = ?',
        [tournamentId, teamId]
    );
    return rows[0] || null;
}

export async function findGroupTeam(groupId: number, teamId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT 1 FROM group_teams WHERE group_id = ? AND team_id = ?',
        [groupId, teamId]
    );
    return rows[0] || null;
}

export async function insert(tournamentId: number, name: string) {
    const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO groups (tournament_id, name) VALUES (?, ?)',
        [tournamentId, name]
    );
    return result.insertId;
}

export async function insertTeam(groupId: number, teamId: number, tournamentId: number) {
    await pool.query(
        'INSERT INTO group_teams (group_id, team_id, tournament_id) VALUES (?, ?, ?)',
        [groupId, teamId, tournamentId]
    );
}

export async function removeTeam(groupId: number, teamId: number) {
    await pool.query(
        'DELETE FROM group_teams WHERE group_id = ? AND team_id = ?',
        [groupId, teamId]
    );
}

export async function remove(groupId: number) {
    await pool.query('DELETE FROM groups WHERE id = ?', [groupId]);
}
