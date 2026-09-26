import {
    useParams
} from "react-router-dom";

import ProjectChat from "../components/chat/projectChat";


export default function ProjectChatPage() {

    const {
        projectId
    } = useParams();


    return (

        <div className="w-full">

            <ProjectChat
                projectId={projectId}
            />

        </div>

    );

}