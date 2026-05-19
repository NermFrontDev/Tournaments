import { pool } from '../db/connection';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export async function findTournament(tournamentId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT id, name, format, status, max_teams FROM tournaments WHERE id = ?',
        [tournamentId]
    );
    return rows[0] || null;
}

export async function findTeams(tournamentId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT
            tt.team_id,
            tt.seed,
            t.name AS team_name,
            t.short_name
        FROM tournament_teams tt
        JOIN teams t ON t.id = tt.team_id
        WHERE tt.tournament_id = ? AND tt.status = 'confirmed'
        ORDER BY tt.seed ASC, t.name ASC
    `, [tournamentId]);
    return rows;
}

export async function countRounds(tournamentId: number) {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT COUNT(*) AS total FROM rounds WHERE tournament_id = ?',
        [tournamentId]
    );
    return rows[0].total;
}

export async function insertRound(tournamentId: number, data: any) {
    const [result] = await pool.query<ResultSetHeader>(`
        INSERT INTO rounds (tournament_id, group_id, name, round_order, type, status)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [
        tournamentId,
        data.group_id  || null,
        data.name,
        data.round_order,
        data.type,
        data.status    || 'pending',
    ]);
    return result.insertId;
}

export async function insertMatch(tournamentId: number, data: any) {
    const [result] = await pool.query<ResultSetHeader>(`
        INSERT INTO matches (tournament_id, round_id, home_team_id, away_team_id, status)
        VALUES (?, ?, ?, ?, ?)
    `, [
        tournamentId,
        data.round_id,
        data.home_team_id || null,
        data.away_team_id || null,
        data.status       || 'scheduled',
    ]);
    return result.insertId;
}

export async function setTeamsInMatch(matchId: number, homeTeamId: number, awayTeamId: number) {
    await pool.query<ResultSetHeader>(
        'UPDATE matches SET home_team_id = ?, away_team_id = ? WHERE id = ?',
        [homeTeamId, awayTeamId, matchId]
    );
}

export async function setMatchParents(matchId: number, prevHomeId: number, prevAwayId: number) {
    await pool.query<ResultSetHeader>(
        'UPDATE matches SET prev_match_home_id = ?, prev_match_away_id = ? WHERE id = ?',
        [prevHomeId, prevAwayId, matchId]
    );
}

export async function updateMatchTeam(matchId: number, teamId: number, isHomeSlot: boolean) {
    const column = isHomeSlot ? 'home_team_id' : 'away_team_id';
    await pool.query<ResultSetHeader>(
        `UPDATE matches SET ${column} = ? WHERE id = ?`,
        [teamId, matchId]
    );
}

// BYE: no toca la BD
export async function registerBye(tournamentId: number, teamId: number) {
    return;
}

// Crea un grupo dentro del torneo
export async function insertGroup(tournamentId: number, name: string): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO groups (tournament_id, name) VALUES (?, ?)',
        [tournamentId, name]
    );
    return result.insertId;
}

// Agrega un equipo a un grupo
export async function insertGroupTeam(groupId: number, teamId: number, tournamentId: number) {
    await pool.query(
        'INSERT INTO group_teams (group_id, team_id, tournament_id) VALUES (?, ?, ?)',
        [groupId, teamId, tournamentId]
    );
}

export async function initStanding(tournamentId: number, groupId: number | null, teamId: number) {
    const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM standings WHERE tournament_id = ? AND team_id = ? AND (group_id = ? OR (group_id IS NULL AND ? IS NULL))',
        [tournamentId, teamId, groupId, groupId]
    );
    if (existing.length > 0) return;

    await pool.query(`
        INSERT INTO standings
            (tournament_id, group_id, team_id, played, won, drawn, lost, points, goals_for, goals_against, goal_diff)
        VALUES (?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0)
    `, [tournamentId, groupId, teamId]);
}

export async function updateTournamentStatus(tournamentId: number, status: string) {
    await pool.query(
        'UPDATE tournaments SET status = ? WHERE id = ?',
        [status, tournamentId]
    );
}