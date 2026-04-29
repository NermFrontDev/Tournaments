import * as roundModel from '../models/round.model';

export async function getByTournament(tournamentId: number) {
    return roundModel.findByTournament(tournamentId);
}

export async function getById(roundId: number) {
    return roundModel.findById(roundId);
}

export async function create(tournamentId: number, data: any) {
    // Verificar que el torneo exista
    const tournament = await roundModel.findTournament(tournamentId);
    if (!tournament) {
        // const err = new Error('Torneo no encontrado');
        // err.statusCode = 404;
        // throw err;
        return false
    }

    // Verificar que round_order no esté duplicado en el torneo
    const duplicate = await roundModel.findByOrder(tournamentId, data.round_order);
    if (duplicate) {
        // const err = new Error(`Ya existe una ronda con order ${data.round_order} en este torneo`);
        // err.statusCode = 409;
        // throw err;
        return false
    }

    const id = await roundModel.insert(tournamentId, data);
    return roundModel.findById(id);
}

export async function update(roundId: number, data: any) {
    const exists = await roundModel.findById(roundId);
    if (!exists) return null;

    const allowed = ['name', 'status', 'round_order'];
    const fields = {} as any;
    for (const key of allowed) {
        if (data[key] !== undefined) fields[key] = data[key];
    }

    const validStatuses = ['pending', 'in_progress', 'finished'];
    if (fields.status && !validStatuses.includes(fields.status)) {
        // const err = new Error(`status inválido. Valores permitidos: ${validStatuses.join(', ')}`);
        // err.statusCode = 400;
        // throw err;
        return false
    }

    if (Object.keys(fields).length === 0) return exists;

    await roundModel.update(roundId, fields);
    return roundModel.findById(roundId);
}

export async function remove(roundId: any) {
    const exists = await roundModel.findById(roundId);
    if (!exists) return null;

    // No permitir eliminar si ya tiene partidos asociados
    const matchCount = await roundModel.countMatches(roundId);
    if (matchCount > 0) {
        // const err = new Error(`No se puede eliminar una ronda que tiene ${matchCount} partido(s) asociado(s)`);
        // err.statusCode = 409;
        // throw err;
        return false
    }

    await roundModel.remove(roundId);
    return true;
}