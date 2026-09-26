import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/");

    },

    filename: (req, file, cb) => {

        const extension =
            path.extname(file.originalname);

        const uniqueName =
            crypto.randomUUID() + extension;

        cb(null, uniqueName);

    }

});


const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",

    "application/pdf",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.ms-excel",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    "application/zip",

    "text/plain"
];


const fileFilter = (req, file, cb) => {

    if (
        allowedMimeTypes.includes(
            file.mimetype
        )
    ) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "File type is not allowed"
            ),
            false
        );

    }

};


const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024
    }

});


export default upload;