import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db/connection';
import { Team } from '../types/team.interface';

export async function findAll() {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      t.id,
      t.name,
      t.short_name,
      t.logo_url,
      t.contact_email,
      t.contact_phone,
      t.created_at,
      t.coach,
      COUNT(tt.tournament_id) AS tournaments_played
    FROM teams t
    LEFT JOIN tournament_teams tt ON tt.team_id = t.id AND tt.status = 'confirmed'
    GROUP BY t.id
    ORDER BY t.name ASC
  `);
  return rows;
}

// Trae un equipo por id con el detalle de sus torneos
export async function findById(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      t.id,
      t.name,
      t.short_name,
      t.logo_url,
      t.contact_email,
      t.contact_phone,
      t.created_at,
      t.coach
    FROM teams t
    WHERE t.id = ?
  `, [id]);

  if (!rows[0]) return null;

  // Torneos en los que está inscrito
  const [tournaments] = await pool.query<RowDataPacket[]>(`
    SELECT
      tr.id,
      tr.name,
      tr.format,
      tr.status,
      s.slug  AS sport,
      tt.seed,
      tt.status AS inscription_status
    FROM tournament_teams tt
    JOIN tournaments tr ON tr.id = tt.tournament_id
    JOIN sports      s  ON s.id  = tr.sport_id
    WHERE tt.team_id = ?
    ORDER BY tr.start_date DESC
  `, [id]);

  return { ...rows[0], tournaments };
}

export async function insert(data: Team) {
  const [result] = await pool.query<ResultSetHeader>(`
    INSERT INTO teams (name, short_name, logo_url, contact_email, contact_phone,coach)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    data.name,
    data.short_name || null,
    data.logo_url || null,
    data.contact_email || null,
    data.contact_phone || null,
    data.coach || null,
  ]);
  return result.insertId;
}

export async function update(id: number, fields: any) {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const set = keys.map(k => `${k} = ?`).join(', ');
  await pool.query(`UPDATE teams SET ${set} WHERE id = ?`, [...values, id]);
}

export async function remove(id: number) {
  await pool.query('DELETE FROM teams WHERE id = ?', [id]);
}

// Verifica si el equipo tiene torneos activos (para bloquear el delete)
export async function findActiveTournaments(teamId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT tr.id
    FROM tournament_teams tt
    JOIN tournaments tr ON tr.id = tt.tournament_id
    WHERE tt.team_id = ?
      AND tr.status IN ('registration', 'in_progress')
  `, [teamId]);
  return rows;
}