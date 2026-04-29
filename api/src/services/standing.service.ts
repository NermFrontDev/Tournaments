import * as standingModel from '../models/standing.model';

export async function getByTournament(tournamentId: number) {
    return standingModel.findByTournament(tournamentId);
}
export async function getByGroup(tournamentId: number, groupId: number) {
    return standingModel.findByGroup(tournamentId, groupId);
}
