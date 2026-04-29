import * as groupModel from './../models/group.model';

export async function getByTournament(tournamentId: number) {
    return groupModel.findByTournament(tournamentId);
}

export async function getById(groupId: number) {
    return groupModel.findById(groupId);
}

export async function create(tournamentId: number, name: string) {
    const tournament = await groupModel.findTournament(tournamentId);
    if (!tournament) {
        // const err = new Error('Torneo no encontrado');
        // err.statusCode = 404;
        // throw err;
        return false
    }
    const id = await groupModel.insert(tournamentId, name);
    return groupModel.findById(id);
}

export async function addTeam(tournamentId: number, groupId: number, teamId: number) {
    // El equipo debe estar inscrito en el torneo
    const inscribed = await groupModel.findInscription(tournamentId, teamId);
    if (!inscribed) {
        // const err = new Error('El equipo no está inscrito en este torneo');
        // err.statusCode = 409;
        // throw err;
        return false
    }

    // El equipo no puede estar ya en otro grupo del mismo torneo
    const inGroup = await groupModel.findTeamInTournamentGroups(tournamentId, teamId);
    if (inGroup) {
        // const err = new Error('El equipo ya pertenece a un grupo de este torneo');
        // err.statusCode = 409;
        // throw err;
        return false
    }

    await groupModel.insertTeam(groupId, teamId, tournamentId);
    return groupModel.findById(groupId);
}

export async function removeTeam(groupId: number, teamId: number) {
    const exists = await groupModel.findGroupTeam(groupId, teamId);
    if (!exists) return null;
    await groupModel.removeTeam(groupId, teamId);
    return true;
}

export async function remove(groupId: number) {
    const exists = await groupModel.findById(groupId);
    if (!exists) return null;
    await groupModel.remove(groupId);
    return true;
}
