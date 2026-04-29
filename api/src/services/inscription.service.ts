import * as inscriptionModel from './../models/inscription.model';

export async function getByTournament(tournamentId: number) {
    return inscriptionModel.findByTournament(tournamentId);
}

export async function inscribe(tournamentId: number, teamId: number, seed: any) {
    // Verificar que el torneo exista y esté en fase de inscripción
    const tournament = await inscriptionModel.findTournament(tournamentId);
    if (!tournament) {
        // const err = new Error('Torneo no encontrado');
        // err.statusCode = 404;
        // throw err;
        return false
    }
    if (!['draft', 'registration'].includes(tournament.status)) {
        return false
    }

    // Verificar que el equipo exista
    const team = await inscriptionModel.findTeam(teamId);
    if (!team) {
        // const err = new Error('Equipo no encontrado');
        // err.statusCode = 404;
        // throw err;
        return false
    }

    // Verificar que no esté ya inscrito
    const existing = await inscriptionModel.findOne(tournamentId, teamId);
    if (existing) {
        // const err = new Error('El equipo ya está inscrito en este torneo');
        // err.statusCode = 409;
        // throw err;
        return false
    }

    // Verificar que no se supere el máximo de equipos
    const count = await inscriptionModel.countTeams(tournamentId);
    if (count >= tournament.max_teams) {
        // const err = new Error(`El torneo ya alcanzó el máximo de ${tournament.max_teams} equipos`);
        // err.statusCode = 409;
        // throw err;
        return false
    }

    await inscriptionModel.insert(tournamentId, teamId, seed);
    return inscriptionModel.findOne(tournamentId, teamId);
}

export async function update(tournamentId: number, teamId: number, data: any) {
    const existing = await inscriptionModel.findOne(tournamentId, teamId);
    if (!existing) return null;

    const allowed = ['seed', 'status'];
    const fields = {} as any;
    for (const key of allowed) {
        if (data[key] !== undefined) fields[key] = data[key];
    }

    if (Object.keys(fields).length === 0) return existing;

    await inscriptionModel.update(tournamentId, teamId, fields);
    return inscriptionModel.findOne(tournamentId, teamId);
}

export async function remove(tournamentId: number, teamId: number) {
    const existing = await inscriptionModel.findOne(tournamentId, teamId);
    if (!existing) return null;

    // No permitir desinscribir si el torneo ya está en progreso
    const tournament = await inscriptionModel.findTournament(tournamentId);
    if (tournament.status === 'in_progress') {
        // const err = new Error('No se puede desinscribir un equipo de un torneo en progreso');
        // err.statusCode = 409;
        // throw err;
        return false
    }

    await inscriptionModel.remove(tournamentId, teamId);
    return true;
}
