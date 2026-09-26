import {
    createInvitation,
    getTeamInvitations,
    deactivateInvitation,
    getInvitationByToken
} from "../services/teamInvitationService.js";


// ==========================================
// CREATE INVITATION
// ==========================================

export const createInvitationController = async (
    req,
    res,
    next
) => {

    try {

        const teamId =
            Number(req.params.teamId);

        const {
            expiresInDays
        } = req.body;


        const result =
            await createInvitation(
                teamId,
                req.user.id,
                expiresInDays ?? 7
            );


        /*
         * The frontend can construct the
         * complete invitation URL using
         * the returned token.
         */

        res.status(201).json({

            success: true,

            message:
                "Team invitation created successfully",

            data: {
                invitation:
                    result.invitation,

                team: {
                    id: result.team.id,
                    name: result.team.name
                }
            }

        });


    } catch (error) {

        next(error);

    }

};


// ==========================================
// GET TEAM INVITATIONS
// ==========================================

export const getTeamInvitationsController =
    async (
        req,
        res,
        next
    ) => {

        try {

            const teamId =
                Number(req.params.teamId);


            const invitations =
                await getTeamInvitations(
                    teamId,
                    req.user.id
                );


            res.status(200).json({

                success: true,

                data: {
                    invitations
                }

            });


        } catch (error) {

            next(error);

        }

    };


// ==========================================
// DEACTIVATE INVITATION
// ==========================================

export const deactivateInvitationController =
    async (
        req,
        res,
        next
    ) => {

        try {

            const teamId =
                Number(req.params.teamId);


            const invitationId =
                Number(
                    req.params.invitationId
                );


            const invitation =
                await deactivateInvitation(
                    teamId,
                    invitationId,
                    req.user.id
                );


            res.status(200).json({

                success: true,

                message:
                    "Invitation deactivated successfully",

                data: {
                    invitation
                }

            });


        } catch (error) {

            next(error);

        }

    };


// ==========================================
// GET INVITATION BY TOKEN
// ==========================================

export const getInvitationByTokenController =
    async (
        req,
        res,
        next
    ) => {

        try {

            const {
                token
            } = req.params;


            const invitation =
                await getInvitationByToken(
                    token
                );


            res.status(200).json({

                success: true,

                data: {
                    invitation
                }

            });


        } catch (error) {

            next(error);

        }

    };