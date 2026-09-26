import {
    getNotificationsService,
    markNotificationReadService,
    markAllNotificationsReadService
} from "../services/notificationService.js";

export const getNotifications = async (
    req,
    res,
    next
)=>{

    try{

        const notifications =
            await getNotificationsService(
                req.user.id
            );

        res.status(200).json({
            success:true,
            notifications
        });

    }
    catch(err){

        next(err);

    }

};

export const markNotificationRead = async (
    req,
    res,
    next
)=>{

    try{

        const { id } = req.params;

        await markNotificationReadService(
            id,
            req.user.id
        );

        res.status(200).json({
            success:true,
            message:"Notification marked as read"
        });

    }
    catch(err){

        next(err);

    }

};

export const markAllNotificationsRead = async (
    req,
    res,
    next
)=>{

    try{

        await markAllNotificationsReadService(
            req.user.id
        );

        res.status(200).json({
            success:true,
            message:"All notifications marked as read"
        });

    }
    catch(err){

        next(err);

    }

};